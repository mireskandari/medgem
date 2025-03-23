import requests
import json
import os

# API endpoint configuration
BASE_URL = "http://localhost:8080"

class ChatbotWrapper:
    def __init__(self):
        self.user_id = "test_user"  # Default user ID
        self.current_paper_id = None
        self.paper_ids = []  # List to store all paper IDs for this user
        self.session_active = False
    
    def initiate_session(self):
        """Start a new chat session and get a paper_id"""
        url = f"{BASE_URL}/chat/initiate"
        payload = json.dumps({"user_id": self.user_id})
        headers = {'Content-Type': 'application/json'}
        
        try:
            response = requests.post(url, headers=headers, data=payload)
            response.raise_for_status()
            data = response.json()
            new_paper_id = data.get("paper_id")
            
            if new_paper_id:
                self.current_paper_id = new_paper_id
                self.paper_ids.append(new_paper_id)
                self.session_active = True
                print(f"\n✅ New session initiated with paper_id: {self.current_paper_id}")
                return True
            else:
                print("\n❌ Failed to get paper_id from server response")
                return False
        except requests.exceptions.RequestException as e:
            print(f"\n❌ Failed to initiate session: {e}")
            return False
    
    def list_sessions(self):
        """List all available paper IDs for this user"""
        if not self.paper_ids:
            print("\n❌ No sessions available. Please initiate a session first.")
            return
        
        print("\n📋 Available sessions:")
        for i, paper_id in enumerate(self.paper_ids, 1):
            status = "CURRENT" if paper_id == self.current_paper_id else ""
            print(f"{i}. {paper_id} {status}")
    
    def switch_session(self):
        """Switch to a different paper ID"""
        if not self.paper_ids:
            print("\n❌ No sessions available. Please initiate a session first.")
            return
        
        self.list_sessions()
        
        try:
            choice = int(input("\nEnter the number of the session to switch to: ").strip())
            if 1 <= choice <= len(self.paper_ids):
                self.current_paper_id = self.paper_ids[choice-1]
                self.session_active = True
                print(f"\n✅ Switched to session with paper_id: {self.current_paper_id}")
            else:
                print("\n❌ Invalid choice.")
        except ValueError:
            print("\n❌ Please enter a valid number.")
    
    def upload_file(self):
        """Upload a file to the current session"""
        if not self.session_active or not self.current_paper_id:
            print("\n❌ No active session. Please initiate a session first.")
            return
        
        file_path = input("\nEnter the full path to the file: ").strip()
        
        if not os.path.exists(file_path):
            print(f"\n❌ File not found: {file_path}")
            return
        
        url = f"{BASE_URL}/upload_file"
        
        try:
            with open(file_path, 'rb') as file:
                files = {'file': (os.path.basename(file_path), file)}
                data = {'user_id': self.user_id, 'paper_id': self.current_paper_id}
                
                response = requests.post(url, files=files, data=data)
                response.raise_for_status()
                data = response.json()
                print(f"\n✅ File uploaded successfully: {os.path.basename(file_path)}")
                print(f"   Server response: {data.get('message', 'No message')}")
        except FileNotFoundError:
            print(f"\n❌ Error: File not found at {file_path}")
        except requests.exceptions.RequestException as e:
            print(f"\n❌ Upload failed: {e}")
    
    def send_message(self):
        """Send a message to the chatbot and display the response"""
        if not self.session_active or not self.current_paper_id:
            print("\n❌ No active session. Please initiate a session first.")
            return
        
        message = input("\nEnter your message: ").strip()
        
        if not message:
            print("\n❌ Message cannot be empty.")
            return
        
        url = f"{BASE_URL}/chat"
        payload = json.dumps({
            "user_id": self.user_id, 
            "message": message, 
            "paper_id": self.current_paper_id
        })
        headers = {'Content-Type': 'application/json'}
        
        try:
            print("\n⏳ Waiting for response...")
            response = requests.post(url, headers=headers, data=payload)
            response.raise_for_status()
            data = response.json()
            
            print("\n🤖 Chatbot Response:")
            print("=" * 80)
            print(data.get("response", "No response received"))
            print("=" * 80)
        except requests.exceptions.RequestException as e:
            print(f"\n❌ Failed to send message: {e}")
    
    def run(self):
        """Main loop for the chatbot wrapper"""
        print("\n🤖 Welcome to the Chatbot Wrapper!")
        
        # Start by initiating a session
        if not self.initiate_session():
            print("Failed to start a session. Exiting.")
            return
        
        while True:
            print(f"\nCurrent session: {self.current_paper_id}")
            print("\nOptions:")
            print("1: Upload a file")
            print("2: Send a message")
            print("3: Start a new session")
            print("4: List available sessions")
            print("5: Switch to another session")
            print("6: Exit")
            
            choice = input("\nEnter your choice (1-6): ").strip()
            
            if choice == '1':
                self.upload_file()
            elif choice == '2':
                self.send_message()
            elif choice == '3':
                self.initiate_session()
            elif choice == '4':
                self.list_sessions()
            elif choice == '5':
                self.switch_session()
            elif choice == '6':
                print("\n👋 Goodbye!")
                break
            else:
                print("\n❌ Invalid choice. Please enter a number between 1 and 6.")

if __name__ == "__main__":
    wrapper = ChatbotWrapper()
    try:
        wrapper.run()
    except KeyboardInterrupt:
        print("\n\n👋 Program interrupted. Goodbye!") 