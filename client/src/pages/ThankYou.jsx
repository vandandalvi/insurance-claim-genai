import { Link } from 'react-router-dom';

export default function ThankYou() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🎉 Thank you!</h2>
      <p>Your insurance claim has been submitted. You will hear back soon.</p>
      <Link to="/dashboard">🔙 Go back to Dashboard</Link>
    </div>
  );
}
