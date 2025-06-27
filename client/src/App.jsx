import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user session on page refresh
    localStorage.removeItem('user');

    navigate('/login');
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Redirecting to login...</h2>
    </div>
  );
}
