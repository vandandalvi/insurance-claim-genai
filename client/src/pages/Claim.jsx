import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, FileText, CheckCircle, XCircle, User, Calendar, MapPin, DollarSign, Activity, ArrowRight, AlertCircle, Loader, AlertTriangle, Eye, Clock, Building } from 'lucide-react';
import { createWorker } from 'tesseract.js';

export default function Claim() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setExtracted(null);
    setError('');
  };

  const extractInfo = (text) => {
    // Match key info using regex patterns
    const name = text.match(/Name[:\-]?\s*(.+)/i)?.[1]?.trim();
    const age = text.match(/Age[:\-]?\s*(\d{1,3})/i)?.[1];
    const reason = text.match(/Reason[:\-]?\s*(.+)/i)?.[1]?.trim();
    const hospital = text.match(/Hospital[:\-]?\s*(.+)/i)?.[1]?.trim();

    return {
      name: name || "Not found",
      age: age || "Not found",
      reason: reason || "Not found",
      hospital: hospital || "Not found",
    };
  };

  const handleExtract = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setExtracted(null);

    // Get actual user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setError("❌ User not logged in. Please log in again.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Sending request to backend...");
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      
      const data = await res.json();
      console.log("Response data:", data);
      console.log("User from localStorage:", user);

      if (data.error) {
        setError("❌ Gemini Error: " + data.error);
      } else {
        // Robust name matching
        const nameMatch = data.name && user.name && 
          data.name.toLowerCase().trim().includes(user.name.toLowerCase().trim());
        
        // Robust age matching with better error handling
        const extractedAge = data.age ? parseInt(data.age.toString().replace(/\D/g, ''), 10) : null;
        const userAge = user.age ? parseInt(user.age.toString().replace(/\D/g, ''), 10) : null;
        const ageMatch = extractedAge && userAge && extractedAge === userAge;
        
        data.userVerified = nameMatch && ageMatch;

        if (!data.userVerified) {
          let errorMsg = "❌ Verification failed: ";
          if (!nameMatch) errorMsg += "Name doesn't match your profile. ";
          if (!ageMatch) errorMsg += "Age doesn't match your profile. ";
          if (!data.name) errorMsg += "Name not found in document. ";
          if (!data.age) errorMsg += "Age not found in document. ";
          setError(errorMsg.trim());
        }

        setExtracted(data);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("❌ Failed to connect to backend. Error: " + err.message);
    }

    setLoading(false);
  };
 
  const handleNext = () => {
    navigate("/verify", { state: { extracted } });
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLevelIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'Low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ClaimSense
                </h1>
                <p className="text-xs text-gray-500">File Your Insurance Claim</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Upload Document</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Verify Information</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Submit Claim</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Hospital Bill</h2>
            <p className="text-gray-600">Upload a clear image of your hospital bill for AI-powered information extraction</p>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}>
                <div className="flex flex-col items-center">
                  <Upload className={`w-12 h-12 mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
                  {file ? (
                    <div>
                      <p className="text-green-600 font-medium mb-1">File Selected</p>
                      <p className="text-sm text-gray-600">{file.name}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden"
              />
            </label>
          </div>

          {/* Extract Button */}
          <div className="text-center">
            <button 
              onClick={handleExtract} 
              disabled={!file || loading}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                !file || loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Extracting Information...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Extract Info with AI</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Information */}
        {extracted && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Extracted Information</h3>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                extracted.userVerified 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {extracted.userVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{extracted.userVerified ? 'Verified' : 'Not Verified'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patient Name</p>
                    <p className="text-gray-900 font-semibold">{extracted.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Age</p>
                    <p className="text-gray-900 font-semibold">{extracted.age}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hospital</p>
                    <p className="text-gray-900 font-semibold">{extracted.hospital}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Treatment Reason</p>
                    <p className="text-gray-900 font-semibold">{extracted.reason}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <span className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 font-bold text-lg">₹</span>
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Bill Amount</p>
                    <p className="text-2xl font-bold text-green-800">₹{extracted.amount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            {!extracted.userVerified && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-800 font-medium">Verification Required</h4>
                    <p className="text-amber-700 text-sm mt-1">
                      The name or age in the document doesn't match your profile. Please ensure the document belongs to you.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Button */}
            <div className="text-center">
              <button 
                onClick={handleNext} 
                disabled={!extracted.userVerified}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  !extracted.userVerified 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>Check Eligibility</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Fraud Detection Alert */}
        {extracted && extracted.fraud_detection && (
          <div className={`p-6 rounded-xl border ${getRiskLevelColor(extracted.fraud_detection.risk_level)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getRiskLevelIcon(extracted.fraud_detection.risk_level)}
                <div>
                  <h3 className="text-lg font-semibold">Fraud Risk Assessment</h3>
                  <p className="text-sm opacity-80">AI-powered security analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{extracted.fraud_detection.fraud_score}%</div>
                <div className="text-sm opacity-80">Risk Score</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  extracted.fraud_detection.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                  extracted.fraud_detection.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {extracted.fraud_detection.risk_level} Risk
                </span>
              </div>
              
              {extracted.fraud_detection.fraud_reasons.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Risk Factors:</p>
                  <ul className="space-y-1">
                    {extracted.fraud_detection.fraud_reasons.map((reason, index) => (
                      <li key={index} className="text-sm flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Need Help?</h3>
            <p className="text-blue-100 text-sm">
              Having trouble uploading your document? Our support team is here to help you 24/7.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}