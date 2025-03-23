import os
import logging
from flask import Flask
import google.generativeai as genai
# import cohere # we will import cohere in chatbot.py where it's actually used
from .core.notebook_manager import NotebookManager
from .config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure Gemini
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.error("No Google API key found in environment variables")
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

# Configure Cohere
COHERE_API_KEY = os.environ.get("COHERE_API_KEY")
if not COHERE_API_KEY:
    logger.error("No Cohere API key found in environment variables")
    raise ValueError("COHERE_API_KEY environment variable is not set")

# Define the base directory for storing uploaded files locally
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Create the folder if it doesn't exist
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Import and register routes from the api module
from backend.app.api.chatbot import chatbot_bp
app.register_blueprint(chatbot_bp)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False) 