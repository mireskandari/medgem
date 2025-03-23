from datetime import datetime

class Project:
    """Model representing a research project
    
    This model stores information about a research project, including the user ID,
    paper ID, associated files, and the current state of the chatbot interaction.
    """
    
    def __init__(self, user_id, paper_id, title=None, description=None):
        """Initialize a new project
        
        Args:
            user_id (str): The ID of the user who owns this project
            paper_id (str): The unique identifier for this paper/project
            title (str, optional): The title of the project
            description (str, optional): A description of the project
        """
        self.user_id = user_id
        self.paper_id = paper_id
        self.title = title or f"Project {paper_id}"
        self.description = description or ""
        self.created_at = datetime.now().isoformat()
        self.updated_at = self.created_at
        
        # List of file IDs associated with this project
        self.file_ids = []
        
        # Current state of the chatbot interaction
        self.current_state = "initial"  # initial, hypothesis_generation, study_design, etc.
        self.chat_history = []
        
    def to_dict(self):
        """Convert the project to a dictionary
        
        Returns:
            dict: The project data as a dictionary
        """
        return {
            "user_id": self.user_id,
            "paper_id": self.paper_id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "file_ids": self.file_ids,
            "current_state": self.current_state,
            "chat_history": self.chat_history
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create a project from a dictionary
        
        Args:
            data (dict): The project data as a dictionary
            
        Returns:
            Project: A project instance
        """
        project = cls(
            user_id=data["user_id"],
            paper_id=data["paper_id"],
            title=data.get("title"),
            description=data.get("description")
        )
        project.created_at = data.get("created_at", project.created_at)
        project.updated_at = data.get("updated_at", project.updated_at)
        project.file_ids = data.get("file_ids", [])
        project.current_state = data.get("current_state", "initial")
        project.chat_history = data.get("chat_history", [])
        return project 