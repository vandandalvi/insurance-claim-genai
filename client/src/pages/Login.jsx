import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, Lock, ArrowRight, CheckCircle, Copy, Users } from 'lucide-react';
import users from '../data/users';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp !== '2222') {
      alert('Invalid OTP. Please use 2222 for demo purposes.');
      setIsLoading(false);
      return;
    }

    const user = users.find((u) => u.mobile === mobile);
    if (!user) {
      alert('Mobile number not registered. Please contact customer support.');
      setIsLoading(false);
      return;
    }

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify({
      mobile: user.mobile,
      name: user.name,
      age: user.age
    }));

    // Simulate successful login
    setLoginSuccess(true);
    setIsLoading(false);
    
    // Navigate to dashboard after 2 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleDemoNumberClick = (demoNumber) => {
    setMobile(demoNumber);
    setCopiedNumber(demoNumber);
    setTimeout(() => setCopiedNumber(''), 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    setTimeout(() => setCopiedNumber(''), 2000);
  };

  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Successful!</h2>
          <p className="text-gray-600 mb-4">Welcome to your SecureLife Insurance dashboard.</p>
          <div className="text-sm text-gray-500">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.3'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">ClaimSense</h1>
              <p className="text-blue-100 text-sm">AI-Powered Insurance Claims</p>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Please sign in to access your account</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    maxLength="10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {mobile.length === 10 && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
                
                {/* Demo Numbers Section */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Demo Accounts:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDemoNumberClick('9028833979')}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                        mobile === '9028833979' 
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>Vandan Dalvi</span>
                      {copiedNumber === '9028833979' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDemoNumberClick('9123456780')}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                        mobile === '9123456780' 
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>Shravani Rangnekar</span>
                      {copiedNumber === '9123456780' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Quick fill demo numbers:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyToClipboard('9028833979')}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Copy 9028833979
                      </button>
                      <button
                        onClick={() => copyToClipboard('9123456780')}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Copy 9123456780
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  One-Time Password
                </label>
                <input
                  type="text"
                  placeholder="Enter OTP (Demo: 2222)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  maxLength="4"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">For demo purposes, use OTP: 2222</p>
                  <button
                    onClick={() => copyToClipboard('2222')}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Copy OTP
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading || !mobile || !otp}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center space-y-3">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  Forgot your password?
                </a>
                <div className="text-sm text-gray-600">
                  New customer?{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Register here
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-800">Demo Instructions</h3>
              <p className="text-xs text-gray-600 mt-1">
                1. Click on any demo account to auto-fill mobile number<br/>
                2. Use OTP: 2222 for all demo accounts<br/>
                3. Test the complete insurance claim flow with AI features
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 ClaimSense. All rights reserved.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}