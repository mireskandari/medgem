from datetime import datetime

# In-memory session storage. In production, consider using a database for persistence.
session_data = {}

def ensure_session(session_id):
    """Ensure a session exists and return session data
    
    Args:
        session_id: The ID of the session to ensure
        
    Returns:
        dict: The session data
    """
    if session_id not in session_data:
        session_data[session_id] = {
            "dataframes": {},
            "history": [],
            "created_at": datetime.now().isoformat(),
        }
    return session_data[session_id]

def get_session(session_id):
    """Get session data for a specific session ID
    
    Args:
        session_id: The ID of the session to retrieve
        
    Returns:
        dict: The session data or None if not found
    """
    return session_data.get(session_id)

def update_session_history(session_id, message, response):
    """Add a message and response to the session history
    
    Args:
        session_id: The ID of the session to update
        message: The user message
        response: The AI response
        
    Returns:
        dict: The updated session data
    """
    session = ensure_session(session_id)
    session["history"].append({
        "message": message,
        "response": response,
        "timestamp": datetime.now().isoformat()
    })
    return session 