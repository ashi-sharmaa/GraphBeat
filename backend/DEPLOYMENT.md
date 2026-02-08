# Backend Deployment Guide

## Deploy to Render (Recommended)

Render is a modern cloud platform with a free tier that's perfect for Django apps.

### Step 1: Prepare the Repository
```bash
git add backend/
git commit -m "Add deployment configuration (render.yaml, Procfile, requirements.txt updates)"
git push
```

### Step 2: Create Render Service
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `graphbeat-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn core.wsgi:application`
5. Add Environment Variables (see below)
6. Click "Create Web Service"

### Step 3: Set Environment Variables
In the Render dashboard, add these environment variables:

**Essential:**
- `SECRET_KEY` - Generate a random string for production
- `DEBUG` - Set to `False`
- `ALLOWED_HOSTS` - Your Render domain (e.g., `graphbeat-backend.onrender.com`)
- `NEO4J_URI` - Your Neo4j database URI
- `NEO4J_USERNAME` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password

**API Keys:**
- `SOUNDCHARTS_APP_ID`
- `SOUNDCHARTS_API_KEY`
- `LASTFM_API_KEY`
- `LASTFM_SECRET`
- `GROQ_API_KEY`

**CORS:**
- `CORS_ALLOWED_ORIGINS` - Your frontend URL (e.g., `https://your-site.netlify.app`)

### Step 4: Connect Frontend
Update your frontend's API base URL to point to your Render backend:
```javascript
const API_URL = 'https://graphbeat-backend.onrender.com'
```

## Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project
3. Add a Python service from your GitHub repo
4. Railway auto-detects the Procfile
5. Add the same environment variables as above
6. Deploy

## Testing Your Deployment

Once deployed, test the API:
```bash
curl https://your-backend.onrender.com/api/recommend/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"seeds": [{"name": "Track", "artist": "Artist"}]}'
```

## Common Issues

- **Static files not loading**: Whitenoise is configured in settings.py
- **CORS errors**: Make sure `CORS_ALLOWED_ORIGINS` includes your frontend URL
- **Database connection**: Verify `NEO4J_URI`, `NEO4J_USERNAME`, and `NEO4J_PASSWORD`
- **Import errors**: All dependencies are in `requirements.txt`
