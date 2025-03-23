import os
import uuid
from datetime import datetime
import logging
from flask import current_app

# In-memory database for file metadata (for demonstration)
file_metadata_db = {}

logger = logging.getLogger(__name__)

def save_uploaded_file(file, user_id, paper_id):
    """Save an uploaded file and store its metadata
    
    Args:
        file: The uploaded file object
        user_id: The ID of the user uploading the file
        paper_id: The ID of the paper or project this file belongs to
        
    Returns:
        dict: Metadata about the saved file
    """
    # Generate a unique filename to avoid collisions
    unique_id = str(uuid.uuid4())[0:2]
    original_filename = file.filename
    filename_base, filename_ext = os.path.splitext(original_filename)
    unique_filename = f"{filename_base}_{unique_id}{filename_ext}"
    local_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)

    # Save file to local storage
    file.save(local_filepath)

    # Generate a unique ID for the file metadata
    file_id = str(uuid.uuid4())[0:2]
    
    # Store file metadata in the database
    file_metadata = {
        'file_id': file_id,
        'original_filename': original_filename,
        'local_filepath': local_filepath,
        'user_id': user_id,
        'paper_id': paper_id,
        'uploaded_at': datetime.now().isoformat()
    }
    file_metadata_db[file_id] = file_metadata

    logger.info(f"File '{original_filename}' saved to local storage at '{local_filepath}'")
    return file_metadata

def get_file_metadata(file_id):
    """Retrieve file metadata by ID
    
    Args:
        file_id: The ID of the file to retrieve
        
    Returns:
        dict: The file metadata or None if not found
    """
    return file_metadata_db.get(file_id)

def get_files_by_user_and_paper(user_id, paper_id):
    """Retrieve all files associated with a specific user and paper
    
    Args:
        user_id: The ID of the user
        paper_id: The ID of the paper or project
        
    Returns:
        list: A list of file metadata for the matching files
    """
    matching_files = []
    for file_id, metadata in file_metadata_db.items():
        if metadata['user_id'] == user_id and metadata['paper_id'] == paper_id:
            matching_files.append(metadata)
    return matching_files 