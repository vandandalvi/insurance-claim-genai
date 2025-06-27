import { useLocation, useNavigate } from 'react-router-dom';

export default function FinalSubmit() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Simulate sending to backend (store in localStorage or log)
    const submittedClaims = JSON.parse(localStorage.getItem("claims") || "[]");
    submittedClaims.push({
      ...state.extracted,
      claimAmount: state.result.claimAmount,
      risk: state.result.riskLevel,
      aadharStatus: state.result.aadharStatus,
      hospitalVerified: state.extracted.isHospitalVerified,
      date: new Date().toLocaleString(),
    });
    localStorage.setItem("claims", JSON.stringify(submittedClaims));

    navigate("/thank-you");
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Confirm & Submit Claim</h2>
      <p><strong>Name:</strong> {state.extracted.name}</p>
      <p><strong>Age:</strong> {state.extracted.age}</p>
      <p><strong>Hospital:</strong> {state.extracted.hospital}</p>
      <p><strong>Reason:</strong> {state.extracted.reason}</p>
      <p><strong>Risk Level:</strong> {state.result.riskLevel}</p>
      <p><strong>Claim Amount:</strong> ₹{state.result.claimAmount}</p>
      <br />
      <button onClick={handleSubmit}>✅ Submit Claim</button>
    </div>
  );
}
