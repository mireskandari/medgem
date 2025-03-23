import os
import uuid
from datetime import datetime
import logging
from flask import Blueprint, request, jsonify
from flask_cors import CORS  # Import CORS
from backend.app.core.file_management import save_uploaded_file, get_file_metadata
from backend.app.core.user_management import ensure_session
from ..services.code_execution_service import CodeExecutionService
from ..core.notebook_manager import NotebookManager
from ..config import settings
from ..core.prompt_loader import load_system_prompt
import cohere # Import the cohere library


class CohereModel:
    """Class to handle all Cohere model-related operations for the chatbot."""
    
    def __init__(self):
        """Initialize the Cohere client."""
        self.api_key = os.environ.get("COHERE_API_KEY")
        if not self.api_key:
            logger = logging.getLogger(__name__)
            logger.error("No Cohere API key found in environment variables")
            raise ValueError("COHERE_API_KEY environment variable is not set")
        
        self.client = cohere.Client(self.api_key)
        self.system_prompt = load_system_prompt()
        
    def format_chat_history(self, messages):
        """Format messages into Cohere's expected chat history format.
        
        Args:
            messages: List of message objects with 'role' and 'content' keys
            
        Returns:
            Tuple of (system_message, chat_history, current_message)
        """
        # Extract system prompt from messages
        system_message = next((msg["content"] for msg in messages if msg["role"] == "system"), self.system_prompt)
        
        # Get current message (last user message)
        current_message = messages[-1]["content"] if messages[-1]["role"] == "user" else None
        
        # Create chat history for Cohere in the correct format
        chat_history = []
        for msg in messages:
            if msg["role"] != "system" and msg != messages[-1]:  # Exclude system message and current user message
                cohere_role = "User" if msg["role"] == "user" else "Chatbot"
                chat_history.append({
                    "role": cohere_role,
                    "message": msg["content"]
                })
        
        return system_message, chat_history, current_message
    
    def send_message(self, messages):
        """Send a message to the Cohere API and get the response.
        
        Args:
            messages: List of message objects with 'role' and 'content' keys
            
        Returns:
            The text response from the model
        """
        try:
            # Debug logging
            print("\n--- Messages being sent to Cohere API ---")
            for msg in messages:
                print(f"Role: {msg['role']}, Content: {msg['content']}")
            print("--- End of Messages ---")
            
            # Format messages for Cohere
            system_message, chat_history, current_message = self.format_chat_history(messages)
            
            # If no current message was specified, use the last user message
            if current_message is None:
                current_message = next((msg['content'] for msg in reversed(messages) 
                                      if msg['role'] == 'user'), "")
            
            # Call Cohere API
            response = self.client.chat(
                model=settings.COHERE_MODEL_NAME,
                message=current_message,
                chat_history=chat_history,
                preamble=system_message
            )
            
            return response.text
        except Exception as e:
            logging.error(f"Error sending message to Cohere: {str(e)}")
            raise
            

# Create a blueprint for chatbot routes
chatbot_bp = Blueprint('chatbot', __name__)
# Enable CORS with specific options
CORS(chatbot_bp, resources={r"/*": {"origins": "*", "methods": ["GET", "POST"], "allow_headers": ["Content-Type", "Authorization"]}})

# Initialize the chatbot model
chatbot_model = CohereModel()

# Store conversation history by paper_id
conversation_history = {}

# Track which paper_ids belong to each user
user_papers = {}

logger = logging.getLogger(__name__)

# Initialize notebook manager and code execution service
notebook_manager = NotebookManager(settings.NOTEBOOKS_DIR)
code_execution_service = CodeExecutionService(notebook_manager)

# Load system prompt content
system_prompt_content = load_system_prompt()


@chatbot_bp.route('/chat/initiate', methods=['POST'])
def initiate_chat():
    """Initialize a new chat session and create a Jupyter notebook."""
    logger.info("A new chat was initialized")
    
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    paper_id = str(uuid.uuid4())
    notebook_manager.ensure_notebook_exists(paper_id)

    # Initialize conversation history with system prompt
    conversation_history[paper_id] = {
        'messages': [{"role": "system", "content": system_prompt_content}],
        'uploaded_files': []
    }
    
    # Track this paper_id for the user
    if user_id not in user_papers:
        user_papers[user_id] = []
    user_papers[user_id].append(paper_id)

    # Initialize the dataframes dictionary in the notebook at chat start
    init_code = "dataframes = {}"
    code_execution_service.execute_code_in_notebook(paper_id, init_code)

    return jsonify({"message": "Chat initiated", "user_id": user_id, "paper_id": paper_id}), 200


