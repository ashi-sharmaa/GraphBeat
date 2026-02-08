# GraphBeat: AI-Powered Music Discovery Through Knowledge Graphs

GraphBeat is a music discovery engine that finds hidden connections between songs using a Neo4j knowledge graph and AI reasoning. Instead of relying on popularity or collaborative filtering, GraphBeat analyzes **Musical DNA**—objective attributes like BPM, energy, and mood—to discover "bridge" tracks that connect your favorite songs across genres and eras.

The system ingests technical data from Soundcharts and Last.fm, builds a graph of songs linked by shared traits, and uses AI (Llama 3.3) to generate personalized explanations for each recommendation, revealing exactly why these bridges work.

---

## Tech Stack

**Frontend:**
- React (Vite), Tailwind CSS

**Backend:**
- Django (Python 3.13+), Django REST Framework
- Neo4j AuraDB (Graph Database)
- neomodel (Object Graph Mapper)

**AI/Reasoning:**
- LangChain, Groq (Llama 3.3-70b-versatile)

**Data Sources:**
- Soundcharts API (BPM, energy, valence)
- Last.fm API (tags, similar tracks)

---

## How It Works

1. **Input 2-3 Songs**: User provides their favorite tracks (e.g., "One More Time" by Daft Punk + "Blinding Lights" by The Weeknd)

2. **Shadow Graphing**: System automatically ingests each song plus 5 similar tracks to build a local discovery neighborhood

3. **Trait Normalization**: Creates quantized musical traits:
   - Tempo buckets (120-130 BPM, 170-180 BPM, etc.)
   - Energy levels (High/Medium/Low)
   - Mood categories (Uplifting/Neutral/Melancholic)
   - Genre/vibe tags from Last.fm

4. **Graph Traversal**: Cypher queries find songs that share traits with ALL input tracks

5. **AI Explanations**: LLM generates personalized explanations for each recommendation, breaking down the specific musical characteristics that form the "bridge"

---

## Key Features

- **Cross-Genre Discovery**: Finds connections between seemingly unrelated artists through shared musical DNA
- **Shadow Graph Network**: Automatically expands the knowledge graph with similar tracks for richer recommendations
- **Trait-Based Matching**: Connects songs through objective metrics (tempo, energy, mood) rather than popularity
- **Transparent AI**: Each recommendation comes with a detailed explanation of the shared musical traits
- **Multi-Song Input**: Supports 2-3 input songs to find more nuanced musical bridges

---

## Getting Started

### Prerequisites
- Python 3.13+
- Node.js & npm
- Neo4j Aura account (free tier works)
- API keys: Soundcharts, Last.fm, Groq

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # Mac/Linux
   # OR
   .venv\Scripts\activate  # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Create a `.env` file in `/backend` with:
   ```
   NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your-password
   GROQ_API_KEY=your-groq-key
   SOUNDCHARTS_APP_ID=your-app-id
   SOUNDCHARTS_API_KEY=your-api-key
   LASTFM_API_KEY=your-lastfm-key
   LASTFM_SECRET=your-lastfm-secret
   ```

5. **Start the server:**
   ```bash
   python manage.py runserver
   ```
   Server runs at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install packages:**
   ```bash
   npm install
   ```

3. **Launch development server:**
   ```bash
   npm run dev
   ```

---

## Future Enhancements

- Weighted edges: factor in how strong a trait connection is (e.g., BPM within 5 vs within 20)
- 3D graph visualization of musical connections
- Spotify OAuth login: pull a user's top tracks/playlists as seeds automatically
- "Explore deeper" button on a result card that re-runs the algorithm using that bridge song as a new seed

---

**Built for WICS Hacks 2026 🎵
