import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Shield, User, Calendar, MapPin, DollarSign, Activity, ArrowRight, AlertCircle, Loader, CheckCircle, XCircle, MessageCircle, CreditCard, TrendingUp, Clock, Phone, Sparkles, Heart, AlertTriangle, Building } from 'lucide-react';
import users from "../data/users"; // adjust this path

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const [aadhar, setAadhar] = useState('');
  const [aadharStatus, setAadharStatus] = useState('');
  const [aadharVerified, setAadharVerified] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [riskLevel, setRiskLevel] = useState('');
  const [reason, setReason] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  const extracted = location.state?.extracted;
  const user = JSON.parse(localStorage.getItem("user"));

  // Find user in DB
  const fullUser = users.find(u => u.mobile === user?.mobile);

  // Debug: Log the user being used
  console.log("Current user from localStorage:", user);
  console.log("Full user from DB:", fullUser);
  console.log("User mobile:", user?.mobile);
  console.log("Expected Aadhar:", fullUser?.aadhar);

  const verifyAadhar = () => {
    if (!fullUser) {
      setAadharStatus("❌ User not found.");
      return;
    }

    // Clean the input Aadhar number (remove spaces, dashes)
    const cleanInputAadhar = aadhar.replace(/[\s-]/g, '');
    const cleanUserAadhar = fullUser.aadhar.replace(/[\s-]/g, '');

    console.log("Input Aadhar (cleaned):", cleanInputAadhar);
    console.log("User Aadhar (cleaned):", cleanUserAadhar);
    console.log("Match:", cleanInputAadhar === cleanUserAadhar);

    if (cleanInputAadhar !== cleanUserAadhar) {
      setAadharStatus(`❌ Aadhar number doesn't match our records. Expected: ${fullUser.aadhar}`);
      setEligibility(false);
      setRiskLevel("High");
      setReason("Aadhar verification failed.");
      return;
    }

    if (!fullUser.bankAccount || !fullUser.bankAccount.number) {
      setAadharStatus("❌ No bank account linked.");
      setEligibility(false);
      setRiskLevel("High");
      setReason("No bank account linked to your Aadhar.");
      return;
    }

    setAadharStatus("✅ Aadhar verified and bank account linked.");
    setAadharVerified(true);
  };

  useEffect(() => {
    if (!aadharVerified || !extracted || !fullUser) return;

    const currentClaim = parseInt(extracted.amount || 0);
    const pastClaimed = fullUser.insurancePolicy?.claimedAmount || 0;
    const coverage = fullUser.insurancePolicy?.coverage || 0;
    const remainingCoverage = coverage - pastClaimed;

    let eligible = true;
    let risk = "Low";
    let claimableAmount = 0;

    if (currentClaim > remainingCoverage) {
      eligible = false;
      risk = "High";
      setReason("Claim exceeds remaining insurance coverage.");
    } else if (currentClaim > 20000) {
      risk = "Medium";
      setReason("Claim amount is high, but within coverage.");
      claimableAmount = currentClaim;
    } else {
      setReason("✅ Eligible for insurance claim.");
      claimableAmount = currentClaim;
    }

    setRiskLevel(risk);
    setEligibility(eligible);
  }, [aadharVerified, extracted, fullUser]);

  const handleSendToAdmin = () => {
    const adminData = JSON.parse(localStorage.getItem("claims")) || [];
    adminData.push({
      ...extracted,
      mobile: fullUser.mobile,
      riskLevel,
      policy: fullUser.insurancePolicy.number
    });
    localStorage.setItem("claims", JSON.stringify(adminData));
    alert("✅ Claim sent to admin.");
    navigate("/dashboard");
  };

  // Typing animation function
  const typeMessage = (message, callback) => {
    setIsTyping(true);
    setTypingMessage('');
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < message.length) {
        setTypingMessage(prev => prev + message[index]);
        index++;
        
        // Variable typing speed for more natural feel
        const baseSpeed = 30;
        const randomVariation = Math.random() * 20 - 10; // -10 to +10ms variation
        const currentSpeed = Math.max(20, baseSpeed + randomVariation);
        
        // Clear and restart with new speed
        clearInterval(typeInterval);
        setTimeout(() => {
          const newInterval = setInterval(() => {
            if (index < message.length) {
              setTypingMessage(prev => prev + message[index]);
              index++;
            } else {
              clearInterval(newInterval);
              setIsTyping(false);
              setTypingMessage('');
              if (callback) callback();
            }
          }, currentSpeed);
        }, 0);
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTypingMessage('');
        if (callback) callback();
      }
    }, 30); // Initial speed
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    // Language detection function
    const detectLanguage = (text) => {
      const textLower = text.toLowerCase();
      
      // Hindi detection (Devanagari + Romanized)
      const hindiChars = ['ह', 'ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ओ', 'ौ', 'ं', 'ः', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ'];
      const hindiWords = ['क्या', 'है', 'में', 'का', 'की', 'के', 'और', 'या', 'फिर', 'अब', 'तो', 'भी', 'नहीं', 'हाँ', 'नहीं', 'कैसे', 'कहाँ', 'कब', 'कोण', 'का'];
      const romanizedHindiWords = ['kya', 'hai', 'mein', 'ka', 'ki', 'ke', 'aur', 'ya', 'phir', 'ab', 'to', 'bhi', 'nahi', 'haan', 'kaise', 'kahan', 'kab', 'kaun', 'kya', 'nahin', 'main', 'aap', 'tum', 'hum', 'wo', 'ye', 'us', 'is', 'unka', 'unki', 'mera', 'meri', 'tera', 'teri', 'hamara', 'hamari'];
      
      // Marathi detection (Devanagari + Romanized)
      const marathiChars = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ळ', 'क्ष', 'ज्ञ'];
      const marathiWords = ['काय', 'आहे', 'मध्ये', 'चा', 'ची', 'चे', 'आणि', 'किंवा', 'मग', 'आता', 'तर', 'देखील', 'नाही', 'होय', 'कसे', 'कुठे', 'कधी', 'कोण', 'का'];
      const romanizedMarathiWords = ['kay', 'ahe', 'madhye', 'cha', 'chi', 'che', 'ani', 'kinva', 'maga', 'aata', 'tar', 'dekhil', 'nahi', 'hoy', 'kase', 'kuthe', 'kadhi', 'kon', 'ka', 'nahi', 'mi', 'tu', 'amhi', 'to', 'he', 'te', 'tya', 'hya', 'tyacha', 'tyachi', 'maza', 'mazi', 'tuzha', 'tuzhi', 'amcha', 'amchi', 'kasa', 'ahes', 'kuthe', 'ahes', 'kadhi', 'yeil', 'kay', 'karto', 'karte', 'karto', 'karte'];
      
      if (hindiChars.some(char => text.includes(char)) || 
          hindiWords.some(word => textLower.includes(word)) ||
          romanizedHindiWords.some(word => textLower.includes(word))) {
        return 'hindi';
      }
      
      if (marathiChars.some(char => text.includes(char)) || 
          marathiWords.some(word => textLower.includes(word)) ||
          romanizedMarathiWords.some(word => textLower.includes(word))) {
        return 'marathi';
      }
      
      return 'english';
    };

    const userLanguage = detectLanguage(userMessage);

    try {
      // Include conversation history for better context
      const conversationHistory = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
      
      // Use production URLs if available, fallback to localhost for development
      const chatUrl = import.meta.env.VITE_CHAT_URL || 
                     (window.location.hostname === 'localhost' ? "http://localhost:5001" : "https://claimsense-chatbot.onrender.com");
      const res = await fetch(`${chatUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          eligibility,
          extracted,
          reason,
          conversationHistory: conversationHistory,
          messageCount: messages.length + 1,
        }),
      });

      const data = await res.json();

      if (data.error) {
        // Multi-language fallback messages - MORE DYNAMIC
        if (eligibility) {
          const fallbackMessages = {
            english: [
              `Great! Your ₹${extracted?.amount} claim is all set. Our team will reach out shortly.`,
              `Perfect! Your ₹${extracted?.amount} claim is approved and processing.`,
              `Excellent! Your ₹${extracted?.amount} claim is ready to go.`,
              `Awesome! Your ₹${extracted?.amount} claim has been processed successfully.`
            ],
            hindi: [
              `बहुत अच्छा! आपका ₹${extracted?.amount} का क्लेम तैयार है।`,
              `शानदार! आपका ₹${extracted?.amount} का क्लेम स्वीकृत हो गया है।`,
              `उत्कृष्ट! आपका ₹${extracted?.amount} का क्लेम प्रोसेस हो गया है।`,
              `बेहतरीन! आपका ₹${extracted?.amount} का क्लेम मंजूर हो गया है।`
            ],
            marathi: [
              `छान! तुमचा ₹${extracted?.amount} चा क्लेम तयार आहे.`,
              `उत्कृष्ट! तुमचा ₹${extracted?.amount} चा क्लेम मंजूर झाला आहे.`,
              `शानदार! तुमचा ₹${extracted?.amount} चा क्लेम प्रोसेस झाला आहे.`,
              `बेहतरीन! तुमचा ₹${extracted?.amount} चा क्लेम स्वीकृत झाला आहे.`
            ]
          };
          
          const messagesForLanguage = fallbackMessages[userLanguage] || fallbackMessages.english;
          const randomFallback = messagesForLanguage[Math.floor(Math.random() * messagesForLanguage.length)];
          typeMessage(randomFallback, () => {
            setMessages((prev) => [...prev, { sender: 'ai', text: randomFallback }]);
          });
        } else {
          const fallbackMessages = {
            english: [
              `Your claim couldn't be approved due to: ${reason}. Let me help you explore alternatives.`,
              `Unfortunately, your claim was rejected: ${reason}. I can help you understand your options.`,
              `Your claim couldn't be processed: ${reason}. Let me assist you with other solutions.`,
              `The claim was declined because: ${reason}. I'm here to help you find alternatives.`
            ],
            hindi: [
              `आपका क्लेम स्वीकृत नहीं हो सका: ${reason}. मैं आपको विकल्पों में मदद करूंगा।`,
              `दुर्भाग्य से आपका क्लेम अस्वीकृत हो गया: ${reason}. मैं आपको समझने में मदद करूंगा।`,
              `आपका क्लेम प्रोसेस नहीं हो सका: ${reason}. मैं आपको अन्य समाधानों में मदद करूंगा।`,
              `क्लेम अस्वीकृत हो गया क्योंकि: ${reason}. मैं आपको विकल्प खोजने में मदद करूंगा।`
            ],
            marathi: [
              `तुमचा क्लेम मंजूर होऊ शकला नाही: ${reason}. मी तुम्हाला पर्यायांमध्ये मदत करतो.`,
              `दुर्दैवाने तुमचा क्लेम नाकारला गेला: ${reason}. मी तुम्हाला समजून घेण्यात मदत करतो.`,
              `तुमचा क्लेम प्रोसेस होऊ शकला नाही: ${reason}. मी तुम्हाला इतर उपायांमध्ये मदत करतो.`,
              `क्लेम नाकारला गेला कारण: ${reason}. मी तुम्हाला पर्याय शोधण्यात मदत करतो.`
            ]
          };
          
          const messagesForLanguage = fallbackMessages[userLanguage] || fallbackMessages.english;
          const randomFallback = messagesForLanguage[Math.floor(Math.random() * messagesForLanguage.length)];
          typeMessage(randomFallback, () => {
            setMessages((prev) => [...prev, { sender: 'ai', text: randomFallback }]);
          });
        }
      } else {
        typeMessage(data.reply, () => {
          setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
        });
      }
    } catch (err) {
      // Multi-language fallback messages for network errors - MORE DYNAMIC
      if (eligibility) {
        const fallbackMessages = {
          english: [
            `Great! Your ₹${extracted?.amount} claim is all set. Our team will reach out shortly.`,
            `Perfect! Your ₹${extracted?.amount} claim is approved and processing.`,
            `Excellent! Your ₹${extracted?.amount} claim is ready to go.`,
            `Awesome! Your ₹${extracted?.amount} claim has been processed successfully.`
          ],
          hindi: [
            `बहुत अच्छा! आपका ₹${extracted?.amount} का क्लेम तैयार है।`,
            `शानदार! आपका ₹${extracted?.amount} का क्लेम स्वीकृत हो गया है।`,
            `उत्कृष्ट! आपका ₹${extracted?.amount} का क्लेम प्रोसेस हो गया है।`,
            `बेहतरीन! आपका ₹${extracted?.amount} का क्लेम मंजूर हो गया है।`
          ],
          marathi: [
            `छान! तुमचा ₹${extracted?.amount} चा क्लेम तयार आहे.`,
            `उत्कृष्ट! तुमचा ₹${extracted?.amount} चा क्लेम मंजूर झाला आहे.`,
            `शानदार! तुमचा ₹${extracted?.amount} चा क्लेम प्रोसेस झाला आहे.`,
            `बेहतरीन! तुमचा ₹${extracted?.amount} चा क्लेम स्वीकृत झाला आहे.`
          ]
        };
        
        const messagesForLanguage = fallbackMessages[userLanguage] || fallbackMessages.english;
        const randomFallback = messagesForLanguage[Math.floor(Math.random() * messagesForLanguage.length)];
        typeMessage(randomFallback, () => {
          setMessages((prev) => [...prev, { sender: 'ai', text: randomFallback }]);
        });
      } else {
        const fallbackMessages = {
          english: [
            `Great! Your ₹${extracted?.amount} claim is all set. Our team will reach out shortly.`,
            `Perfect! Your ₹${extracted?.amount} claim is approved and processing.`,
            `Excellent! Your ₹${extracted?.amount} claim is ready to go.`,
            `Awesome! Your ₹${extracted?.amount} claim has been processed successfully.`
          ],
          hindi: [
            `बहुत अच्छा! आपका ₹${extracted?.amount} का क्लेम तैयार है।`,
            `शानदार! आपका ₹${extracted?.amount} का क्लेम स्वीकृत हो गया है।`,
            `उत्कृष्ट! आपका ₹${extracted?.amount} का क्लेम प्रोसेस हो गया है।`,
            `बेहतरीन! आपका ₹${extracted?.amount} का क्लेम मंजूर हो गया है।`
          ],
          marathi: [
            `छान! तुमचा ₹${extracted?.amount} चा क्लेम तयार आहे.`,
            `उत्कृष्ट! तुमचा ₹${extracted?.amount} चा क्लेम मंजूर झाला आहे.`,
            `शानदार! तुमचा ₹${extracted?.amount} चा क्लेम प्रोसेस झाला आहे.`,
            `बेहतरीन! तुमचा ₹${extracted?.amount} चा क्लेम स्वीकृत झाला आहे.`
          ]
        };
        
        const messagesForLanguage = fallbackMessages[userLanguage] || fallbackMessages.english;
        const randomFallback = messagesForLanguage[Math.floor(Math.random() * messagesForLanguage.length)];
        typeMessage(randomFallback, () => {
          setMessages((prev) => [...prev, { sender: 'ai', text: randomFallback }]);
        });
      }
    }
    
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typingMessage]);

  const openChatbot = async () => {
    setShowChatbot(true);
    setLoading(true);
    
    // Generate dynamic initial messages based on eligibility and user context
    const initialMessages = eligibility ? [
      `Hello ${extracted?.name}! I'm here to help with your ₹${extracted?.amount} claim.`,
      `Welcome ${extracted?.name}! Your claim has been approved. How can I assist you today?`,
      `Hi there! I see your ₹${extracted?.amount} claim is eligible. What would you like to know?`,
      `Greetings ${extracted?.name}! Your claim is ready for processing. Any questions?`
    ] : [
      `Hello ${extracted?.name}, I understand you have questions about your claim.`,
      `Hi ${extracted?.name}, let me help explain the claim situation.`,
      `Welcome! I'm here to help clarify your claim status.`,
      `Hello! Let me assist you with understanding your claim details.`
    ];
    
    const randomInitialMessage = initialMessages[Math.floor(Math.random() * initialMessages.length)];
    
    try {
      // Get initial comforting message from Gemini with dynamic prompt
      // Use production URLs if available, fallback to localhost for development
      const chatUrl = import.meta.env.VITE_CHAT_URL || 
                     (window.location.hostname === 'localhost' ? "http://localhost:5001" : "https://claimsense-chatbot.onrender.com");
      const res = await fetch(`${chatUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: randomInitialMessage,
          eligibility,
          extracted,
          reason,
          isInitialMessage: true, // Flag to indicate this is the first message
        }),
      });

      const data = await res.json();
      
      if (data.error) {
        // Multi-language fallback messages
        if (eligibility) {
          const fallbackMessages = {
            english: [
              `Great! Your ₹${extracted?.amount} claim is all set. Our team will reach out shortly.`,
              `Perfect! Your ₹${extracted?.amount} claim is approved and processing.`,
              `Excellent! Your ₹${extracted?.amount} claim is ready to go.`,
              `Awesome! Your ₹${extracted?.amount} claim has been processed successfully.`
            ],
            hindi: [
              `बहुत अच्छा! आपका ₹${extracted?.amount} का क्लेम तैयार है।`,
              `शानदार! आपका ₹${extracted?.amount} का क्लेम स्वीकृत हो गया है।`,
              `उत्कृष्ट! आपका ₹${extracted?.amount} का क्लेम प्रोसेस हो गया है।`,
              `बेहतरीन! आपका ₹${extracted?.amount} का क्लेम मंजूर हो गया है।`
            ],
            marathi: [
              `छान! तुमचा ₹${extracted?.amount} चा क्लेम तयार आहे.`,
              `उत्कृष्ट! तुमचा ₹${extracted?.amount} चा क्लेम मंजूर झाला आहे.`,
              `शानदार! तुमचा ₹${extracted?.amount} चा क्लेम प्रोसेस झाला आहे.`,
              `बेहतरीन! तुमचा ₹${extracted?.amount} चा क्लेम स्वीकृत झाला आहे.`
            ]
          };
          
          const messagesForLanguage = fallbackMessages[userLanguage] || fallbackMessages.english;
          const randomFallback = messagesForLanguage[Math.floor(Math.random() * messagesForLanguage.length)];
          typeMessage(randomFallback, () => {
            setMessages((prev) => [...prev, { sender: 'ai', text: randomFallback }]);
          });
        } else {
          const fallbackMessages = {
            english: [
              `Your claim couldn't be approved due to: ${reason}. Let me help you explore alternatives.`,
              `Unfortunately, your claim was rejected: ${reason}. I can help you understand your options.`,
              `Your claim couldn't be processed: ${reason}. Let me assist you with other solutions.`,
              `The claim was declined because: ${reason}. I'm here to help you find alternatives.`
            ],
            hindi: [
              `आपका क्लेम स्वीकृत नहीं हो सका: ${reason}. मैं आपको विकल्पों में मदद करूंगा।`,
              `दुर्भाग्य से आपका क्लेम अस्वीकृत हो गया: ${reason}. मैं आपको समझने में मदद करूंगा।`,
              `आपका क्लेम प्रोसेस नहीं हो सका: ${reason}. मैं आपको अन्य समाधानों में मदद करूंगा।`,
              `क्लेम अस्वीकृत हो गया क्योंकि: ${reason}. मैं आपको विकल्प खोजने में मदद करूंगा।`
            ],
            marathi: [
              `तुमचा क्लेम मंजूर होऊ शकला नाही: ${reason}. मी तुम्हाला पर्यायांमध्ये मदत करतो.`,
              `दुर्दैवाने तुमचा क्लेम नाकारला गेला: ${reason}. मी तुम्हाला समजून घेण्यात मदत करतो.`,
              `तुमचा क्लेम प्रोसेस होऊ शकला नाही: ${reason}. मी तुम्हाला इतर उपायांमध्ये मदत करतो.`,
              `क्लेम नाकारला गेला कारण: ${reason}. मी तुम्हाला पर्याय शोधण्यात मदत करतो.`
            ]
          };
          
          const messagesForLanguage = fallbackMessages[userLanguage] || fallbackMessages.english;
          const randomFallback = messagesForLanguage[Math.floor(Math.random() * messagesForLanguage.length)];
          typeMessage(randomFallback, () => {
            setMessages((prev) => [...prev, { sender: 'ai', text: randomFallback }]);
          });
        }
      } else {
        typeMessage(data.reply, () => {
          setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
        });
      }
    } catch (err) {
      // Multi-language fallback messages for network errors - MORE DYNAMIC
      if (eligibility) {
        const fallbackMessages = {
          english: [
            `Great! Your ₹${extracted?.amount} claim is all set. Our team will reach out shortly.`,
            `Perfect! Your ₹${extracted?.amount} claim is approved and processing.`,
            `Excellent! Your ₹${extracted?.amount} claim is ready to go.`,
            `Awesome! Your ₹${extracted?.amount} claim has been processed successfully.`
          ],
          hindi: [
            `बहुत अच्छा! आपका ₹${extracted?.amount} का क्लेम तैयार है।`,
            `शानदार! आपका ₹${extracted?.amount} का क्लेम स्वीकृत हो गया है।`,
            `उत्कृष्ट! आपका ₹${extracted?.amount} का क्लेम प्रोसेस हो गया है।`,
            `बेहतरीन! आपका ₹${extracted?.amount} का क्लेम मंजूर हो गया है।`
          ],
          marathi: [
            `छान! तुमचा ₹${extracted?.amount} चा क्लेम तयार आहे.`,
            `उत्कृष्ट! तुमचा ₹${extracted?.amount} चा क्लेम मंजूर झाला आहे.`,
            `शानदार! तुमचा ₹${extracted?.amount} चा क्लेम प्रोसेस झाला आहे.`,
            `बेहतरीन! तुमचा ₹${extracted?.amount} चा क्लेम स्वीकृत झाला आहे.`
          ]
        };
        
        const messagesForLanguage = fallbackMessages[userLanguage] || fallbackMessages.english;
        const randomFallback = messagesForLanguage[Math.floor(Math.random() * messagesForLanguage.length)];
        typeMessage(randomFallback, () => {
          setMessages((prev) => [...prev, { sender: 'ai', text: randomFallback }]);
        });
      } else {
        const fallbackMessages = {
          english: [
            `Great! Your ₹${extracted?.amount} claim is all set. Our team will reach out shortly.`,
            `Perfect! Your ₹${extracted?.amount} claim is approved and processing.`,
            `Excellent! Your ₹${extracted?.amount} claim is ready to go.`,
            `Awesome! Your ₹${extracted?.amount} claim has been processed successfully.`
          ],
          hindi: [
            `बहुत अच्छा! आपका ₹${extracted?.amount} का क्लेम तैयार है।`,
            `शानदार! आपका ₹${extracted?.amount} का क्लेम स्वीकृत हो गया है।`,
            `उत्कृष्ट! आपका ₹${extracted?.amount} का क्लेम प्रोसेस हो गया है।`,
            `बेहतरीन! आपका ₹${extracted?.amount} का क्लेम मंजूर हो गया है।`
          ],
          marathi: [
            `छान! तुमचा ₹${extracted?.amount} चा क्लेम तयार आहे.`,
            `उत्कृष्ट! तुमचा ₹${extracted?.amount} चा क्लेम मंजूर झाला आहे.`,
            `शानदार! तुमचा ₹${extracted?.amount} चा क्लेम प्रोसेस झाला आहे.`,
            `बेहतरीन! तुमचा ₹${extracted?.amount} चा क्लेम स्वीकृत झाला आहे.`
          ]
        };
        
        const messagesForLanguage = fallbackMessages[userLanguage] || fallbackMessages.english;
        const randomFallback = messagesForLanguage[Math.floor(Math.random() * messagesForLanguage.length)];
        typeMessage(randomFallback, () => {
          setMessages((prev) => [...prev, { sender: 'ai', text: randomFallback }]);
        });
      }
    }
    
    setLoading(false);
  };

  const closeChatbot = () => {
    setShowChatbot(false);
    setMessages([]);
  };

  const handleClaim = () => {
    setShowThankYou(true);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowThankYou(false);
      navigate('/dashboard');
    }, 5000);
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
                <p className="text-xs text-gray-500">Verify & Process Your Claim</p>
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
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Upload Document</span>
            </div>
            <div className="w-12 h-0.5 bg-blue-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Verify Information</span>
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

        {/* Aadhar Verification Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aadhar Verification</h2>
            <p className="text-gray-600">Please verify your Aadhar number to proceed with the claim</p>
          </div>

          {/* User Info Display */}
          {fullUser && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Current User:</h3>
              <div className="text-sm text-blue-700">
                <p><strong>Name:</strong> {fullUser.name}</p>
                <p><strong>Mobile:</strong> {fullUser.mobile}</p>
                <p><strong>Expected Aadhar:</strong> {fullUser.aadhar}</p>
              </div>
            </div>
          )}

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhar Number
              </label>
      <input
        type="text"
        value={aadhar}
        onChange={(e) => setAadhar(e.target.value)}
                placeholder="Enter your Aadhar Number"
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Demo: Use {fullUser?.aadhar || "1234-5678-9012"} for testing
              </p>
            </div>

            <button 
              onClick={verifyAadhar} 
              disabled={!aadhar}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                !aadhar 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Verify Aadhar</span>
              </div>
            </button>

            {aadharStatus && (
              <div className={`p-4 rounded-lg ${
                aadharStatus.includes('✅') 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {aadharStatus.includes('✅') ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={aadharStatus.includes('✅') ? 'text-green-800' : 'text-red-800'}>
                    {aadharStatus}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Eligibility Result */}
        {eligibility !== null && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                eligibility 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                {eligibility ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <XCircle className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Eligibility Result</h2>
              <p className={`text-lg font-semibold ${
                eligibility ? 'text-green-600' : 'text-red-600'
              }`}>
                {eligibility ? '✅ Eligible for Claim' : '❌ Not Eligible'}
              </p>
            </div>

            {/* Claim Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Claim Amount</p>
                    <p className="text-xl font-bold text-gray-900">₹{extracted.amount}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Insurance Coverage</p>
                    <p className="text-lg font-semibold text-gray-900">₹{fullUser.insurancePolicy.coverage.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patient Name</p>
                    <p className="text-lg font-semibold text-gray-900">{extracted.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hospital</p>
                    <p className="text-lg font-semibold text-gray-900">{extracted.hospital}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Fraud Detection Card */}
                {extracted.fraud_detection && (
                  <div className={`p-6 rounded-xl border ${
                    extracted.fraud_detection.risk_level === 'High' ? 'border-red-200 bg-red-50' :
                    extracted.fraud_detection.risk_level === 'Medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {extracted.fraud_detection.risk_level === 'High' ? (
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        ) : extracted.fraud_detection.risk_level === 'Medium' ? (
                          <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        ) : (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold">Fraud Risk Assessment</h3>
                          <p className="text-sm opacity-80">AI Security Analysis</p>
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

                {/* Risk Meter */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Assessment Meter</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Low Risk</span>
                      <span className="text-xs text-gray-600">High Risk</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          extracted.fraud_detection?.fraud_score >= 50 ? 'bg-red-500' :
                          extracted.fraud_detection?.fraud_score >= 25 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${extracted.fraud_detection?.fraud_score || 0}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium">
                        {extracted.fraud_detection?.fraud_score || 0}% Risk Level
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document Quality */}
                {extracted.document_quality && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Document Quality</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        extracted.document_quality === 'good' ? 'bg-green-500' :
                        extracted.document_quality === 'medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium capitalize">{extracted.document_quality}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              {eligibility ? (
                <button 
                  onClick={openChatbot}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <span>Claim ₹{extracted.amount}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ) : (
                <button 
                  onClick={openChatbot}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Why Not Eligible?</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chatbot */}
        {showChatbot && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Insurance Assistant</h3>
                  <p className="text-sm text-gray-500">Ask me anything about your claim</p>
                </div>
              </div>
              <button 
                onClick={closeChatbot}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div 
              ref={chatRef} 
              className="h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-3 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <span className={`inline-block px-4 py-2 rounded-2xl max-w-xs ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    {message.text}
                  </span>
                </div>
              ))}
              {isTyping && (
                <div className="text-left mb-3">
                  <span className="inline-block px-4 py-2 rounded-2xl max-w-xs bg-white text-gray-800 border border-gray-200">
                    {typingMessage}
                    <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || isTyping}
              />
              <button 
                onClick={sendMessage} 
                disabled={loading || isTyping}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Send'}
              </button>
            </div>

            {/* Claim Button in Chatbot */}
            {eligibility && messages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={handleClaim}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Submit Claim for ₹{extracted.amount}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Thank You Popup */}
        {showThankYou && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full opacity-30"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 bg-white rounded-full opacity-40"></div>
                  <div className="absolute bottom-2 left-4 w-6 h-6 bg-white rounded-full opacity-25"></div>
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Claim Submitted!</h2>
                  <p className="text-green-100">Your insurance claim has been successfully processed</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-lg font-semibold text-gray-800">Successfully Submitted</span>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Claim Amount:</span>
                      <span className="font-bold text-green-600">₹{extracted.amount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Patient Name:</span>
                      <span className="font-semibold">{extracted.name}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Hospital:</span>
                      <span className="font-semibold">{extracted.hospital}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h4 className="font-semibold text-blue-800 mb-1">What's Next?</h4>
                      <p className="text-sm text-blue-700">
                        You'll receive a call within 30 minutes from our claims team. 
                        They'll guide you through the next steps and ensure quick processing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Thank you for choosing ClaimSense!</span>
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>

                <button 
                  onClick={() => {
                    setShowThankYou(false);
                    navigate('/dashboard');
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
        </div>
      )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-center">
            <Phone className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Need Help?</h3>
            <p className="text-blue-100 text-sm">
              Our support team is available 24/7 to assist you with any questions about your claim.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
