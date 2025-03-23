import re
from typing import Dict, List, Tuple, Optional, Any
import logging
import os
from ..core.notebook_manager import NotebookManager

logger = logging.getLogger(__name__)

class CodeExecutionService:
    """Service to extract and execute code blocks from AI responses."""
    
    def __init__(self, notebook_manager: NotebookManager):
        """Initialize the service with a notebook manager."""
        self.notebook_manager = notebook_manager
    
    def extract_code_blocks(self, text: str) -> List[str]:
        """Extract Python code blocks from markdown text.
        
        Args:
            text: Markdown formatted text that may contain code blocks
            
        Returns:
            List of extracted Python code blocks
        """
        # Match markdown code blocks: ```python followed by code and closing ```
        pattern = r'```python\s*(.*?)```'
        
        # Find all matches using re.DOTALL to include newlines
        matches = re.findall(pattern, text, re.DOTALL)
        
        return matches
    
    def execute_code_blocks(self, project_id: str, text: str) -> Tuple[bool, str]:
        """Extract and execute all Python code blocks in the text.
        
        Args:
            project_id: The project identifier
            text: Text containing Python code blocks
            
        Returns:
            Tuple of (has_code_blocks, execution_output)
        """
        logger.info(f"the ai text: {text}\n")
        code_blocks = self.extract_code_blocks(text)
        
        if not code_blocks:
            return False, ""
        
        # Execute each code block and collect outputs
        combined_output = []
        
        for i, code in enumerate(code_blocks):
            logger.info(f"Executing code block {i+1}/{len(code_blocks)} for project {project_id}")
            
            # Remove leading/trailing whitespace
            code = code.strip()
            logger.info(f"Executed code: {code}\n") 
            
            # Execute the code block
            result = self.notebook_manager.execute_code(project_id, code)
            
            # Format the output
            block_output = f"Code Block {i+1} Execution Results:\n"
            
            if result['success']:
                if result['output'].strip():
                    block_output += result['output']
                else:
                    block_output += "(Code executed successfully with no output)"
            else:
                block_output += f"Execution Error:\n{result['error']}"
            
            combined_output.append(block_output)
        
        # Join all outputs with separators
        execution_output = "\n\n" + "\n\n---\n\n".join(combined_output)
        
        return True, execution_output

    def execute_code_in_notebook(self, paper_id: str, code: str) -> dict:
        """Executes code in the notebook associated with the given paper_id.

        Args:
            paper_id: The ID of the paper/project.
            code: The Python code to execute.

        Returns:
            A dictionary containing the execution result.
        """
        return self.notebook_manager.execute_code(paper_id, code)

# Test the code extraction and execution if run directly
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Test the code extraction functionality
    print("Testing code block extraction...")
    
    # Create a test instance with a mock notebook manager
    from ..core.notebook_manager import NotebookManager
    test_notebooks_dir = os.path.join(os.path.dirname(__file__), "test_notebooks")
    os.makedirs(test_notebooks_dir, exist_ok=True)
    
    notebook_manager = NotebookManager(test_notebooks_dir)
    service = CodeExecutionService(notebook_manager)
    
    # Test sample text with code blocks
    test_text = """
    Here's a simple example:
    
    ```python
    import pandas as pd
    import numpy as np
    
    # Create a sample dataframe
    df = pd.DataFrame({
        'A': np.random.randn(5),
        'B': np.random.randn(5)
    })
    
    print(df.head())
    ```
    
    And another example:
    
    ```python
    # Calculate correlation
    print(df.corr())
    ```
    """
    
    extracted_blocks = service.extract_code_blocks(test_text)
    print(f"Found {len(extracted_blocks)} code blocks:")
    for i, block in enumerate(extracted_blocks):
        print(f"Block {i+1}:\n{block}\n")
    
    # Test code execution
    print("\nTesting code execution...")
    test_project_id = "test_project"
    has_code, output = service.execute_code_blocks(test_project_id, test_text)
    
    print(f"Has code blocks: {has_code}")
    print(f"Output:\n{output}")
    
    # Clean up test notebooks
    notebook_manager.cleanup()
    print(f"\nTest completed. Check {test_notebooks_dir} for the generated notebook.") 