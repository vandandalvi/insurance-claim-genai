from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from PIL import Image
import re
import json
import os

app = Flask(__name__)
CORS(app)

# Get API key from environment variable or use default
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyBFDlFeegYHOL-ZxOP_LK7d0aNvZ2spmxI")
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
        image_file = request.files["file"]
        img = Image.open(image_file.stream)

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

        chat = model.start_chat()
        response = chat.send_message([prompt, img])

        text = response.text
        print("Gemini Output:", text)

        # Extract JSON manually
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            extracted = json.loads(json_match.group())
        else:
            extracted = {"raw": text.strip()}

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
        except:
            pass

        # Perform fraud detection analysis
        fraud_analysis = analyze_fraud_indicators(extracted, user_data)
        
        # Combine results
        result = {
            **extracted,
            "fraud_detection": fraud_analysis
        }

        return jsonify(result)

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
