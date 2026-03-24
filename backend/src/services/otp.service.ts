import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs temporarily (use Redis in production)
const otpStore = new Map<string, { code: string; expires: number }>();

export const sendOTP = async (phone: string): Promise<void> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;
  
  otpStore.set(phone, { code, expires });

  try {
    const message = await client.messages.create({
      body: `Your PharmaLink verification code is: ${code}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone
    });
    console.log('✅ OTP sent, SID:', message.sid);
  } catch (err: any) {
    console.error('❌ Twilio error:', err.message, err.code);
    throw err; // re-throw so route returns 500 with message
  }
};

export const verifyOTP = (phone: string, code: string): boolean => {
  const stored = otpStore.get(phone);
  if (!stored) return false;
  if (Date.now() > stored.expires) { otpStore.delete(phone); return false; }
  if (stored.code !== code) return false;
  otpStore.delete(phone); // one-time use
  return true;
};