import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Claim from './pages/Claim.jsx';
import Verify from './pages/Verify.jsx';
import Chat from './pages/Chat.jsx';
import FinalSubmit from './pages/FinalSubmit.jsx';
import ThankYou from './pages/ThankYou.jsx';
import CameraTest from './pages/CameraTest.jsx';

// ✅ Clear user on full page reload
localStorage.removeItem('user');

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/claim" element={<Claim />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/submit" element={<FinalSubmit />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/camera-test" element={<CameraTest />} />
    </Routes>
  </BrowserRouter>
);
