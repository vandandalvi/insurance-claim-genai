import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, FileText, CheckCircle, XCircle, User, Calendar, MapPin, DollarSign, Activity, ArrowRight, AlertCircle, Loader, AlertTriangle, Eye, Clock, Building, Camera } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';
import willApproveImage from '../assets/willApprove.png';
import willNotApprovedImage from '../assets/willNotApproved.jpg';

export default function Claim() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewImageName, setPreviewImageName] = useState('');
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
      console.log('Starting camera...');
      setCameraError(null);
      showLoadingIndicator();
      
      // Add timeout for camera loading
      const cameraTimeout = setTimeout(() => {
        console.log('Camera loading timeout');
        setCameraError('Camera took too long to load. Please try again or use file upload.');
        hideLoadingIndicator();
      }, 10000); // 10 seconds timeout
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('Camera API not supported');
        setCameraAvailable(false);
        setCameraError('Camera is not supported in this browser. Please use a modern browser or upload a file instead.');
        alert('Camera is not supported in this browser. Please use a modern browser or upload a file instead.');
        hideLoadingIndicator();
        clearTimeout(cameraTimeout);
        return;
      }

      console.log('Camera API supported, requesting access...');
      
      // Try to get camera stream with fallback constraints
      let stream;
      try {
        // First try with back camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: 'environment' // Use back camera
          },
          audio: false
        });
      } catch (backCameraError) {
        console.log('Back camera failed, trying front camera...');
        try {
          // Fallback to front camera
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              facingMode: 'user' // Use front camera
            },
            audio: false
          });
        } catch (frontCameraError) {
          console.log('Front camera failed, trying any camera...');
          // Last resort: try any camera
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false
          });
        }
      }
      
      console.log('Camera stream obtained:', stream);
      console.log('Stream tracks:', stream.getTracks());
      
      setCameraStream(stream);
      setShowCamera(true);
      setCameraAvailable(true);
      
      // Set up video element with better error handling
      if (videoRef.current) {
        console.log('Setting up video element...');
        
        // Clear any existing stream
        videoRef.current.srcObject = null;
        
        // Set the new stream
        videoRef.current.srcObject = stream;
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, starting playback...');
          console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          
          videoRef.current.play().then(() => {
            console.log('Video playback started successfully');
            hideLoadingIndicator();
            clearTimeout(cameraTimeout);
          }).catch((playError) => {
            console.error('Error starting video playback:', playError);
            setCameraError('Failed to start video playback: ' + playError.message);
            hideLoadingIndicator();
            clearTimeout(cameraTimeout);
          });
        };
        
        videoRef.current.onloadeddata = () => {
          console.log('Video data loaded');
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play');
        };
        
        videoRef.current.onplaying = () => {
          console.log('Video is playing');
          hideLoadingIndicator();
          clearTimeout(cameraTimeout);
        };
        
        videoRef.current.onerror = (error) => {
          console.error('Video element error:', error);
          setCameraError('Video element error: ' + error.message);
          hideLoadingIndicator();
          clearTimeout(cameraTimeout);
        };
        
        // Force video to load
        videoRef.current.load();
        
      } else {
        console.error('Video ref not available');
        setCameraError('Video element not found');
        hideLoadingIndicator();
        clearTimeout(cameraTimeout);
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraAvailable(false);
      hideLoadingIndicator();
      
      // Provide specific error messages
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on your device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not meet the required constraints.';
      } else if (error.name === 'TypeError') {
        errorMessage += 'Camera access failed. Please try uploading a file instead.';
      } else {
        errorMessage += 'Please check camera permissions or try uploading a file instead.';
      }
      
      setCameraError(errorMessage);
      console.log('Camera error:', errorMessage);
      alert(errorMessage);
      
      // Fallback: Show file upload option
      console.log('Camera failed, suggesting file upload as fallback');
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

      // Check if OCR extracted any meaningful text
      if (!text || text.trim().length < 10) {
        setIsVerified(false);
        setVerificationError("❌ No readable text found in the image. Please ensure:\n• The image is clear and not blurry\n• The document contains text (not just images)\n• The text is properly oriented\n• There's sufficient lighting");
        setProcessingStep('OCR failed - no readable text');
        setIsProcessing(false);
        return;
      }

      console.log('OCR Text extracted:', text);

      // Step 2: AI Analysis
      setProcessingStep('Analyzing document with AI...');
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Use environment variable for API URL, fallback to localhost for development
      const apiUrl = import.meta.env.VITE_API_URL=https://claimsense-backend-oe74.onrender.com
      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const result = response.data;
      setExtractedData(result);

      // Step 3: Enhanced Verification with detailed feedback
      setProcessingStep('Verifying information...');
      
      // Debug logging
      console.log('Extracted Data:', result);
      console.log('User Data:', user);

      // Check what information was extracted
      const extractedFields = {
        name: result.name,
        age: result.age,
        hospital: result.hospital,
        amount: result.amount,
        reason: result.reason
      };

      console.log('Extracted fields:', extractedFields);

      // Count how many fields were successfully extracted
      const extractedCount = Object.values(extractedFields).filter(field => 
        field && field.toString().trim().length > 0
      ).length;

      console.log('Fields extracted:', extractedCount, 'out of 5');

      // CRITICAL: Verify that the extracted name matches the logged-in user's name
      const verifyNameMatch = () => {
        if (!extractedFields.name || !user || !user.name) {
          return false;
        }
        
        // Normalize names for comparison (remove spaces, convert to lowercase)
        const extractedName = extractedFields.name.toLowerCase().replace(/\s+/g, '');
        const userName = user.name.toLowerCase().replace(/\s+/g, '');
        
        console.log('Name comparison:', {
          extracted: extractedName,
          user: userName,
          match: extractedName === userName
        });
        
        return extractedName === userName;
      };

      const nameMatches = verifyNameMatch();

      // Check for quality indicators that suggest a rejected document
      const checkDocumentQuality = () => {
        const qualityIssues = [];
        
        // Check if name is missing or unclear
        if (!extractedFields.name || extractedFields.name.length < 2) {
          qualityIssues.push('Patient name is missing or unclear');
        }
        
        // Check if amount is missing or invalid
        if (!extractedFields.amount || isNaN(extractedFields.amount) || extractedFields.amount <= 0) {
          qualityIssues.push('Bill amount is missing or invalid');
        }
        
        // Check if hospital name is missing or too short
        if (!extractedFields.hospital || extractedFields.hospital.length < 3) {
          qualityIssues.push('Hospital name is missing or unclear');
        }
        
        // Check if we have very little text overall (suggesting poor quality)
        if (extractedText && extractedText.trim().length < 50) {
          qualityIssues.push('Document contains very little readable text');
        }
        
        return qualityIssues;
      };

      const qualityIssues = checkDocumentQuality();
      const hasQualityIssues = qualityIssues.length > 0;

      if (extractedCount === 0) {
        // No information extracted at all
        setIsVerified(false);
        setVerificationError(`❌ No relevant information could be extracted from this image.\n\nPossible reasons:\n• This is not a hospital bill or medical document\n• The image is too blurry or unclear\n• The document format is not recognized\n• The text is not in English\n\nPlease try uploading a clear image of a hospital bill or medical document.`);
        setProcessingStep('Verification failed - no relevant data');
      } else if (!nameMatches) {
        // Name doesn't match the logged-in user
        setIsVerified(false);
        setVerificationError(`❌ Name verification failed!\n\nExtracted name: "${extractedFields.name}"\nLogged-in user: "${user?.name}"\n\nThis document appears to belong to a different person. Please ensure you're uploading your own hospital bill or log in with the correct account.`);
        setProcessingStep('Verification failed - name mismatch');
      } else if (hasQualityIssues) {
        // Document has quality issues that make it unsuitable
        setIsVerified(false);
        setVerificationError(`❌ Document quality issues detected!\n\nProblems found:\n• ${qualityIssues.join('\n• ')}\n\nPlease upload a clearer, more complete hospital bill image.`);
        setProcessingStep('Verification failed - quality issues');
      } else if (extractedCount < 3) {
        // Some information extracted but not enough
        const missingFields = [];
        if (!extractedFields.name) missingFields.push('Patient Name');
        if (!extractedFields.age) missingFields.push('Age');
        if (!extractedFields.hospital) missingFields.push('Hospital Name');
        if (!extractedFields.amount) missingFields.push('Amount');
        if (!extractedFields.reason) missingFields.push('Treatment Reason');

        setIsVerified(false);
        setVerificationError(`⚠️ Partial information extracted (${extractedCount}/5 fields).\n\nMissing information:\n• ${missingFields.join('\n• ')}\n\nPlease ensure the image clearly shows all required information or try a different document.`);
        setProcessingStep('Verification failed - incomplete data');
      } else {
        // Sufficient information extracted, name matches, and no quality issues
        setIsVerified(true);
        setProcessingStep('Verification successful!');
      }

    } catch (error) {
      console.error('Error processing image:', error);
      
      // Enhanced error handling with specific messages
      if (error.response) {
        // Server responded with error
        if (error.response.status === 500) {
          setVerificationError('❌ Server error occurred while processing the image. This might be due to:\n• Unsupported image format\n• Corrupted image file\n• Server temporarily unavailable\n\nPlease try again or use a different image.');
        } else if (error.response.status === 413) {
          setVerificationError('❌ File too large. Please use an image smaller than 10MB.');
        } else if (error.response.status === 400) {
          setVerificationError('❌ Invalid image format. Please upload a valid image file (JPG, PNG, etc.).');
        } else {
          setVerificationError(`❌ Server error (${error.response.status}): ${error.response.data?.error || 'Unknown server error'}\n\nPlease try again or contact support.`);
        }
      } else if (error.request) {
        // Network error
        setVerificationError('❌ Network error: Unable to connect to the server.\n\nPlease check your internet connection and try again.');
      } else {
        // Other errors (like OCR failures)
        if (error.message.includes('OCR') || error.message.includes('text')) {
          setVerificationError('❌ Text extraction failed. The image might be:\n• Too blurry or unclear\n• Not containing readable text\n• In an unsupported language\n• Upside down or rotated\n\nPlease try a clearer image with readable text.');
        } else {
          setVerificationError(`❌ Error processing image: ${error.message}\n\nPlease try again with a different image.`);
        }
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

  // Test camera availability on component mount
  const testCameraAvailability = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraAvailable(false);
        return;
      }
      
      // Just check if we can enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setCameraAvailable(false);
        setCameraError('No camera found on this device');
      } else {
        setCameraAvailable(true);
        console.log('Camera devices found:', videoDevices.length);
      }
    } catch (error) {
      console.error('Error testing camera availability:', error);
      setCameraAvailable(false);
    }
  };

  // Test camera on component mount
  useEffect(() => {
    testCameraAvailability();
  }, []);

  const hideLoadingIndicator = () => {
    const loadingElement = document.getElementById('camera-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  };

  const showLoadingIndicator = () => {
    const loadingElement = document.getElementById('camera-loading');
    if (loadingElement) {
      loadingElement.style.display = 'flex';
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
              
              {/* Camera Status Indicator */}
              <div className="mb-3">
                {cameraAvailable ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700">Camera Available</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-red-700">Camera Unavailable</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={startCamera}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                📷 Open Camera
              </button>
              
              {/* Camera Test Button for Debugging */}
              <button
                onClick={() => {
                  console.log('Testing camera...');
                  console.log('navigator.mediaDevices:', navigator.mediaDevices);
                  console.log('getUserMedia available:', !!navigator.mediaDevices?.getUserMedia);
                  testCameraAvailability();
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                🔧 Test Camera
              </button>
              
              {/* Camera Fallback Notice */}
              <p className="text-xs text-gray-500 mt-2">
                💡 If camera doesn't work, use file upload above
              </p>
              
              {/* Camera Error Display */}
              {cameraError && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">
                    ⚠️ {cameraError}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Demo Guide for Judges */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">👨‍⚖️</span>
              <h3 className="font-semibold text-blue-800">Demo Guide for Judges</h3>
            </div>
            
            {/* Important Note */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Important Note:</p>
                  <p className="text-xs text-yellow-700">
                    Sample images work best with <strong>Vandan Dalvi</strong> demo account (Mobile: 9028833979). 
                    Other accounts may show different verification results.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    <strong>Security Feature:</strong> The system verifies that the document name matches the logged-in user's name.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-medium mb-2">✅ Approved Scenario:</h4>
                <ul className="space-y-1 ml-4">
                  <li>• Clear hospital bill image</li>
                  <li>• AI extracts all required fields</li>
                  <li>• Low fraud risk score</li>
                  <li>• Verification successful</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">❌ Rejected Scenario:</h4>
                <ul className="space-y-1 ml-4">
                  <li>• Blurry or unclear document</li>
                  <li>• AI fails to extract data</li>
                  <li>• Detailed error messages</li>
                  <li>• Helpful suggestions provided</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3 text-center">
              💡 Click the sample buttons below to see both scenarios in action!
            </p>
          </div>

          {/* Sample Images for Demo */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-3 text-center">🎯 Demo Images for Judges</h3>
            <p className="text-sm text-purple-700 text-center mb-4">Click these buttons to quickly showcase different scenarios</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Approved Sample */}
              <div className="text-center">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Create a file from the sample image
                      fetch(willApproveImage)
                        .then(response => response.blob())
                        .then(blob => {
                          const file = new File([blob], 'approved-sample.png', { type: 'image/png' });
                          setSelectedFile(file);
                          setCapturedImage(null);
                          setExtractedData(null);
                          setIsVerified(false);
                          setVerificationError('');
                          console.log('✅ Loaded approved sample image');
                        })
                        .catch(error => {
                          console.error('Error loading approved sample:', error);
                          alert('Error loading sample image. Please try again.');
                        });
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">✅</span>
                      <div className="text-left">
                        <div className="font-semibold">Approved Claim Sample</div>
                        <div className="text-xs opacity-90">Clear hospital bill - Will be approved</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setPreviewImageUrl(willApproveImage);
                      setPreviewImageName('Approved Sample - Clear Hospital Bill');
                      setShowImagePreview(true);
                    }}
                    className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors border border-green-300 text-sm font-medium"
                  >
                    👁️ View Image
                  </button>
                </div>
              </div>

              {/* Rejected Sample */}
              <div className="text-center">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Create a file from the sample image
                      fetch(willNotApprovedImage)
                        .then(response => response.blob())
                        .then(blob => {
                          const file = new File([blob], 'rejected-sample.jpg', { type: 'image/jpeg' });
                          setSelectedFile(file);
                          setCapturedImage(null);
                          setExtractedData(null);
                          setIsVerified(false);
                          setVerificationError('');
                          console.log('❌ Loaded rejected sample image');
                        })
                        .catch(error => {
                          console.error('Error loading rejected sample:', error);
                          alert('Error loading sample image. Please try again.');
                        });
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">❌</span>
                      <div className="text-left">
                        <div className="font-semibold">Rejected Claim Sample</div>
                        <div className="text-xs opacity-90">Unclear document - Will be rejected</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setPreviewImageUrl(willNotApprovedImage);
                      setPreviewImageName('Rejected Sample - Unclear Document');
                      setShowImagePreview(true);
                    }}
                    className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors border border-red-300 text-sm font-medium"
                  >
                    👁️ View Image
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-xs text-purple-600">
                💡 These sample images demonstrate our AI's ability to distinguish between valid and invalid documents
              </p>
            </div>
          </div>

          {/* Camera Interface */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">📸 Camera</h3>
                
                {/* Camera Instructions */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📋 <strong>Instructions:</strong> Position your hospital bill clearly in the camera view. 
                    Ensure good lighting and avoid shadows.
                  </p>
                </div>
                
                {/* Video Container */}
                <div className="relative mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg border-2 border-gray-300"
                    style={{ 
                      minHeight: '300px', 
                      backgroundColor: '#000',
                      objectFit: 'cover'
                    }}
                    onLoadStart={() => console.log('Video load started')}
                    onLoadedData={() => console.log('Video data loaded')}
                    onCanPlay={() => console.log('Video can play')}
                    onPlaying={() => console.log('Video is playing')}
                    onError={(e) => console.error('Video error:', e)}
                  />
                  
                  {/* Camera Status */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    📹 Live
                  </div>
                  
                  {/* Loading Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg" 
                       id="camera-loading">
                    <div className="text-white text-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading camera...</p>
                    </div>
                  </div>
                  
                  {/* Camera Not Working Notice */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg" 
                       style={{ display: 'none' }} 
                       id="camera-notice">
                    <div className="text-white text-center p-4">
                      <p className="text-lg mb-2">📷 Camera Loading...</p>
                      <p className="text-sm">Please allow camera permissions</p>
                    </div>
                  </div>
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    📷 Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    ❌ Cancel
                  </button>
                </div>
                
                {/* Camera Troubleshooting */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    🔧 <strong>Troubleshooting:</strong> If camera doesn't work, try:
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                    <li>Allow camera permissions in browser</li>
                    <li>Use HTTPS (required for camera)</li>
                    <li>Try uploading a file instead</li>
                  </ul>
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

          {/* Sample Image Preview */}
          {selectedFile && (selectedFile.name.includes('approved-sample') || selectedFile.name.includes('rejected-sample')) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg">🎯</span>
                <h4 className="font-semibold text-yellow-800">Demo Sample Selected</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-yellow-700 mb-2">
                    <strong>File:</strong> {selectedFile.name}
                  </p>
                  <p className="text-sm text-yellow-700">
                    <strong>Type:</strong> {selectedFile.name.includes('approved') ? '✅ Approved Scenario' : '❌ Rejected Scenario'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                >
                  Clear Sample
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
              <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-red-800 font-semibold mb-2">Processing Error</h4>
                    <div className="text-red-700 whitespace-pre-line text-sm leading-relaxed">
                      {verificationError}
                    </div>
                    <div className="mt-4 p-3 bg-red-100 rounded-lg">
                      <p className="text-red-800 text-sm font-medium mb-2">💡 Quick Tips:</p>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>• Use a clear, well-lit image of a hospital bill</li>
                        <li>• Ensure text is readable and not blurry</li>
                        <li>• Make sure the document contains patient details</li>
                        <li>• Try different angles if the first attempt fails</li>
                      </ul>
                    </div>
                  </div>
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

        {/* Standalone Error Display - When processing fails completely */}
        {verificationError && !extractedData && !isProcessing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Failed</h2>
              <p className="text-lg font-semibold text-red-600">❌ Unable to process document</p>
            </div>

            {/* Error Details */}
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-6">
              <div className="flex items-start space-x-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-800 font-semibold mb-2">What went wrong?</h4>
                  <div className="text-red-700 whitespace-pre-line text-sm leading-relaxed">
                    {verificationError}
                  </div>
                  <div className="mt-4 p-3 bg-red-100 rounded-lg">
                    <p className="text-red-800 text-sm font-medium mb-2">💡 How to fix this:</p>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Use a clear, well-lit image of a hospital bill</li>
                      <li>• Ensure text is readable and not blurry</li>
                      <li>• Make sure the document contains patient details</li>
                      <li>• Try different angles if the first attempt fails</li>
                      <li>• Check that the image is not corrupted</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={resetForm}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
                >
                  <span>🔄 Try Again</span>
                </button>
                <button 
                  onClick={() => setShowCamera(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
                >
                  <span>📷 Use Camera</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {showImagePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">📷 Sample Image Preview</h3>
                <button
                  onClick={() => setShowImagePreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="text-center mb-4">
                <h4 className="text-lg font-medium text-gray-700 mb-2">{previewImageName}</h4>
                <p className="text-sm text-gray-600">
                  This is the sample image that will be processed by our AI system
                </p>
              </div>
              
              <div className="flex justify-center mb-4">
                <img
                  src={previewImageUrl}
                  alt={previewImageName}
                  className="max-w-full max-h-96 object-contain border rounded-lg shadow-lg"
                />
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setShowImagePreview(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
