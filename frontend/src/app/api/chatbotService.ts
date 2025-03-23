export interface ChatInitiateResponse {
    message: string;
    user_id: string;
    paper_id: string;
}

export interface FileUploadResponse {
    message: string;
    file_id: string;
    filename: string;
    local_filepath: string;
    paper_id: string;
}

export interface ChatResponse {
    response: string;
    project_id: string;
}

const API_BASE_URL = 'http://100.66.22.209:8080';

// Function to handle POST requests using fetch
async function postData<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Specify content type as JSON
        },
        body: JSON.stringify(data), // Convert data to JSON string
    });

    if (!response.ok) {
        // Handle HTTP errors
        const message = `An error occurred: ${response.status}`;
        throw new Error(message);
    }

    return await response.json() as T; // Parse JSON response and cast to type T
}

export const initiateChat = async (userId: string): Promise<ChatInitiateResponse> => {
    try {
        return await postData<ChatInitiateResponse>(`${API_BASE_URL}/chat/initiate`, { user_id: userId });
    } catch (error: any) {
        throw new Error(error.message || 'Failed to initiate chat');
    }
};

export const uploadFile = async (file: File, userId: string, paperId: string): Promise<FileUploadResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId);
        formData.append('paper_id', paperId);

        // Function to handle file upload using fetch
        async function postFormData<T>(url: string, formData: FormData): Promise<T> {
            const response = await fetch(url, {
                method: 'POST',
                body: formData, // Send FormData directly
            });

            if (!response.ok) {
                // Handle HTTP errors
                const message = `An error occurred: ${response.status}`;
                throw new Error(message);
            }

            return await response.json() as T;
        }

        return await postFormData<FileUploadResponse>(`${API_BASE_URL}/upload_file`, formData);
    } catch (error: any) {
        throw new Error(error.message || 'File upload failed');
    }
};

export const sendMessage = async (userId: string, message: string, paperId: string): Promise<ChatResponse> => {
    try {
        return await postData<ChatResponse>(`${API_BASE_URL}/chat`, {
            user_id: userId,
            message: message,
            paper_id: paperId,
        });
    } catch (error: any) {
        throw new Error(error.message || 'Failed to send message');
    }
};