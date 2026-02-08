# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.ingestion import ingest_track_with_dna
from api.reasoning import find_musical_bridge

@api_view(['POST'])
def generate_bridge(request):
    """
    Main endpoint: Ingest seeds, find bridges, return explanation.
    """
    seeds = request.data.get('seeds', [])
    
    if len(seeds) < 2 or len(seeds) > 3:
        return Response({
            "error": "Please provide 2-3 seed songs"
        }, status=400)
    
    ingestion_log = []
    
    # Phase 1: Ingest both seeds
    for seed in seeds:
        result = ingest_track_with_dna(
            seed['artist'], 
            seed['title'],
            ingest_similar=True
        )
        ingestion_log.append(result)
    
    # Phase 2: Find bridges using hardcoded query
    song_titles = [seed['title'] for seed in seeds]
    input_artists = [seed['artist'] for seed in seeds]
    result = find_musical_bridge(song_titles, input_artists)
    
    # Phase 3: Return structured response
    return Response({
        "status": "success",
        "ingestion_log": ingestion_log,
        "recommendations": result.get("recommendations", []),
        "summary": result.get("summary"),
        "debug": {
            "input_songs": [s['title'] for s in seeds],
            "total_bridges_found": len(result.get("recommendations", []))
        }
    })