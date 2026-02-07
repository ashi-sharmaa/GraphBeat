import os
import requests
import pylast
from django.conf import settings
from api.models import Song, Artist, Trait

# 1. Setup Last.fm Network for "Vibe" and Similarity data
lastfm_network = pylast.LastFMNetwork(
    api_key=settings.LASTFM_API_KEY,
    api_secret=settings.LASTFM_SECRET
)

def ingest_track_with_dna(artist_name, track_title):
    """
    Orchestrates the fetching of DNA from Soundcharts/Last.fm 
    and saves the resulting Graph Nodes.
    """
    try:
        # --- PHASE A: API FETCHING ---
        # Get Soundcharts DNA (BPM, Energy, Valence)
        # Note: In a production loop, you'd use the Soundcharts UUID 
        # but for the sprint, we search by artist name.
        sc_headers = {
            "x-app-id": settings.SOUNDCHARTS_APP_ID,
            "x-api-key": settings.SOUNDCHARTS_API_KEY
        }
        sc_search_url = f"https://customer.api.soundcharts.com/api/v2/artist/search/{artist_name}"
        sc_response = requests.get(sc_search_url, headers=sc_headers).json()
        
        # Get Last.fm Similarity and Tags
        lastfm_track = lastfm_network.get_track(artist_name, track_title)
        similar_tracks = lastfm_track.get_similar(limit=5)
        top_tags = lastfm_track.get_top_tags(limit=3)

       # --- PHASE B: NEO4J PERSISTENCE ---
        # 1. Create or Update Artist Node
        artist_node = Artist.get_or_create({"name": artist_name})[0]
        artist_node.save() 

        # 2. Create the Central Song Node
        song_node = Song.get_or_create({
            "track_id": f"{artist_name}-{track_title}".lower().replace(" ", "_"),
            "title": track_title,
            "bpm": 120, 
            "energy": 0.8,
            "popularity": int(lastfm_track.get_playcount() or 0) % 100 
        })[0]
        song_node.save() # Crucial: Save before connecting

        # 3. Connect Song to Artist
        song_node.artist.connect(artist_node)

        # 4. Create and Connect Traits
        for tag in top_tags:
            tag_name = tag.item.get_name()
            trait_node = Trait.get_or_create({"value": tag_name, "type": "vibe"})[0]
            trait_node.save()
            song_node.traits.connect(trait_node)

        # 5. Build Similarity Bridges
        for sim in similar_tracks:
            sim_artist_name = sim.item.artist.name
            sim_track_title = sim.item.title
            
            sim_song_node = Song.get_or_create({
                "track_id": f"{sim_artist_name}-{sim_track_title}".lower().replace(" ", "_"),
                "title": sim_track_title
            })[0]
            sim_song_node.save() # Must save the shadow node first!
            song_node.similar_songs.connect(sim_song_node)

        return f"Successfully ingested '{track_title}' and created graph relationships."

    except Exception as e:
        return f"Ingestion failed for {track_title}: {str(e)}"

# --- SPRINT TESTING LOGIC ---
if __name__ == "__main__":
    # Test with a classic "Bridge" song
    print(ingest_track_with_dna("Daft Punk", "One More Time"))