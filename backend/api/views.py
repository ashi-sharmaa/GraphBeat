from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.ingestion import ingest_track_with_dna
from api.reasoning import chain

class GenerateBridgeView(APIView):
    """
    The main 'GraphBeat' engine endpoint. 
    Accepts 5 seed songs and returns an AI-generated connection.
    """
    def post(self, request):
        # 1. Get the list of songs from the Frontend
        # Format: [{"artist": "Daft Punk", "title": "One More Time"}, ...]
        seeds = request.data.get('seeds', [])
        
        if not seeds or len(seeds) < 1:
            return Response({"error": "Please provide at least one seed song."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Parallel Ingestion: Fill the Graph with these specific seeds
        ingestion_results = []
        for song in seeds:
            result = ingest_track_with_dna(song.get('artist'), song.get('title'))
            ingestion_results.append(result)

        # 3. The 'Reasoning' Step: Ask the AI for the Bridge
        # We craft a specific question based on the seeds provided.
        artist_names = [s.get('artist') for s in seeds]
        question = f"Find a common musical bridge between {', '.join(artist_names)} based on their musical traits and energy."
        
        try:
            ai_response = chain.invoke({"query": question})
            
            return Response({
                "explanation": ai_response.get("result"),
                "ingestion_log": ingestion_results
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": f"AI Reasoning failed: {str(e)}",
                "ingestion_log": ingestion_results
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)