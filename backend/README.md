# Gemini Medical Data Analysis Backend

This is the backend service for the Gemini Medical Data Analysis application. It provides APIs for data upload, analysis, and interaction with the Gemini AI model.

## Features

- File upload API for medical dataset files
- Integration with Google's Gemini AI model
- Support for research workflow automation
- Project and user session management

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py         # Entry point for the application
│   ├── api/            # Handles API endpoints for user interaction
│   │   ├── __init__.py
│   │   └── chatbot.py  # Endpoints for file upload, asking questions, and getting answers
│   ├── core/           # Core logic for managing users and files
│   │   ├── __init__.py
│   │   ├── user_management.py # Handles user authentication and session management
│   │   └── file_management.py # Handles file uploads, storage, and retrieval
│   ├── models/         # Data models
│   │   ├── __init__.py
│   │   └── project.py  # Model for project data
│   ├── database/       # Handles database interactions
│   │   ├── __init__.py
│   │   └── database_client.py # Client for connecting to the database
│   └── config.py       # Application configuration
├── docker/
│   ├── Dockerfile
│   └── requirements.txt
└── README.md
```

## Setup

### Local Development

1. Create a virtual environment and install dependencies:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\bin\activate
   pip install -r backend/docker/requirements.txt
   ```

2. Set up your Google API key:
   ```
   export GOOGLE_API_KEY="your_gemini_api_key"
   ```

3. Run the application:
   ```
   export PYTHONPATH=.
   python backend/app/main.py
   ```

4. The API server will be available at `http://localhost:8080`

### Docker Deployment

1. Build the Docker image:
   ```
   docker build -t gemini-medical-backend -f backend/docker/Dockerfile .
   ```

2. Run the container locally:
   ```
   docker run -p 8080:8080 -e COHERE_API_KEY="cohere-api-key" GOOGLE_API_KEY="your_gemini_api_key" gemini-medical-backend
   ```

### Google Cloud Run Deployment

1. Tag your Docker image:
   ```
   docker tag gemini-medical-backend gcr.io/[your-gcp-project-id]/gemini-medical-backend
   ```

2. Push to Google Container Registry:
   ```
   docker push gcr.io/[your-gcp-project-id]/gemini-pandas-demo
   ```

3. Deploy to Cloud Run:
   ```
   gcloud run deploy gemini-pandas-service \
       --image gcr.io/[your-gcp-project-id]/gemini-pandas-demo \
       --region [your-cloud-run-region] \
       --update-env-vars GOOGLE_API_KEY="your_gemini_api_key" \
       --platform managed
   ````

## API Endpoints

- **POST /chat/initiate**: Initialize a new chat session
- **POST /chat/message**: Send a message to the Gemini model
- **POST /upload_file**: Upload a medical data file
- **POST /ask**: Ask a question about the uploaded data
- **POST /answer**: Process user feedback and continue to the next step

## Security Considerations

This application connects to Gemini AI and executes analysis on medical data. Ensure proper security measures are in place for any production deployment. 