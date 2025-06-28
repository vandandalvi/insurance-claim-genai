import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, FileText, CheckCircle, XCircle, User, Calendar, MapPin, DollarSign, Activity, ArrowRight, AlertCircle, Loader, AlertTriangle, Eye, Clock, Building, Camera } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';

export default function Claim() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setCapturedImage(null);
      setExtractedData(null);
      setIsVerified(false);
      setVerificationError('');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setCapturedImage(URL.createObjectURL(blob));
        setExtractedData(null);
        setIsVerified(false);
        setVerificationError('');
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setExtractedData(null);
    setIsVerified(false);
    setVerificationError('');
    startCamera();
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setExtractedText('');
    setExtractedData(null);
    setVerificationError('');

    try {
      // Step 1: OCR Processing
      setProcessingStep('Extracting text from document...');
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(selectedFile);
      setExtractedText(text);
      await worker.terminate();

      // Step 2: AI Analysis
      setProcessingStep('Analyzing document with AI...');
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Use environment variable for API URL, fallback to localhost for development
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const result = response.data;
      setExtractedData(result);

      // Step 3: Simple Verification - Just check if we got basic info
      setProcessingStep('Verifying information...');
      
      // Debug logging
      console.log('Extracted Data:', result);
      console.log('User Data:', user);

      // Simple verification - just check if we have basic information
      const hasBasicInfo = result.name || result.age || result.hospital || result.amount;

      if (!hasBasicInfo) {
        setIsVerified(false);
        setVerificationError("Could not extract sufficient information from the document. Please ensure the image is clear and contains patient details.");
        setProcessingStep('Verification failed - insufficient data');
      } else {
        // If we have basic info, consider it verified
        setIsVerified(true);
        setProcessingStep('Verification successful!');
      }

    } catch (error) {
      console.error('Error processing image:', error);
      
      // More specific error messages
      if (error.response) {
        // Server responded with error
        if (error.response.status === 500) {
          setVerificationError('Server error: Please try again or contact support.');
        } else if (error.response.status === 413) {
          setVerificationError('File too large. Please use a smaller image file.');
        } else {
          setVerificationError(`Server error (${error.response.status}): ${error.response.data?.error || 'Unknown error'}`);
        }
      } else if (error.request) {
        // Network error
        setVerificationError('Network error: Please check your internet connection and try again.');
      } else {
        // Other errors
        setVerificationError('Error processing image. Please try again with a different image.');
      }
      setProcessingStep('Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setExtractedText('');
    setExtractedData(null);
    setCapturedImage(null);
    setIsVerified(false);
    setVerificationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const proceedToClaim = () => {
    navigate('/verify', { 
      state: { 
        extracted: extractedData,
        ocrText: extractedText,
        user: user
      } 
    });
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

          {/* Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Upload from Device</h3>
              <p className="text-gray-600 mb-4">Select an image file from your device</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose File
              </button>
            </div>

            {/* Camera Capture */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Take Photo</h3>
              <p className="text-gray-600 mb-4">Capture bill using your camera</p>
              <button
                onClick={startCamera}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Open Camera
              </button>
            </div>
          </div>

          {/* Camera Interface */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">📸 Camera</h3>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg mb-4"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    📷 Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">📷 Captured Image</h3>
              <div className="relative inline-block">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="max-w-full h-64 object-contain border rounded-lg"
                />
                <button
                  onClick={retakePhoto}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  🔄
                </button>
              </div>
            </div>
          )}

          {/* Selected File Info */}
          {selectedFile && !capturedImage && (
            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">File Selected</p>
                  <p className="text-green-600">{selectedFile.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={processImage}
              disabled={!selectedFile || isProcessing}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Process Document
                </>
              )}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Your Document</h3>
              <p className="text-gray-600 mb-4">Hang on, we're processing and verifying your document automatically in our system</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">{processingStep}</p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Results */}
        {extractedData && !isProcessing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isVerified 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                {isVerified ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <XCircle className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Extracted Information</h2>
              <p className={`text-lg font-semibold ${
                isVerified ? 'text-green-600' : 'text-red-600'
              }`}>
                {isVerified ? '✅ Verification Successful' : '❌ Verification Failed'}
              </p>
            </div>

            {/* Extracted Data Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-lg font-semibold text-gray-900">{extractedData.name || 'Not found'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Age</p>
                    <p className="text-lg font-semibold text-gray-900">{extractedData.age || 'Not found'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hospital Name</p>
                    <p className="text-lg font-semibold text-gray-900">{extractedData.hospital || 'Not found'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reason</p>
                    <p className="text-lg font-semibold text-gray-900">{extractedData.reason || 'Not found'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <span className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 font-bold text-lg">₹</span>
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Bill Amount</p>
                    <p className="text-2xl font-bold text-green-800">₹{extractedData.amount || '0'}</p>
                  </div>
                </div>

                {extractedData.date && (
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date</p>
                      <p className="text-lg font-semibold text-gray-900">{extractedData.date}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Error */}
            {verificationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">{verificationError}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center">
              {isVerified ? (
                <button 
                  onClick={proceedToClaim}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <span>Process for Claiming</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-red-600 font-medium">Please try again uploading your document</p>
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={resetForm}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300"
                    >
                      Upload New Document
                    </button>
                    {extractedData && (extractedData.name || extractedData.age || extractedData.hospital || extractedData.amount) && (
                      <button 
                        onClick={proceedToClaim}
                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all duration-300"
                      >
                        Proceed Anyway
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fraud Detection Alert */}
        {extractedData && extractedData.fraud_detection && (
          <div className={`p-6 rounded-xl border ${getRiskLevelColor(extractedData.fraud_detection.risk_level)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getRiskLevelIcon(extractedData.fraud_detection.risk_level)}
                <div>
                  <h3 className="text-lg font-semibold">Fraud Risk Assessment</h3>
                  <p className="text-sm opacity-80">AI-powered security analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{extractedData.fraud_detection.fraud_score}%</div>
                <div className="text-sm opacity-80">Risk Score</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  extractedData.fraud_detection.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                  extractedData.fraud_detection.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {extractedData.fraud_detection.risk_level} Risk
                </span>
              </div>
              
              {extractedData.fraud_detection.fraud_reasons.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Risk Factors:</p>
                  <ul className="space-y-1">
                    {extractedData.fraud_detection.fraud_reasons.map((reason, index) => (
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

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Instructions</h3>
          <ul className="text-blue-700 space-y-2">
            <li>• Ensure the hospital bill is clearly visible and well-lit</li>
            <li>• Include all relevant information: patient name, amount, hospital details</li>
            <li>• Supported formats: JPG, PNG, JPEG</li>
            <li>• Maximum file size: 10MB</li>
            <li>• Use camera capture for best results with physical documents</li>
          </ul>
        </div>
      </main>
    </div>
  );
}