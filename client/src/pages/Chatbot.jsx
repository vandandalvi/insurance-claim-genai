import { useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function Chatbot() {
  const location = useLocation();
  const { extracted, reason, eligibility = true } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
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
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: '❌ Failed to respond: ' + data.error },
        ]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '❌ Server error: ' + err.message },
      ]);
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
  }, [messages]);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>🧠 Insurance Assistant ChatBot</h2>

      <div
        ref={chatRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '10px',
          height: '400px',
          overflowY: 'auto',
          background: '#f9f9f9',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              margin: '10px 0',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '10px',
                borderRadius: '10px',
                background: msg.sender === 'user' ? '#d0f0fd' : '#e3e3e3',
                maxWidth: '80%',
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{ width: '80%', padding: '10px', borderRadius: '8px' }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: '10px 15px',
            marginLeft: '10px',
            borderRadius: '8px',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