@chatbot_bp.route('/upload_file', methods=['POST'])
def upload_file():
    """Upload a file and inform the AI about the file path."""
    logger.info("File upload request from user")
    
    if 'file' not in request.files:
        logger.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    
    # Check if form data exists in request
    if 'user_id' not in request.form:
        logger.error("Missing user_id in form data")
        return jsonify({'error': 'user_id is required'}), 400
    
    if 'paper_id' not in request.form:
        logger.error("Missing paper_id in form data")
        return jsonify({'error': 'paper_id is required'}), 400
    
    user_id = request.form.get('user_id')
    paper_id = request.form.get('paper_id')
    
    logger.info(f"Received upload request with user_id: {user_id}, paper_id: {paper_id}")

    if file.filename == '':
        logger.error("Empty filename")
        return jsonify({'error': 'No selected file'}), 400
    
    # Ensure the session exists for this paper_id
    if paper_id not in conversation_history:
        logger.error(f"Chat session not found for paper_id: {paper_id}")
        # Initialize a new conversation if it doesn't exist
        conversation_history[paper_id] = {
            'messages': [{"role": "system", "content": system_prompt_content}],
            'uploaded_files': []
        }
        
        # Track this paper_id for the user
        if user_id not in user_papers:
            user_papers[user_id] = []
        if paper_id not in user_papers[user_id]:
            user_papers[user_id].append(paper_id)

    try:
        # Log the file details before saving
        logger.info(f"Attempting to save file: {file.filename} for user: {user_id}, paper: {paper_id}")
        
        file_data = save_uploaded_file(file, user_id, paper_id)
        file_path = file_data['local_filepath']
        original_filename = file_data['original_filename']
        
        logger.info(f"File saved successfully at: {file_path}")
        
        # Store file information in the conversation history
        uploaded_file_info = {
            'original_filename': original_filename,
            'file_path': file_path
        }
        conversation_history[paper_id]['uploaded_files'].append(uploaded_file_info)

        return jsonify({
            'message': f'File "{original_filename}" uploaded and saved successfully. AI will be informed about the file path.',
            'file_id': file_data['file_id'],
            'filename': original_filename,
            'local_filepath': file_path,
            'paper_id': paper_id,
        }), 200

    except Exception as e:
        logger.error(f"File upload error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': 'File upload failed', 'details': str(e)}), 500


@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    """Process a chat message and return the response."""
    logger.info("Chat request from user detected")
    
    user_id = request.json.get('user_id')
    message = request.json.get('message')
    paper_id = request.json.get('paper_id')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    if not message:
        return jsonify({"error": "message is required"}), 400
    if not paper_id:
        return jsonify({"error": "paper_id is required"}), 400

    # Get or initialize the chat session
    if paper_id not in conversation_history:
        conversation_history[paper_id] = {
            'messages': [{"role": "system", "content": system_prompt_content}],
            'uploaded_files': []
        }
        
        # Track this paper_id for the user
        if user_id not in user_papers:
            user_papers[user_id] = []
        if paper_id not in user_papers[user_id]:
            user_papers[user_id].append(paper_id)

    chat_session_data = conversation_history[paper_id]
    messages = chat_session_data['messages']
    uploaded_files = chat_session_data['uploaded_files']

    # Construct file context prompt
    file_context_prompt = ""
    if uploaded_files:
        file_context_prompt = "You have access to the following files:\n"
        for file_info in uploaded_files:
            file_context_prompt += f"- '{file_info['original_filename']}' at path '{file_info['file_path']}'\n"
        file_context_prompt += "\nConsider these files for any analysis or operations requested by the user."

    # Combine user message with file context
    full_message = message + "\n\n" + file_context_prompt if file_context_prompt else message

    # Add user message to the history
    messages.append({"role": "user", "content": full_message})

    # Get AI response
    try:
        ai_response = chatbot_model.send_message(messages)
        # Add assistant response to the history
        messages.append({"role": "assistant", "content": ai_response})
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error processing message: {str(e)}"}), 500

    # Handle code execution if enabled
    if settings.ENABLE_CODE_EXECUTION:
        try:
            # Get the last assistant response
            ai_response = messages[-1]["content"]
            
            has_code, execution_output = code_execution_service.execute_code_blocks(
                paper_id, ai_response
            )

            if has_code:
                # This is an intermediate response with code - we need to send it back to the AI
                follow_up_prompt = f"""BLOCK_RESPONSE

                    
Here are the results of executing your code:
{execution_output}
                    
Perform the next step of your analysis based on these results, or provide your final answer if the analysis is complete.
                    """
                
                # Add execution results to messages
                messages.append({"role": "user", "content": follow_up_prompt})
                
                # Get the AI's next response based on code execution output
                ai_response = chatbot_model.send_message(messages)
                messages.append({"role": "assistant", "content": ai_response})

                # Check for more code blocks recursively
                while settings.ENABLE_CODE_EXECUTION:
                    has_more_code, more_execution_output = code_execution_service.execute_code_blocks(
                        paper_id, ai_response
                    )

                    if not has_more_code:
                        # No more code blocks - we have the final response
                        break

                    # Another round of code execution
                    follow_up_prompt = f"""BLOCK_RESPONSE

                    
Here are the results of executing your code:
{more_execution_output}
                    
Perform the next step of your analysis based on these results, or provide your final answer if the analysis is complete.
                    """
                    messages.append({"role": "user", "content": follow_up_prompt})

                    ai_response = chatbot_model.send_message(messages)
                    messages.append({"role": "assistant", "content": ai_response})
                
        except Exception as e:
            logger.error(f"Error during code execution: {str(e)}")
            return jsonify({"error": f"Error during code execution: {str(e)}"}), 500

    # Return the final response to the user
    return jsonify({"response": ai_response, "project_id": paper_id}) 