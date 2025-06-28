# 🏠 Localhost Setup Guide

This guide will help you set up ClaimSense for local development and testing.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
cd genai-backend
python setup_localhost.py
```

### Option 2: Manual Setup

#### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

#### 2. Set Your API Key

**Method A: Environment Variable**
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your_api_key_here"

# Windows Command Prompt
set GEMINI_API_KEY=your_api_key_here

# Linux/Mac
export GEMINI_API_KEY="your_api_key_here"
```

**Method B: Create .env File**
Create a file named `.env` in the `genai-backend` folder:
```env
GEMINI_API_KEY=your_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

**Method C: Direct Code Replacement**
Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key in:
- `app.py` (line 15)
- `appi.py` (line 13)

#### 3. Install Dependencies
```bash
cd genai-backend
pip install -r requirements.txt
```

#### 4. Start the Servers

**Terminal 1 - Main Backend:**
```bash
cd genai-backend
python app.py
```
Server will run on: http://localhost:5000

**Terminal 2 - Chatbot Backend:**
```bash
cd genai-backend
python appi.py
```
Server will run on: http://localhost:5001

**Terminal 3 - Frontend:**
```bash
cd client
npm install
npm run dev
```
Frontend will run on: http://localhost:5173

## 🧪 Testing

1. Open http://localhost:5173 in your browser
2. Use demo accounts:
   - **Vandan Dalvi**: 9028833979 (Aadhar: 1234-5678-9012)
   - **Shravani Rangnekar**: 9123456780 (Aadhar: 5678-1234-9012)
3. Use OTP: `2222` for all accounts
4. Test the complete claim flow

## 🔧 Troubleshooting

### API Key Issues
- Make sure your API key starts with `AIza...`
- Check that the environment variable is set correctly
- Verify the API key has access to Gemini models

### Port Issues
- If port 5000 is busy, change it in `app.py`
- If port 5001 is busy, change it in `appi.py`
- If port 5173 is busy, Vite will automatically use the next available port

### CORS Issues
- Make sure both backend servers are running
- Check that the frontend is accessing the correct URLs
- Verify CORS configuration in both `app.py` and `appi.py`

### Dependencies Issues
```bash
# Reinstall dependencies
pip uninstall -r requirements.txt
pip install -r requirements.txt
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | Required |
| `FLASK_ENV` | Flask environment | `development` |
| `FLASK_DEBUG` | Enable debug mode | `True` |
| `PORT` | Main backend port | `5000` |
| `CHAT_PORT` | Chatbot port | `5001` |

## 🎯 Next Steps

Once everything is working:
1. Test document upload and AI extraction
2. Test Aadhar verification
3. Test chatbot functionality
4. Test multi-language support (English, Hindi, Marathi)

## 🆘 Need Help?

- Check the console for error messages
- Verify all servers are running
- Ensure API key is valid and has proper permissions
- Check network connectivity

Happy coding! 🚀 