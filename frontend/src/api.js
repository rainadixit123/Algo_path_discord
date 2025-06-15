import axios from "axios";

const BASE_URL = "https://algodiscord-backend.onrender.com/api";
// const BASE_URL="http://localhost:5000"
export const requestOtp = async (email) => {
  const res = await axios.post(`${BASE_URL}/request-otp`, { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
  return res.data;
};
