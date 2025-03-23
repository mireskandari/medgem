import os

# Application configuration settings

# API settings
API_VERSION = "v1"

# Database settings
# These would be used in production with a real database
DATABASE_HOST = os.environ.get("DATABASE_HOST", "localhost")
DATABASE_PORT = os.environ.get("DATABASE_PORT", "5432")
DATABASE_NAME = os.environ.get("DATABASE_NAME", "app_db")
DATABASE_USER = os.environ.get("DATABASE_USER", "app_user")
DATABASE_PASSWORD = os.environ.get("DATABASE_PASSWORD", "")

# Gemini API settings
GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

# File storage settings
UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

# Security settings
SECRET_KEY = os.environ.get("SECRET_KEY", "dev_key_change_in_production")

class Settings:
    # ... existing settings ...
    
    # Add new settings for notebooks and code execution
    NOTEBOOKS_DIR: str = os.getenv("NOTEBOOKS_DIR", "notebooks")
    MAX_CODE_EXECUTION_TIME: int = int(os.getenv("MAX_CODE_EXECUTION_TIME", "30"))  # seconds
    ENABLE_CODE_EXECUTION: bool = os.getenv("ENABLE_CODE_EXECUTION", "True").lower() == "true"
    
    # Cohere settings
    COHERE_MODEL_NAME = os.environ.get("COHERE_MODEL_NAME", "command-r-plus")
    
    # ... rest of the settings class ...

# Create a settings instance
settings = Settings()

# ... rest of the config module ... 