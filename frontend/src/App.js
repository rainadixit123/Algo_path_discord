import React, { useState, useEffect } from "react";
import { requestOtp, verifyOtp } from "./api";
import "./index.css";

function App() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [error, setError] = useState("");

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleRequestOtp = async () => {
    setError("");
    try {
      await requestOtp(email);
      setStep(2);
      setTimer(300); // 5 minutes = 300 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    try {
      const res = await verifyOtp(email, otp);
      setInviteLink(res.inviteLink);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
    }
  };

  return (
    <div className="container">
      <h1>🔐 Algopath Discord Verification</h1>

      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Enter your Algopath email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleRequestOtp}>Get OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
          <p className="timer">
            ⏳ OTP expires in: <strong>{formatTime(timer)}</strong>
          </p>
          {timer === 0 && (
            <button onClick={handleRequestOtp} className="resend">
              Resend OTP
            </button>
          )}
        </>
      )}

      {step === 3 && (
        <a href={inviteLink} target="_blank" rel="noopener noreferrer">
          <button className="discord-button">Join Discord</button>
        </a>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;
