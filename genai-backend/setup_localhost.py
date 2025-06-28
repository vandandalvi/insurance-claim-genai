#!/usr/bin/env python3
"""
Setup script for localhost testing
This script helps you configure your Gemini API key for local development
"""

import os
import sys

def create_env_file():
    """Create a .env file with the API key"""
    env_content = """# Gemini API Key - Replace with your actual API key
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY_HERE

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Port Configuration
PORT=5000
CHAT_PORT=5001
"""
    
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_file_path):
        print("📁 .env file already exists!")
        print(f"📝 Please edit {env_file_path} and replace YOUR_ACTUAL_GEMINI_API_KEY_HERE with your API key")
    else:
        with open(env_file_path, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file!")
        print(f"📝 Please edit {env_file_path} and replace YOUR_ACTUAL_GEMINI_API_KEY_HERE with your API key")
    
    return env_file_path

def get_api_key():
    """Get API key from user input"""
    print("\n🔑 To get your Gemini API key:")
    print("1. Go to https://makersuite.google.com/app/apikey")
    print("2. Sign in with your Google account")
    print("3. Click 'Create API Key'")
    print("4. Copy the key (starts with 'AIza...')")
    print()
    
    api_key = input("Enter your Gemini API key: ").strip()
    
    if not api_key.startswith('AIza'):
        print("❌ Invalid API key format. It should start with 'AIza'")
        return None
    
    return api_key

def update_env_file(env_file_path, api_key):
    """Update the .env file with the actual API key"""
    try:
        with open(env_file_path, 'r') as f:
            content = f.read()
        
        content = content.replace('YOUR_ACTUAL_GEMINI_API_KEY_HERE', api_key)
        
        with open(env_file_path, 'w') as f:
            f.write(content)
        
        print("✅ API key updated in .env file!")
        return True
    except Exception as e:
        print(f"❌ Error updating .env file: {e}")
        return False

def main():
    print("🚀 ClaimSense Localhost Setup")
    print("=" * 40)
    
    # Create .env file
    env_file_path = create_env_file()
    
    # Ask if user wants to set API key now
    response = input("\n🤔 Do you want to set your API key now? (y/n): ").lower().strip()
    
    if response in ['y', 'yes']:
        api_key = get_api_key()
        if api_key:
            if update_env_file(env_file_path, api_key):
                print("\n🎉 Setup complete!")
                print("\n📋 Next steps:")
                print("1. Install dependencies: pip install -r requirements.txt")
                print("2. Start main backend: python app.py")
                print("3. Start chatbot backend: python appi.py")
                print("4. Start frontend: cd ../client && npm run dev")
            else:
                print("\n❌ Setup incomplete. Please manually edit the .env file.")
        else:
            print("\n❌ Setup incomplete. Please manually edit the .env file.")
    else:
        print("\n📝 Please manually edit the .env file with your API key before running the servers.")

if __name__ == "__main__":
    main() 