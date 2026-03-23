import { Router, Request, Response } from 'express';

const router = Router();

// In-memory OTP store — swap for Redis in production
interface OTPEntry { code: string; expiresAt: number; }
const OTP_STORE: Record<string, OTPEntry> = {};

interface MTNResponse { message?: string; statusMessage?: string; }

const generateCode = (): string => String(Math.floor(100000 + Math.random() * 900000));

// ── Sends an SMS via MTN SMS API ─────────────────────────────────────────────
const sendSMS = async (to: string, message: string): Promise<void> => {
  const response = await fetch(process.env.MTN_SMS_URL as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.MTN_API_KEY as string,
    },
    body: JSON.stringify({
      senderAddress:      process.env.MTN_SENDER_ID || 'PharmaLink',
      receiverAddress:    [to],
      message,
      clientCorrelatorId: `pharmalink-${Date.now()}`,
    }),
  });

  const data = await response.json() as MTNResponse;
  if (!response.ok) throw new Error(data.message || data.statusMessage || 'MTN SMS failed');
};

// ── POST /api/otp/send ───────────────────────────────────────────────────────
router.post('/send', async (req: Request, res: Response) => {
  const { phone } = req.body as { phone?: string };
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const code = generateCode();
  OTP_STORE[phone] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };

  try {
    await sendSMS(phone, `Your PharmaLink verification code is: ${code}. Valid for 5 minutes. Do not share this code.`);
    return res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('MTN SMS error:', msg);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] OTP for ${phone}: ${code}`);
      return res.json({ success: true });
    }

    return res.status(500).json({ error: 'Failed to send SMS. Please try again.' });
  }
});

// ── POST /api/otp/verify ─────────────────────────────────────────────────────
router.post('/verify', (req: Request, res: Response) => {
  const { phone, code } = req.body as { phone?: string; code?: string };
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

  const stored = OTP_STORE[phone];
  if (!stored)                       return res.status(400).json({ error: 'No OTP found for this number' });
  if (Date.now() > stored.expiresAt) return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  if (stored.code !== code)          return res.status(400).json({ error: 'Incorrect code. Try again.' });

  delete OTP_STORE[phone];
  return res.json({ success: true });
});

export default router;