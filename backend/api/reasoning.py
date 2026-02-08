import os
import re
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_neo4j import Neo4jGraph
from neomodel import db

load_dotenv()

# Connect to Neo4j
graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD"),
    refresh_schema=False 
)

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile",
    temperature=0.3  # Slight creativity for explanations
)

def find_bridges(song_titles, input_artists=None):
    """
    Execute hardcoded Cypher query for 2 or 3 input songs.
    Uses weighted scoring (numeric traits 2pts > vibe tags 1pt),
    enforces artist diversity, and falls back to SIMILAR_TO edges.
    """
    input_artists = input_artists or []
    song_params = {f"song{i}": title for i, title in enumerate(song_titles)}

    if len(song_titles) == 2:
        match_pattern = """
        MATCH (s1:Song {title: $song0})-[:HAS_TRAIT]->(t:Trait)<-[:HAS_TRAIT]-(s2:Song {title: $song1})
        """
    elif len(song_titles) == 3:
        match_pattern = """
        MATCH (s1:Song {title: $song0})-[:HAS_TRAIT]->(t:Trait)<-[:HAS_TRAIT]-(s2:Song {title: $song1})
        MATCH (s3:Song {title: $song2})-[:HAS_TRAIT]->(t)
        """
    else:
        raise ValueError("Only 2-3 songs supported")

    exclusion_list = ", ".join([f"${k}" for k in song_params.keys()])

    # Weighted scoring: numeric traits (2pts) > vibe tags (1pt)
    # Exclude input artists so bridges are true discoveries
    # Fetch extra candidates (LIMIT 8) for artist diversity filtering in Python
    query = match_pattern + f"""
    WITH DISTINCT t
    MATCH (bridge:Song)-[:HAS_TRAIT]->(t)
    WHERE NOT bridge.title IN [{exclusion_list}]
    WITH bridge, t,
      CASE WHEN t.type IN ['tempo', 'energy', 'mood', 'tempo_category'] THEN 2 ELSE 1 END as weight
    WITH bridge, sum(weight) as score, collect(DISTINCT t.value) as shared_traits
    MATCH (bridge)-[:PERFORMED_BY]->(artist:Artist)
    WHERE NOT artist.name IN $input_artists
    RETURN bridge.title as title, artist.name as artist, shared_traits, size(shared_traits) as trait_count, score
    ORDER BY score DESC
    LIMIT 8
    """

    song_params["input_artists"] = input_artists
    results, meta = db.cypher_query(query, song_params)

    # --- Layer 1: Pick top 2 with different artists ---
    bridges = []
    seen_artists = set()
    for row in results:
        artist = row[1]
        if artist not in seen_artists:
            bridges.append({
                "title": row[0],
                "artist": artist,
                "shared_traits": row[2],
                "trait_count": row[3],
                "score": row[4]
            })
            seen_artists.add(artist)
        if len(bridges) >= 2:
            break

    # --- Layer 2: Fallback to SIMILAR_TO if < 2 diverse bridges ---
    if len(bridges) < 2:
        bridges = _fallback_similar_to(song_titles, input_artists, bridges, seen_artists)

    # --- Layer 3: If still < 2, allow same artist rather than fewer results ---
    if len(bridges) < 2:
        seen_titles = {b["title"] for b in bridges}
        for row in results:
            if row[0] not in seen_titles:
                bridges.append({
                    "title": row[0],
                    "artist": row[1],
                    "shared_traits": row[2],
                    "trait_count": row[3],
                    "score": row[4]
                })
            if len(bridges) >= 2:
                break

    return bridges


def _fallback_similar_to(song_titles, input_artists, existing_bridges, seen_artists):
    """
    Fallback: find bridges via SIMILAR_TO edges when HAS_TRAIT returns < 2.
    """
    exclude_titles = list(song_titles) + [b["title"] for b in existing_bridges]
    exclude_artists = list(seen_artists) + list(input_artists)

    query = """
    MATCH (s:Song)-[:SIMILAR_TO]->(bridge:Song)-[:PERFORMED_BY]->(artist:Artist)
    WHERE s.title IN $input_songs AND NOT bridge.title IN $exclude AND NOT artist.name IN $exclude_artists
    OPTIONAL MATCH (bridge)-[:HAS_TRAIT]->(t:Trait)
    WITH bridge, artist, collect(DISTINCT t.value) as traits
    RETURN bridge.title as title, artist.name as artist, traits
    LIMIT 4
    """

    results, meta = db.cypher_query(query, {
        "input_songs": list(song_titles),
        "exclude": exclude_titles,
        "exclude_artists": exclude_artists
    })

    for row in results:
        artist = row[1]
        if artist not in seen_artists:
            existing_bridges.append({
                "title": row[0],
                "artist": artist,
                "shared_traits": row[2],
                "trait_count": len(row[2]),
                "score": 0
            })
            seen_artists.add(artist)
        if len(existing_bridges) >= 2:
            break

    return existing_bridges

def generate_individual_explanations(song_titles, bridges):
    """
    Generate a unique explanation for each bridge recommendation.
    """
    if not bridges:
        return []
    
    # Format input songs nicely
    if len(song_titles) == 2:
        input_songs_str = f"'{song_titles[0]}' and '{song_titles[1]}'"
    else:
        input_songs_str = f"'{song_titles[0]}', '{song_titles[1]}', and '{song_titles[2]}'"
    
    recommendations = []
    for bridge in bridges:
        prompt = f"""In 1 sentence, explain why "{bridge['title']}" by {bridge['artist']} connects {input_songs_str}.

Shared traits: {', '.join(bridge['shared_traits'][:4])}

Be specific about the music. No filler words like "masterfully" or "irresistible". Just say what connects them.

Explanation:"""
        
        try:
            response = llm.invoke(prompt)
            explanation = response.content.strip()
        except Exception as e:
            print(f"LLM error for {bridge['title']}: {e}")
            explanation = f"This track shares {bridge['trait_count']} musical traits with your input songs, including {', '.join(bridge['shared_traits'][:2])}."
        
        recommendations.append({
            "title": bridge["title"],
            "artist": bridge["artist"],
            "shared_traits": bridge["shared_traits"],
            "trait_count": bridge["trait_count"],
            "explanation": explanation
        })
    
    return recommendations

def find_musical_bridge(song_titles, input_artists=None):
    """
    Main entry point - takes list of 2-3 song titles and returns structured recommendations.

    Args:
        song_titles: List of 2-3 song title strings
        input_artists: List of artist names to exclude from results

    Returns:
        dict with 'recommendations' (list) and 'summary' (string)
    """
    # Validate input
    if not isinstance(song_titles, list) or len(song_titles) < 2 or len(song_titles) > 3:
        return {
            "error": "Please provide 2-3 songs as a list",
            "recommendations": [],
            "summary": ""
        }

    print(f"Finding bridges for: {song_titles}")

    # Execute query
    bridges = find_bridges(song_titles, input_artists)
    
    if not bridges:
        return {
            "recommendations": [],
            "summary": "No bridge songs found that share traits with all your input songs. Try ingesting more similar tracks or choosing songs with more musical overlap."
        }
    
    # Generate per-recommendation explanations
    recommendations = generate_individual_explanations(song_titles, bridges)

    return {
        "recommendations": recommendations,
    }