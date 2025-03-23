import os
import nbformat
from nbformat.v4 import new_notebook, new_code_cell
import jupyter_client
from jupyter_client.manager import start_new_kernel
import uuid
from typing import Dict, Tuple, Optional, Any

class NotebookManager:
    """Manages Jupyter notebooks for each project to maintain state across sessions."""
    
    def __init__(self, notebooks_dir: str = "notebooks"):
        """Initialize the notebook manager.
        
        Args:
            notebooks_dir: Directory to store notebooks
        """
        self.notebooks_dir = notebooks_dir
        os.makedirs(notebooks_dir, exist_ok=True)
        
        # Dictionary to track kernel connections by project_id
        self.kernels: Dict[str, Dict[str, Any]] = {}
    
    def get_notebook_path(self, project_id: str) -> str:
        """Get path to a project's notebook file."""
        return os.path.join(self.notebooks_dir, f"{project_id}.ipynb")
    
    def ensure_notebook_exists(self, project_id: str) -> str:
        """Create a new notebook if it doesn't exist."""
        notebook_path = self.get_notebook_path(project_id)
        
        if not os.path.exists(notebook_path):
            # Create a new, empty notebook
            nb = new_notebook()
            
            # Add standard imports for medical data analysis
            setup_code = """
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn import preprocessing, decomposition, cluster, metrics
import statsmodels.api as sm

# Configure plotting
%matplotlib inline
plt.style.use('seaborn-whitegrid')
sns.set(style="whitegrid")

print("Notebook environment initialized successfully!")
            """
            
            nb.cells.append(new_code_cell(setup_code))
            
            with open(notebook_path, 'w') as f:
                nbformat.write(nb, f)
        
        return notebook_path
    
    def get_or_create_kernel(self, project_id: str) -> Tuple[Any, Any]:
        """Get or create a kernel for a project."""
        if project_id not in self.kernels:
            # Start a new kernel
            kernel_manager, kernel_client = start_new_kernel()
            
            self.kernels[project_id] = {
                'manager': kernel_manager,
                'client': kernel_client,
                'execution_count': 0
            }
            
            # Ensure notebook exists
            self.ensure_notebook_exists(project_id)
        
        return (
            self.kernels[project_id]['manager'],
            self.kernels[project_id]['client']
        )
    
    def execute_code(self, project_id: str, code: str) -> Dict[str, Any]:
        """Execute code in the project's kernel and return the results.
        
        Args:
            project_id: The project identifier
            code: Python code to execute
            
        Returns:
            Dictionary with execution results including stdout, stderr, and error info
        """
        # Get or create kernel
        _, kernel_client = self.get_or_create_kernel(project_id)
        
        # Execute the code
        kernel_client.execute(code)
        
        # Process the output messages
        outputs = []
        error_output = None
        
        while True:
            try:
                # Get message with a reasonable timeout
                msg = kernel_client.get_iopub_msg(timeout=20)
                msg_type = msg['header']['msg_type']
                
                # Handle different message types
                if msg_type == 'execute_result':
                    outputs.append(str(msg['content']['data'].get('text/plain', '')))
                
                elif msg_type == 'display_data':
                    if 'text/plain' in msg['content']['data']:
                        outputs.append(str(msg['content']['data']['text/plain']))
                    # Handle images (could be saved to disk or base64 encoded)
                
                elif msg_type == 'stream':
                    outputs.append(msg['content']['text'])
                
                elif msg_type == 'error':
                    error_output = '\n'.join(msg['content']['traceback'])
                    break
                
                elif msg_type == 'status' and msg['content']['execution_state'] == 'idle':
                    # Execution completed
                    break
                    
            except Exception as e:
                return {
                    'success': False,
                    'output': f"Error receiving kernel output: {str(e)}",
                    'error': str(e)
                }
        
        # Save the executed code to the notebook
        self._append_to_notebook(project_id, code, '\n'.join(outputs), error_output)
        
        # Increment execution count
        self.kernels[project_id]['execution_count'] += 1
        
        return {
            'success': error_output is None,
            'output': '\n'.join(outputs) if outputs else "",
            'error': error_output
        }
    
    def _append_to_notebook(self, project_id: str, code: str, output: str, error: Optional[str] = None):
        """Append executed code and its output to the notebook file."""
        notebook_path = self.get_notebook_path(project_id)
        
        try:
            with open(notebook_path, 'r') as f:
                nb = nbformat.read(f, as_version=4)
        except Exception:
            nb = new_notebook()
        
        # Add the code cell
        nb.cells.append(new_code_cell(code))
        
        # Add output as a markdown cell with formatting
        if output or error:
            content = "**Output:**\n```\n"
            if output:
                content += output
            if error:
                content += f"\n\n**Error:**\n{error}"
            content += "\n```"
            
            # Create markdown cell for output
            output_cell = nbformat.v4.new_markdown_cell(content)
            nb.cells.append(output_cell)
        
        # Write the updated notebook
        with open(notebook_path, 'w') as f:
            nbformat.write(nb, f)
    
    def shutdown_kernel(self, project_id: str):
        """Shutdown a project's kernel."""
        if project_id in self.kernels:
            try:
                self.kernels[project_id]['manager'].shutdown_kernel()
                self.kernels[project_id]['client'].shutdown()
                del self.kernels[project_id]
            except Exception as e:
                print(f"Error shutting down kernel for project {project_id}: {e}")
    
    def cleanup(self):
        """Shutdown all kernels."""
        for project_id in list(self.kernels.keys()):
            self.shutdown_kernel(project_id) 