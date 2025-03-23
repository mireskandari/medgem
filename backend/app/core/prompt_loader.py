import os
import logging

logger = logging.getLogger(__name__)

def load_system_prompt(prompt_path="sysprompt.txt"):
    """Load the system prompt from a file.
    
    Args:
        prompt_path: Path to the system prompt file
        
    Returns:
        String containing the system prompt, or a default prompt if file not found
    """
    try:
        with open(prompt_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        logger.warning(f"System prompt file not found at {prompt_path}, using default prompt")
        return """You are an expert medical research assistant. Your task is to analyze medical data provided by the user and generate a set of compelling and testable hypotheses."""
    except Exception as e:
        logger.error(f"Error loading system prompt: {e}")
        return """You are an expert medical research assistant. Your task is to analyze medical data provided by the user and generate a set of compelling and testable hypotheses.""" 