const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"Algopath" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Algopath Discord OTP Verification',
    text: `Your OTP is: ${otp}`
  });
};

module.exports = sendOTP;
