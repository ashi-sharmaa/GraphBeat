import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_neo4j import Neo4jGraph, GraphCypherQAChain
from langchain_core.prompts import PromptTemplate

# Load environment variables from .env
load_dotenv()

# 1. Connect to the Graph using the modern Neo4jGraph class
graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD"),
    refresh_schema=False 
)

# 2. Setup the Brain (Groq)
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile",
    temperature=0  # Zero temperature ensures high accuracy for Cypher
)

# 3. Enhanced "Musicologist" Prompt
# I updated the schema below to include the track_id and musical_key fields 
# your partner just created in models.py.
CYPHER_GENERATION_TEMPLATE = """
Task: Generate a Cypher query for a Neo4j graph.
The database has the following schema:
Nodes: 
  :Song (title, track_id, bpm, energy, valence, musical_key, popularity)
  :Artist (name, genre)
  :Trait (value, type)

Relationships: 
  (:Song)-[:PERFORMED_BY]->(:Artist)
  (:Song)-[:HAS_TRAIT]->(:Trait)
  (:Song)-[:SIMILAR_TO]->(:Song)

Instructions:
1. Use ONLY the provided relationship types and properties.
2. When asked for a 'bridge' or connection, find the shortestPath between two :Song nodes.
3. For 'Hipster' or 'Deep Cut' requests, filter for :Song nodes where popularity < 30.
4. If a user asks about the 'vibe', look for :Trait nodes where type = 'vibe'.
5. If no direct relationship exists, find songs that share a common :Trait or are connected through a :SIMILAR_TO relationship

Question: {question}
Cypher Query:"""

cypher_prompt = PromptTemplate(
    template=CYPHER_GENERATION_TEMPLATE, 
    input_variables=["question"]
)

# 4. Initialize the Chain using the new langchain-neo4j package
chain = GraphCypherQAChain.from_llm(
    llm,
    graph=graph,
    cypher_prompt=cypher_prompt,
    verbose=True, # Shows the AI's thought process in the terminal [cite: 15.3
    allow_dangerous_requests=True
)