import { useState, useRef, useEffect } from 'react';

export default function CameraTest() {
  const [cameraSupported, setCameraSupported] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    testCamera();
  }, []);

  const testCamera = async () => {
    try {
      console.log('Testing camera support...');
      
      // Check if camera API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraSupported(false);
        setCameraError('Camera API not supported');
        return;
      }

      setCameraSupported(true);
      console.log('Camera API supported');

      // Check available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Video devices found:', videoDevices.length);

      if (videoDevices.length === 0) {
        setCameraError('No camera devices found');
        return;
      }

      console.log('Available cameras:', videoDevices.map(d => d.label || 'Unknown camera'));

    } catch (error) {
      console.error('Error testing camera:', error);
      setCameraError(error.message);
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraError(error.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Camera Test</h1>
        
        {/* Camera Support Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Camera Support</h2>
          <div className="p-3 rounded border">
            {cameraSupported === null && <p>Testing camera support...</p>}
            {cameraSupported === true && (
              <p className="text-green-600">✅ Camera API is supported</p>
            )}
            {cameraSupported === false && (
              <p className="text-red-600">❌ Camera API is not supported</p>
            )}
          </div>
        </div>

        {/* Camera Error */}
        {cameraError && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">{cameraError}</p>
            </div>
          </div>
        )}

        {/* Camera Controls */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Camera Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={startCamera}
              disabled={!cameraSupported}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Start Camera
            </button>
            <button
              onClick={stopCamera}
              disabled={!stream}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Stop Camera
            </button>
            <button
              onClick={testCamera}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Test Again
            </button>
          </div>
        </div>

        {/* Video Display */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Camera Feed</h2>
          <div className="border rounded overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-black"
            />
          </div>
        </div>

        {/* Browser Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Browser Information</h2>
          <div className="p-3 bg-gray-50 border rounded text-sm">
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            <p><strong>Platform:</strong> {navigator.platform}</p>
            <p><strong>MediaDevices:</strong> {navigator.mediaDevices ? 'Available' : 'Not Available'}</p>
            <p><strong>getUserMedia:</strong> {navigator.mediaDevices?.getUserMedia ? 'Available' : 'Not Available'}</p>
            <p><strong>HTTPS:</strong> {window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Troubleshooting</h2>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Make sure you're using HTTPS (required for camera access)</li>
              <li>Allow camera permissions when prompted</li>
              <li>Try refreshing the page if camera doesn't start</li>
              <li>Check if another app is using the camera</li>
              <li>Try a different browser if issues persist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 