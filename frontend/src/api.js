import axios from "axios";

 const BASE_URL=process.env.REACT_APP_API_BASE_URL;
export const requestOtp = async (email) => {
  const res = await axios.post(`${BASE_URL}/request-otp`, { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
  return res.data;
};
