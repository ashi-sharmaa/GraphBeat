import os
import django

# 1. Point to your settings file (usually 'backend.settings' or 'core.settings')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') 

# 2. Wake up Django
django.setup()

from api.reasoning import chain
from api.ingestion import ingest_track_with_dna
print("Both AI and Ingestion files are talking to the libraries!")