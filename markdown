# Codebase Rundown

This document provides a rundown of the files in the codebase, with a brief description of each.

## Backend Files

### `backend/app/services/code_execution_service.py`

*   **Description:** This file likely contains the logic for executing code snippets. It might include functions for running code in different languages or environments, handling input and output, and managing execution resources.

### `backend/app/core/prompt_loader.py`

*   **Description:** This file probably handles the loading of prompts used by the chatbot. It might contain functions for reading prompts from files or databases, formatting them, and providing them to the chatbot.

### `backend/app/core/notebook_manager.py`

*   **Description:** This file likely manages Jupyter notebooks. It might include functions for creating, opening, saving, and executing notebooks, as well as managing notebook sessions and kernels.

### `backend/app/core/file_management.py`

*   **Description:** This file probably provides utilities for managing files, such as reading, writing, creating, and deleting files. It might also include functions for handling file permissions and storage.

### `backend/app/api/chatbot.py`

*   **Description:** This file likely defines the API endpoints for the chatbot. It might include routes for receiving user messages, sending responses, and handling other chatbot-related requests.

### `backend/docker/requirements.txt`

*   **Description:** This file lists the Python packages required to run the backend application. It is used by pip to install the necessary dependencies.

### `backend/docker/Dockerfile`

*   **Description:** This file contains instructions for building a Docker image for the backend application. It specifies the base image, installs dependencies, and configures the application environment.

### `backend/app/config.py`

*   **Description:** This file likely contains configuration settings for the backend application, such as database connection strings, API keys, and other environment-specific variables.

### `backend/app/main.py`

*   **Description:** This file is the main entry point for the backend application. It might initialize the application, define routes, and start the server.

### `sysprompt.txt`

*   **Description:** This file likely contains the system prompt used to guide the behavior of the chatbot. It might define the chatbot's personality, knowledge base, and response style.

## Notes

*   This rundown is based on the file names and common conventions. The actual functionality of each file may vary.
*   The "likely" descriptions are based on common software development practices.
*   For a more detailed understanding, it is recommended to examine the contents of each file. 