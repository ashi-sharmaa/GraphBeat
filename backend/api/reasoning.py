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

def find_bridges(song_titles):
    """
    Execute hardcoded Cypher query for 2 or 3 input songs.
    Returns list of bridge songs with shared traits.
    """
    # Build parameters
    song_params = {f"song{i}": title for i, title in enumerate(song_titles)}
    
    # Build MATCH pattern based on number of songs
    if len(song_titles) == 2:
        match_pattern = """
        MATCH (s1:Song {title: $song0})-[:HAS_TRAIT]->(t:Trait)<-[:HAS_TRAIT]-(s2:Song {title: $song1})
        """
    elif len(song_titles) == 3:
        match_pattern = """
        MATCH (s1:Song {title: $song0})-[:HAS_TRAIT]->(t:Trait)<-[:HAS_TRAIT]-(s2:Song {title: $song1})
        MATCH (s2)-[:HAS_TRAIT]->(t)<-[:HAS_TRAIT]-(s3:Song {title: $song2})
        """
    else:
        raise ValueError("Only 2-3 songs supported")
    
    # Build exclusion list for WHERE clause
    exclusion_list = ", ".join([f"${k}" for k in song_params.keys()])
    
    query = match_pattern + f"""
    WITH DISTINCT t
    MATCH (bridge:Song)-[:HAS_TRAIT]->(t)
    WHERE NOT bridge.title IN [{exclusion_list}]
    WITH bridge, collect(DISTINCT t.value) as shared_traits
    MATCH (bridge)-[:PERFORMED_BY]->(artist:Artist)
    RETURN bridge.title as title, artist.name as artist, shared_traits, size(shared_traits) as trait_count
    ORDER BY trait_count DESC
    LIMIT 2
    """
    
    results, meta = db.cypher_query(query, song_params)
    
    if not results:
        return []
    
    bridges = []
    for row in results:
        bridges.append({
            "title": row[0],
            "artist": row[1],
            "shared_traits": row[2],
            "trait_count": row[3]
        })
    
    return bridges

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
        prompt = f"""You're a music discovery expert. Explain in 1-2 sentences why "{bridge['title']}" by {bridge['artist']} is a perfect bridge between {input_songs_str}.

Focus on these shared musical traits: {', '.join(bridge['shared_traits'][:4])}

Be enthusiastic and insightful. Write conversationally, no bullet points.

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

def generate_summary(song_titles, recommendations):
    """
    Generate overall summary of the musical connection.
    """
    if not recommendations:
        return "No bridges found. These songs might not share enough musical DNA yet."
    
    bridge_titles = [r['title'] for r in recommendations]
    
    if len(song_titles) == 2:
        input_str = f"'{song_titles[0]}' and '{song_titles[1]}'"
    else:
        input_str = f"'{song_titles[0]}', '{song_titles[1]}', and '{song_titles[2]}'"
    
    prompt = f"""You're a music curator. In 1-2 sentences, explain the overall musical DNA that connects these bridge recommendations.

Input songs: {input_str}
Bridge songs found: {', '.join(bridge_titles)}

Focus on the shared sonic characteristics. Be concise and insightful.

Summary:"""
    
    try:
        response = llm.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print(f"Summary generation error: {e}")
        return f"These bridges connect your {len(song_titles)} input songs through shared energy, tempo, and mood characteristics."

def find_musical_bridge(song_titles):
    """
    Main entry point - takes list of 2-3 song titles and returns structured recommendations.
    
    Args:
        song_titles: List of 2-3 song title strings
        
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
    bridges = find_bridges(song_titles)
    
    if not bridges:
        return {
            "recommendations": [],
            "summary": "No bridge songs found that share traits with all your input songs. Try ingesting more similar tracks or choosing songs with more musical overlap."
        }
    
    # Generate per-recommendation explanations
    recommendations = generate_individual_explanations(song_titles, bridges)
    
    # Generate overall summary
    summary = generate_summary(song_titles, recommendations)
    
    return {
        "recommendations": recommendations,
        "summary": summary
    }