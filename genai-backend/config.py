import os

# Configuration for different environments
class Config:
    # Gemini API Key - Replace with your actual API key for testing
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyC9uHGCFi76BCW0HrZQpVPv6DQHZzDa_UM")
    
    # Flask Configuration
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() == "true"
    
    # Port Configuration
    PORT = int(os.environ.get("PORT", 5000))
    CHAT_PORT = int(os.environ.get("CHAT_PORT", 5001))
    
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

# Instructions for setting up API keys:
"""
TO SET UP YOUR API KEY FOR LOCALHOST TESTING:

1. Get your Gemini API key from: https://makersuite.google.com/app/apikey

2. Set the environment variable (choose one method):

   Method 1 - Set environment variable:
   Windows (PowerShell):
   $env:GEMINI_API_KEY="your_actual_api_key_here"
   
   Windows (Command Prompt):
   set GEMINI_API_KEY=your_actual_api_key_here
   
   Linux/Mac:
   export GEMINI_API_KEY="your_actual_api_key_here"

   Method 2 - Create a .env file in genai-backend folder:
   GEMINI_API_KEY=your_actual_api_key_here

   Method 3 - Directly replace in the code:
   Replace "YOUR_GEMINI_API_KEY_HERE" with your actual API key in app.py and appi.py

3. Start the servers:
   python app.py      # Main backend on port 5000
   python appi.py     # Chatbot on port 5001
""" 