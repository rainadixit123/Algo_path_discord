const Otp =require('../models/Otp');
const User=require('../models/User')

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeAndSendOTP = async (email) => {
  const otpCode = generateOTP();

  await Otp.create({ email:email, otp: otpCode });
  // await Otp.save();
  return otpCode;
};

// const verifyOTP = async (email, otp) => {
//   const user = await User.findOne({ email });
//   if (!user || user.otp !== otp || user.otpExpiry < new Date()) return false;

//   user.isVerified = true;
//   user.otp = null;
//   await user.save();
//   return user;
// };

// module.exports = { storeAndSendOTP, verifyOTP };

module.exports = { storeAndSendOTP };