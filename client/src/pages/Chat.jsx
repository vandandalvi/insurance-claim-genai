import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Chat() {
  const { state } = useLocation();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Simulate GenAI generating chatbot responses
    const { result, extracted } = state || {};
    const genMsg = [];

    if (result?.riskLevel === "Bad") {
      genMsg.push("🧠 Hello! Based on our analysis, your Aadhar details could not be verified.");
      genMsg.push(`📄 The hospital "${extracted?.hospital}" might not be officially verified.`);
      genMsg.push("⚠️ Also, we detected a previous claim for the same reason from another provider.");
      genMsg.push("💡 You may consider uploading a different bill or contacting support for help.");
    } else {
      genMsg.push("✅ You are eligible to proceed with your claim.");
    }

    setMessages(genMsg);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>GenAI Chatbot Assistant</h2>
      <div style={{ marginTop: '20px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '10px', background: '#eee', padding: '10px', borderRadius: '8px' }}>
            {msg}
          </div>
        ))}
      </div>
      <br />
      <p><strong>Need more help?</strong> Try uploading another bill or contact our support team.</p>
    </div>
  );
}
