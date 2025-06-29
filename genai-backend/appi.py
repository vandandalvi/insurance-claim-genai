from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import random
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment variable
chat_api_key = os.environ.get("GEMINI_API_KEY_CHATBOT")
if not chat_api_key:
    print("⚠️  WARNING: GEMINI_API_KEY_CHATBOT not found in environment variables!")
    print("📝 Please set your chatbot API key using one of these methods:")
    print("   1. Create a .env file in genai-backend folder with: GEMINI_API_KEY_CHATBOT=your_key_here")
    print("   2. Set environment variable: export GEMINI_API_KEY_CHATBOT=your_key_here")
    print("   3. Replace the API key in this file with your actual chatbot API key")
    chat_api_key = "AIzaSyC9uHGCFi76BCW0HrZQpVPv6DQHZzDa_UM"  # Replace this with your actual chatbot API key

chat_model = None

def setup_chat_model():
    global chat_model
    try:
        genai.configure(api_key=chat_api_key)
        chat_model = genai.GenerativeModel("gemini-1.5-flash")
        print("Chat model initialized successfully")
    except Exception as e:
        print(f"Error initializing chat model: {e}")

setup_chat_model()

@app.route("/chat", methods=["POST"])
def chat():
    try:
        if not chat_model:
            return jsonify({"error": "Chat model not initialized"}), 500
            
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        user_msg = data.get("message", "")
        eligibility = data.get("eligibility", True)
        extracted_data = data.get("extracted")
        extracted = extracted_data if extracted_data is not None else {}
        reason = data.get("reason", "")
        is_initial_message = data.get("isInitialMessage", False)
        conversation_history = data.get("conversationHistory", "")
        message_count = data.get("messageCount", 1)

        name = extracted.get("name", "Unknown")
        age = extracted.get("age", "Unknown")
        claim_reason = extracted.get("reason", "Not mentioned")
        amount = extracted.get("amount", "0")

        # Language detection based on user message
        def detect_language(text):
            # Simple language detection based on common words/characters
            text_lower = text.lower()
            
            # Hindi detection (Devanagari + Romanized)
            hindi_chars = ['ह', 'ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ओ', 'ौ', 'ं', 'ः', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ']
            hindi_words = ['क्या', 'है', 'में', 'का', 'की', 'के', 'और', 'या', 'फिर', 'अब', 'तो', 'भी', 'नहीं', 'हाँ', 'नहीं', 'कैसे', 'कहाँ', 'कब', 'कोण', 'का']
            romanized_hindi_words = ['kya', 'hai', 'mein', 'ka', 'ki', 'ke', 'aur', 'ya', 'phir', 'ab', 'to', 'bhi', 'nahi', 'haan', 'kaise', 'kahan', 'kab', 'kaun', 'kya', 'nahin', 'main', 'aap', 'tum', 'hum', 'wo', 'ye', 'us', 'is', 'unka', 'unki', 'mera', 'meri', 'tera', 'teri', 'hamara', 'hamari']
            
            # Marathi detection (Devanagari + Romanized)
            marathi_chars = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ळ', 'क्ष', 'ज्ञ']
            marathi_words = ['काय', 'आहे', 'मध्ये', 'चा', 'ची', 'चे', 'आणि', 'किंवा', 'मग', 'आता', 'तर', 'देखील', 'नाही', 'होय', 'कसे', 'कुठे', 'कधी', 'कोण', 'का']
            romanized_marathi_words = ['kay', 'ahe', 'madhye', 'cha', 'chi', 'che', 'ani', 'kinva', 'maga', 'aata', 'tar', 'dekhil', 'nahi', 'hoy', 'kase', 'kuthe', 'kadhi', 'kon', 'ka', 'nahi', 'mi', 'tu', 'amhi', 'to', 'he', 'te', 'tya', 'hya', 'tyacha', 'tyachi', 'maza', 'mazi', 'tuzha', 'tuzhi', 'amcha', 'amchi', 'kasa', 'ahes', 'kuthe', 'ahes', 'kadhi', 'yeil', 'kay', 'karto', 'karte', 'karto', 'karte']
            
            # Check for Hindi (Devanagari + Romanized)
            if (any(char in text for char in hindi_chars) or 
                any(word in text_lower for word in hindi_words) or
                any(word in text_lower for word in romanized_hindi_words)):
                return 'hindi'
            
            # Check for Marathi (Devanagari + Romanized)
            if (any(char in text for char in marathi_chars) or 
                any(word in text_lower for word in marathi_words) or
                any(word in text_lower for word in romanized_marathi_words)):
                return 'marathi'
            
            # Default to English
            return 'english'

        detected_language = detect_language(user_msg)

        # Add conversation context and variety
        conversation_context = f"""
CONVERSATION CONTEXT:
- This is {'the initial greeting' if is_initial_message else f'message #{message_count} in an ongoing conversation'}
- User's name: {name}
- Claim amount: ₹{amount}
- Eligibility status: {'Eligible' if eligibility else 'Not Eligible'}
- Rejection reason: {reason if not eligibility else 'N/A'}
- Previous conversation: {conversation_history if conversation_history else 'No previous messages'}
- User's language: {detected_language}
"""

        if eligibility:
            # Dynamic response generation - NO TEMPLATES
            response_styles = [
                f"""
You are a helpful insurance assistant. Generate a unique, natural response to the user's question.

{conversation_context}

CONTEXT: User has an approved claim of ₹{amount}. 

RESPONSE GUIDELINES:
- Answer their specific question in a unique way
- If they ask for contact info, provide: 9038844756
- Make each response different and personal
- Avoid generic phrases like "you're very welcome" or "don't hesitate"
- Be conversational but vary your language
- Keep it under 100 words
- RESPOND IN THE SAME LANGUAGE AS THE USER: {detected_language.upper()}
- Don't repeat the same greeting or closing phrases
- Make it sound like a real person having a conversation

User asked: "{user_msg}"
""",
                f"""
You are a friendly insurance helper. Create a fresh, unique response.

{conversation_context}

CONTEXT: User's ₹{amount} claim is approved.

RESPONSE GUIDELINES:
- Respond to their actual question with originality
- For contact requests: 9038844756
- Avoid repetitive language patterns
- Don't use the same phrases every time
- Be helpful but vary your approach
- Keep it under 80 words
- RESPOND IN THE SAME LANGUAGE AS THE USER: {detected_language.upper()}
- Make each response feel unique and personal
- Avoid template-like responses

User asked: "{user_msg}"
""",
                f"""
You are a caring insurance assistant. Provide fresh, unique answers.

{conversation_context}

CONTEXT: User's claim of ₹{amount} is eligible.

RESPONSE GUIDELINES:
- Answer what they're asking in a new way
- Contact number: 9038844756
- Avoid repetitive language
- Make each response different
- Be empathetic but vary your tone
- Keep it under 90 words
- RESPOND IN THE SAME LANGUAGE AS THE USER: {detected_language.upper()}
- Don't use the same structure every time
- Make it feel like a real conversation

User asked: "{user_msg}"
"""
            ]
            
            # Randomly select a response style
            selected_style = random.choice(response_styles)
            prompt = selected_style
            
        else:
            # Dynamic response generation for ineligible users - NO TEMPLATES
            response_styles = [
                f"""
You are a helpful insurance assistant. Generate a unique response to help the user.

{conversation_context}

CONTEXT: User's claim was rejected due to: {reason}.

RESPONSE GUIDELINES:
- Answer their question in a fresh, unique way
- If they ask for contact info, provide: 9038844756
- Explain the rejection clearly but vary your approach
- Avoid repetitive language patterns
- Don't use the same phrases every time
- Keep it under 80 words
- RESPOND IN THE SAME LANGUAGE AS THE USER: {detected_language.upper()}
- Make each response feel personal and unique
- Avoid template-like responses

User asked: "{user_msg}"
""",
                f"""
You are a caring insurance helper. Create a unique, supportive response.

{conversation_context}

CONTEXT: Claim rejected because: {reason}.

RESPONSE GUIDELINES:
- Respond to their question with originality
- For contact requests: 9038844756
- Be supportive but vary your language
- Avoid repetitive phrases
- Make each response different
- Keep it under 70 words
- RESPOND IN THE SAME LANGUAGE AS THE USER: {detected_language.upper()}
- Don't use the same structure every time
- Make it feel like a real conversation

User asked: "{user_msg}"
""",
                f"""
You are a helpful insurance assistant. Provide unique, solution-focused answers.

{conversation_context}

CONTEXT: Claim couldn't be approved: {reason}.

RESPONSE GUIDELINES:
- Answer their question in a fresh way
- Contact number: 9038844756
- Suggest alternatives with originality
- Avoid repetitive language
- Make each response unique
- Keep it under 75 words
- RESPOND IN THE SAME LANGUAGE AS THE USER: {detected_language.upper()}
- Don't use template phrases
- Make it feel personal and different

User asked: "{user_msg}"
"""
            ]
            
            # Randomly select a response style
            selected_style = random.choice(response_styles)
            prompt = selected_style

        chat = chat_model.start_chat()
        response = chat.send_message(prompt)
        return jsonify({ "reply": response.text })

    except Exception as e:
        print("Chat error:", e)
        return jsonify({ "error": str(e) }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "message": "The requested API endpoint does not exist",
        "available_endpoints": [
            "POST /chat - AI chatbot endpoint",
            "GET / - Health check"
        ],
        "status": 404
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "error": "Method not allowed",
        "message": "This endpoint does not support the requested HTTP method",
        "status": 405
    }), 405

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong on the server. Please try again later.",
        "status": 500
    }), 500

@app.errorhandler(Exception)
def handle_exception(error):
    return jsonify({
        "error": "Unexpected error",
        "message": "An unexpected error occurred. Please try again.",
        "status": 500
    }), 500

# Additional utility endpoints
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "ClaimSense Chatbot Backend is running",
        "api_key_configured": bool(chat_api_key and chat_api_key != "YOUR_VALID_GEMINI_API_KEY_HERE"),
        "gemini_model": "gemini-1.5-flash"
    })

@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify({
        "status": "operational",
        "service": "ClaimSense Chatbot Backend",
        "version": "1.0.0",
        "endpoints": {
            "health": "/",
            "chat": "/chat",
            "status": "/api/status"
        }
    })

@app.route("/api/info", methods=["GET"])
def api_info():
    return jsonify({
        "name": "ClaimSense Chatbot Backend API",
        "description": "AI-powered insurance chatbot backend",
        "features": [
            "Multi-language support (English, Hindi, Marathi)",
            "Dynamic AI responses",
            "Context-aware conversations"
        ],
        "technology": "Flask + Google Gemini AI"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=False, host="0.0.0.0", port=port)
