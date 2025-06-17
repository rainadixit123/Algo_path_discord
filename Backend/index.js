require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {client} = require('./bot');

const sendOTP = require('./src/services/emailService');
const { storeAndSendOTP } = require('../Backend/src/controllers/otpStore');
const { generateOneTimeInvite } = require('./bot');
const User = require('./src/models/User');
const Otp = require('./src/models/Otp');


const app = express();
app.use(cors({
  origin: "https://algo-path-discord-nnx3.vercel.app/", 
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

  
app.post('/api/request-otp', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Email not registered.' });

  const otp = await storeAndSendOTP(email);
  await sendOTP(email, otp);

  res.json({ message: 'OTP sent' });
});


app.post('/api/verify-otp', async (req, res) => {
  const {email,otp}=req.body;
  const user = await User.findOne({ email }); // ✅ get single user
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

    await Otp.deleteMany({ email }); 

    // await assignVerifiedRole(discordUserId); 

    // user.discordUserId = discordUserId; 
    user.isVerified = true;
    await user.save(); 
  const inviteLink = await generateOneTimeInvite(process.env.DISCORD_CHANNEL_ID);
    res.json({ message: 'Verified' ,inviteLink});
});

// const PORT = process.env.PORT || 5000;
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);