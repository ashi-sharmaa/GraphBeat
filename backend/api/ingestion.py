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

def create_numeric_traits(song_node, bpm, energy, valence):
    """
    Creates normalized trait nodes that enable cross-genre discovery.
    These are the "bridges" that connect disparate artists.
    """
    # BPM Buckets (songs within ±10 BPM share a trait)
    bpm_bucket = (bpm // 10) * 10  # e.g., 128 BPM → 120, 171 BPM → 170
    bpm_trait = Trait.get_or_create({
        "value": f"{bpm_bucket}-{bpm_bucket+10} BPM",
        "type": "tempo"
    })[0]
    bpm_trait.save()
    song_node.traits.connect(bpm_trait)
    
    # Energy Tiers (High/Medium/Low)
    if energy >= 0.7:
        energy_label = "High Energy"
    elif energy >= 0.4:
        energy_label = "Medium Energy"
    else:
        energy_label = "Low Energy"
    
    energy_trait = Trait.get_or_create({
        "value": energy_label,
        "type": "energy"
    })[0]
    energy_trait.save()
    song_node.traits.connect(energy_trait)
    
    # Valence (Mood) - This is KEY for emotional bridges
    if valence >= 0.6:
        mood_label = "Uplifting"
    elif valence >= 0.3:
        mood_label = "Neutral"
    else:
        mood_label = "Melancholic"
    
    mood_trait = Trait.get_or_create({
        "value": mood_label,
        "type": "mood"
    })[0]
    mood_trait.save()
    song_node.traits.connect(mood_trait)
    
    # BPM Speed Category (additional layer for better matching)
    if bpm >= 140:
        speed_label = "Fast Tempo"
    elif bpm >= 100:
        speed_label = "Moderate Tempo"
    else:
        speed_label = "Slow Tempo"
    
    speed_trait = Trait.get_or_create({
        "value": speed_label,
        "type": "tempo_category"
    })[0]
    speed_trait.save()
    song_node.traits.connect(speed_trait)


def ingest_track_with_dna(artist_name, track_title, ingest_similar=True):
    """
    Orchestrates the fetching of DNA from Soundcharts/Last.fm 
    and saves the resulting Graph Nodes with enhanced trait connections.
    
    Args:
        ingest_similar: If True, also fetch traits for similar songs (creates bridges)
    """
    try:
        # --- PHASE A: API FETCHING ---
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

        sc_data = sc_response.get('items', [{}])[0]

        # 2. Create the Central Song Node
        song_node = Song.get_or_create({
            "track_id": f"{artist_name}-{track_title}".lower().replace(" ", "_"),
            "title": track_title,
            "bpm": sc_data.get('tempo', 120),
            "energy": sc_data.get('energy', 0.8),
            "valence": sc_data.get('valence', 0.5),
            "popularity": int(lastfm_track.get_playcount() or 0) % 100 
        })[0]
        song_node.save() 

        # 3. Connect Song to Artist
        song_node.artist.connect(artist_node)

        # 4. Create and Connect Traits
        create_numeric_traits(
            song_node, 
            song_node.bpm, 
            song_node.energy, 
            song_node.valence
        )

        # Add Last.fm vibe tags
        for tag in top_tags:
            tag_name = tag.item.get_name()
            trait_node = Trait.get_or_create({
                "value": tag_name.lower(), 
                "type": "vibe"
            })[0]
            trait_node.save()
            song_node.traits.connect(trait_node)

        # 5. Build Similarity Bridges WITH TRAITS
        if ingest_similar:
            for sim in similar_tracks:
                sim_artist_name = sim.item.artist.name
                sim_track_title = sim.item.title
                
                # Get Last.fm data for the similar song
                try:
                    sim_lastfm_track = lastfm_network.get_track(sim_artist_name, sim_track_title)
                    sim_tags = sim_lastfm_track.get_top_tags(limit=3)
                    
                    # Create or get the similar song node
                    sim_song_node = Song.get_or_create({
                        "track_id": f"{sim_artist_name}-{sim_track_title}".lower().replace(" ", "_"),
                        "title": sim_track_title,
                        "bpm": 120,  # Default for now (could fetch from Soundcharts)
                        "energy": 0.7,
                        "valence": 0.5,
                        "popularity": int(sim_lastfm_track.get_playcount() or 0) % 100
                    })[0]
                    sim_song_node.save()
                    
                    # Create artist for similar song
                    sim_artist_node = Artist.get_or_create({"name": sim_artist_name})[0]
                    sim_artist_node.save()
                    sim_song_node.artist.connect(sim_artist_node)
                    
                    # **KEY FIX**: Add traits to similar songs
                    create_numeric_traits(
                        sim_song_node,
                        sim_song_node.bpm,
                        sim_song_node.energy,
                        sim_song_node.valence
                    )
                    
                    # Add vibe tags to similar songs
                    for tag in sim_tags:
                        tag_name = tag.item.get_name()
                        trait_node = Trait.get_or_create({
                            "value": tag_name.lower(),
                            "type": "vibe"
                        })[0]
                        trait_node.save()
                        sim_song_node.traits.connect(trait_node)
                    
                    # Connect via SIMILAR_TO
                    song_node.similar_songs.connect(sim_song_node)
                    
                except Exception as e:
                    print(f"Skipping similar song {sim_track_title}: {e}")
                    continue

        return f"✓ Successfully ingested '{track_title}' by {artist_name} with {len(top_tags)} vibe tags and {len(similar_tracks)} similar songs."

    except Exception as e:
        return f"✗ Ingestion failed for {track_title}: {str(e)}"

# --- SPRINT TESTING LOGIC ---
if __name__ == "__main__":
    # Test with both bridge candidates
    print(ingest_track_with_dna("Daft Punk", "One More Time"))
    print(ingest_track_with_dna("The Weeknd", "Blinding Lights"))