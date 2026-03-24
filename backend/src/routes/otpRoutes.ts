import { Router } from 'express';
import { sendOTP, verifyOTP } from '../services/otp.service';

const router = Router();

router.post('/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  try {
    await sendOTP(phone);
    res.json({ message: 'OTP sent' });
  } catch (err: any) {
    console.error('OTP send failed:', err);
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
});

router.post('/verify', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });
  const valid = verifyOTP(phone, code);
  if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });
  res.json({ message: 'Verified' });
});

export default router;