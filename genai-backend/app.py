from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from PIL import Image
import re
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment variable
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("⚠️  WARNING: GEMINI_API_KEY not found in environment variables!")
    print("📝 Please set your API key using one of these methods:")
    print("   1. Create a .env file in genai-backend folder with: GEMINI_API_KEY=your_key_here")
    print("   2. Set environment variable: export GEMINI_API_KEY=your_key_here")
    print("   3. Replace 'YOUR_VALID_GEMINI_API_KEY_HERE' in this file with your key")
    api_key = "AIzaSyC9uHGCFi76BCW0HrZQpVPv6DQHZzDa_UM"  # Your actual API key

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

def analyze_fraud_indicators(extracted_data, user_data):
    """Analyze potential fraud indicators"""
    fraud_score = 0
    fraud_reasons = []
    risk_level = "Low"
    
    # Check for suspicious patterns
    if extracted_data.get("amount"):
        amount = float(extracted_data["amount"])
        
        # High amount flag
        if amount > 50000:
            fraud_score += 20
            fraud_reasons.append("High claim amount (>₹50,000)")
        
        # Round number suspiciousness
        if amount % 10000 == 0 and amount > 10000:
            fraud_score += 15
            fraud_reasons.append("Suspicious round number amount")
    
    # Check hospital verification
    hospital = extracted_data.get("hospital", "").lower()
    suspicious_hospitals = ["unknown", "test", "demo", "sample", "fake"]
    if any(susp in hospital for susp in suspicious_hospitals):
        fraud_score += 30
        fraud_reasons.append("Unverified or suspicious hospital name")
    
    # Check for duplicate patterns
    if user_data and user_data.get("insurancePolicy", {}).get("claimedAmount", 0) > 0:
        fraud_score += 10
        fraud_reasons.append("Previous claims detected")
    
    # Check name consistency
    if extracted_data.get("name") and user_data and user_data.get("name"):
        extracted_name = extracted_data["name"].lower().replace(" ", "")
        user_name = user_data["name"].lower().replace(" ", "")
        if extracted_name != user_name:
            fraud_score += 25
            fraud_reasons.append("Name mismatch with user profile")
    
    # Determine risk level
    if fraud_score >= 50:
        risk_level = "High"
    elif fraud_score >= 25:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    return {
        "fraud_score": fraud_score,
        "fraud_reasons": fraud_reasons,
        "risk_level": risk_level,
        "is_suspicious": fraud_score >= 25
    }

@app.route("/upload", methods=["POST"])
def upload():
    try:
        print("📸 Upload endpoint called")
        
        # Check if file is present
        if "file" not in request.files:
            print("❌ No file in request")
            return jsonify({"error": "No file provided"}), 400
        
        image_file = request.files["file"]
        if image_file.filename == '':
            print("❌ No file selected")
            return jsonify({"error": "No file selected"}), 400
        
        print(f"📁 File received: {image_file.filename}")
        
        # Open and validate image
        try:
            img = Image.open(image_file.stream)
            print(f"🖼️ Image opened successfully: {img.size}")
        except Exception as img_error:
            print(f"❌ Error opening image: {img_error}")
            return jsonify({"error": f"Invalid image file: {str(img_error)}"}), 400

        # Check API key
        if not api_key or api_key == "YOUR_VALID_GEMINI_API_KEY_HERE":
            print("❌ Invalid API key")
            return jsonify({"error": "API key not configured properly"}), 500

        print("🔑 API key validated, calling Gemini AI...")

        # Enhanced prompt for better extraction and fraud detection
        prompt = """
        You are a document extraction and fraud detection assistant. From the hospital bill image, extract:
        - Name (exact as written)
        - Age (number only)
        - Reason (treatment/diagnosis)
        - Hospital (full name)
        - Total bill amount (numbers only, no currency symbols)
        - Date of service (if visible)
        - Doctor name (if visible)

        Also analyze for potential fraud indicators:
        - Document quality and authenticity
        - Suspicious patterns in amounts
        - Unusual hospital names
        - Missing critical information

        Return in JSON format:
        {
          "name": "...",
          "age": "...",
          "reason": "...",
          "hospital": "...",
          "amount": "...",
          "date": "...",
          "doctor": "...",
          "document_quality": "good/medium/poor",
          "suspicious_patterns": ["pattern1", "pattern2"],
          "missing_info": ["info1", "info2"]
        }
        """

        try:
            chat = model.start_chat()
            print("💬 Chat session started")
            
            response = chat.send_message([prompt, img])
            print("✅ Gemini AI response received")
            
            text = response.text
            print("📝 Gemini Output:", text[:200] + "..." if len(text) > 200 else text)

            # Extract JSON manually
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                try:
                    extracted = json.loads(json_match.group())
                    print("✅ JSON extracted successfully")
                except json.JSONDecodeError as json_error:
                    print(f"❌ JSON parsing error: {json_error}")
                    extracted = {"raw": text.strip(), "error": "JSON parsing failed"}
            else:
                print("❌ No JSON found in response")
                extracted = {"raw": text.strip(), "error": "No structured data found"}

        except Exception as ai_error:
            print(f"❌ Gemini AI error: {ai_error}")
            return jsonify({"error": f"AI processing failed: {str(ai_error)}"}), 500

        # Get user data for fraud analysis
        user_data = None
        try:
            # In a real app, you'd get this from your database
            # For demo, we'll use mock data
            user_data = {
                "name": "Vandan Dalvi",
                "age": 26,
                "insurancePolicy": {
                    "claimedAmount": 200000
                }
            }
            print("👤 User data loaded for fraud analysis")
        except Exception as user_error:
            print(f"❌ Error loading user data: {user_error}")
            pass

        # Perform fraud detection analysis
        try:
            fraud_analysis = analyze_fraud_indicators(extracted, user_data)
            print("🛡️ Fraud analysis completed")
        except Exception as fraud_error:
            print(f"❌ Fraud analysis error: {fraud_error}")
            fraud_analysis = {
                "fraud_score": 0,
                "fraud_reasons": ["Analysis failed"],
                "risk_level": "Unknown",
                "is_suspicious": False
            }
        
        # Combine results
        result = {
            **extracted,
            "fraud_detection": fraud_analysis
        }

        print("✅ Processing completed successfully")
        return jsonify(result)

    except Exception as e:
        print(f"❌ General error in upload endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "ClaimSense Backend is running",
        "api_key_configured": bool(api_key and api_key != "YOUR_VALID_GEMINI_API_KEY_HERE"),
        "gemini_model": "gemini-1.5-flash"
    })

@app.route("/test", methods=["GET"])
def test_endpoint():
    return jsonify({
        "message": "Backend is working!",
        "timestamp": "2024-01-01T00:00:00Z"
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "message": "The requested API endpoint does not exist",
        "available_endpoints": [
            "GET / - Health check",
            "POST /upload - Upload and process documents",
            "GET /test - Test endpoint"
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
@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify({
        "status": "operational",
        "service": "ClaimSense Backend",
        "version": "1.0.0",
        "endpoints": {
            "health": "/",
            "upload": "/upload",
            "test": "/test",
            "status": "/api/status"
        }
    })

@app.route("/api/info", methods=["GET"])
def api_info():
    return jsonify({
        "name": "ClaimSense Backend API",
        "description": "AI-powered insurance claim processing backend",
        "features": [
            "Document OCR and extraction",
            "Fraud detection",
            "AI-powered analysis"
        ],
        "technology": "Flask + Google Gemini AI"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
