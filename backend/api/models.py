from django.db import models

# Create your models here.
from neomodel import (
    StructuredNode, StringProperty, IntegerProperty, 
    FloatProperty, RelationshipTo, RelationshipFrom, config
)
# Backend A: This defines the core Knowledge Graph structure 

class Trait(StructuredNode):
    """
    Represents technical DNA traits (e.g., 'High Energy') 
    and Last.fm 'Vibe' tags[cite: 9, 15].
    """
    value = StringProperty(unique_index=True, required=True)
    type = StringProperty(required=True) # e.g., 'tempo', 'key', or 'vibe'

    # Back-reference to songs that share this trait
    songs = RelationshipFrom('Song', 'HAS_TRAIT')

class Artist(StructuredNode):
    """
    The creator of the track[cite: 15].
    """
    name = StringProperty(unique_index=True, required=True)
    genre = StringProperty()

    songs = RelationshipFrom('Song', 'PERFORMED_BY')

class Song(StructuredNode):
    """
    The central node enriched with Soundcharts DNA and Last.fm metadata[cite: 14, 15].
    """
    title = StringProperty(required=True)
    track_id = StringProperty(unique_index=True, required=True) # Used for API syncing
    
    # Numeric DNA from Soundcharts API [cite: 10, 15]
    bpm = IntegerProperty()
    energy = FloatProperty()
    valence = FloatProperty()
    musical_key = StringProperty()
    
    # Social Metadata from Last.fm for "Hipster" Logic 
    popularity = IntegerProperty(default=0)
    
    # Relationships 
    artist = RelationshipTo('Artist', 'PERFORMED_BY')
    traits = RelationshipTo('Trait', 'HAS_TRAIT')

    similar_songs = RelationshipTo('Song', 'SIMILAR_TO')