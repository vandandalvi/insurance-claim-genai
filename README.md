# ClaimSense - AI-Powered Insurance Claims Platform

A comprehensive insurance claim processing platform that leverages Generative AI (Gemini) for intelligent document processing, fraud detection, and customer assistance.

## 🚀 Features

### 🤖 AI-Powered Features
- **Document OCR & Extraction**: Automatically extract information from hospital bills using Tesseract.js
- **Gemini AI Integration**: Advanced document analysis and fraud detection
- **Intelligent Chatbot**: Multi-language support (English, Hindi, Marathi) with dynamic responses
- **Fraud Detection**: AI-powered risk assessment and suspicious pattern detection

### 📱 User Experience
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Demo Accounts**: Easy testing with pre-configured demo users
- **Real-time Processing**: Instant document analysis and claim verification
- **Multi-step Workflow**: Guided claim submission process

### 🔒 Security & Verification
- **Aadhar Verification**: Secure identity verification system
- **Risk Assessment**: Comprehensive fraud risk scoring
- **Document Quality Analysis**: AI-powered document authenticity checks

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Tesseract.js** for OCR
- **React Router** for navigation

### Backend
- **Flask** (Python)
- **Google Gemini AI** for document analysis and for ChatBot
- **Flask-CORS** for cross-origin requests
- **PIL** for image processing

### AI/ML
- **Google Gemini 1.5 Flash** for document analysis and for ChatBot
- **Custom fraud detection algorithms**
- **Multi-language NLP processing**

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Google Gemini API key

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vandandalvi/insurance-claim-genai.git
cd insurance-claim-genai
```

### 2. Backend Setup
```bash
cd genai-backend
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd client
npm install
```

### 4. Environment Configuration
Create a `.env` file in the `genai-backend` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Start the Application

#### Start Backend (Terminal 1)
```bash
cd genai-backend
python app.py
```
The backend will run on `http://localhost:5000`

#### Start Chatbot Backend (Terminal 2)
```bash
cd genai-backend
python appi.py
```
The chatbot backend will run on `http://localhost:5001`

#### Start Frontend (Terminal 3)
```bash
cd client
npm run dev
```
The frontend will run on `http://localhost:5173`

## 🧪 Demo Accounts

For testing purposes, use these demo accounts:

| Name | Mobile | Aadhar | OTP |
|------|--------|--------|-----|
| Vandan Dalvi | 9028833979 | 1234-5678-9012 | 2222 |
| Shravani Rangnekar | 9123456780 | 5678-1234-9012 | 2222 |

## 📖 Usage Guide

### 1. Login
- Use any demo account from the table above
- Click on demo account buttons for quick login
- Use OTP: `2222` for all accounts

### 2. File a Claim
1. **Upload Document**: Upload a hospital bill image
2. **AI Extraction**: Wait for AI to extract information
3. **Verification**: Verify Aadhar number
4. **Chatbot Assistance**: Get help from AI assistant
5. **Submit Claim**: Complete the claim process

### 3. AI Chatbot Features
- **Multi-language Support**: Chat in English, Hindi, or Marathi
- **Dynamic Responses**: AI generates unique, contextual responses
- **Contact Information**: Get support contact details
- **Claim Status**: Check claim processing status

## 🔧 API Endpoints

### Document Upload
- **POST** `/upload` - Upload and analyze hospital bills
- **Response**: Extracted information with fraud detection

### Chatbot
- **POST** `/chat` - AI-powered customer assistance
- **Response**: Dynamic, contextual responses

## 🏗️ Project Structure

```
insurance-claim-genai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # React components
│   │   ├── data/          # Mock data
│   │   └── assets/        # Static assets
│   └── package.json
├── genai-backend/         # Flask backend
│   ├── app.py            # Main backend server
│   ├── appi.py           # Chatbot server
│   └── requirements.txt
├── .gitignore
└── README.md
```

## 🎯 Key Features Explained

### Document Processing
- **OCR Integration**: Text extraction from images
- **AI Analysis**: Gemini AI for intelligent processing
- **Quality Assessment**: Document authenticity checks
- **Data Validation**: Cross-reference with user profiles
- 
### Fraud Detection System
- **Risk Scoring**: 0-100% risk assessment
- **Pattern Analysis**: Detects suspicious claim patterns
- **Hospital Verification**: Validates hospital authenticity
- **Amount Analysis**: Flags unusual claim amounts

### Multi-language Chatbot
- **Language Detection**: Automatically detects user language
- **Dynamic Responses**: No repetitive template messages
- **Context Awareness**: Remembers conversation history
- **Empathetic Responses**: Caring and supportive tone

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your preferred platform

### Backend (Render/Railway)
1. Set environment variables
2. Deploy with build command: `pip install -r requirements.txt`
3. Start command: `python app.py`

### Live Demo URLs
- **Frontend**: https://insurance-claim-genai.vercel.app/login
- **Backend**: https://claimsense-backend.onrender.com/
- **Chatbot**: https://claimsense-chatbot.onrender.com/
- **CronJob**: To keep backend Alive. 

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Notify ME 

## 🏆 Hackathon Project

This project was developed for the DSW Hackathon, demonstrating:
- Real-world problem solving
- AI/ML integration
- Modern web development
- User-centric design
- Security best practices

---


