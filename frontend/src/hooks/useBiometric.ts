// src/hooks/useBiometric.ts
// Uses the Web Authentication API (WebAuthn) — works with:
// - Windows Hello (fingerprint / face / PIN)
// - macOS Touch ID
// - Android fingerprint
// - iOS Face ID / Touch ID
// No extra libraries needed — it's built into modern browsers.

export interface BiometricResult {
  supported: boolean;
  enrolled: boolean;
}

const STORAGE_KEY = 'pharmalink_webauthn_credential';

// Check if biometrics are available on this device
export const checkBiometricSupport = async (): Promise<BiometricResult> => {
  if (!window.PublicKeyCredential) {
    return { supported: false, enrolled: false };
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    const credentialId = localStorage.getItem(STORAGE_KEY);
    return {
      supported: available,
      enrolled: available && !!credentialId
    };
  } catch {
    return { supported: false, enrolled: false };
  }
};

// Register biometric for the current user (called from Settings)
export const enrollBiometric = async (userId: string, userName: string): Promise<boolean> => {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const userId8 = new TextEncoder().encode(userId.slice(0, 32).padEnd(32, '0'));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'PharmaLink',
          id: window.location.hostname
        },
        user: {
          id: userId8,
          name: userName,
          displayName: userName
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' }  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',  // device biometric only (no USB keys)
          userVerification: 'required'           // must verify with biometric
        },
        timeout: 60000,
        attestation: 'none'
      }
    }) as PublicKeyCredential;

    if (!credential) return false;

    // Store the credential ID for later verification
    const rawId = Array.from(new Uint8Array(credential.rawId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ credentialId: rawId, userId }));

    return true;
  } catch (err: any) {
    console.error('Biometric enrollment failed:', err);
    throw new Error(
      err.name === 'NotAllowedError'
        ? 'Biometric access was denied. Please try again.'
        : err.name === 'NotSupportedError'
        ? 'Your device does not support biometric authentication.'
        : 'Biometric enrollment failed. Please try again.'
    );
  }
};

// Verify biometric before a sensitive action (e.g. completing a sale)
export const verifyBiometric = async (): Promise<boolean> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) throw new Error('No biometric enrolled. Please enroll in Settings first.');

  const { credentialId } = JSON.parse(stored);

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          id: new Uint8Array(credentialId),
          type: 'public-key',
          transports: ['internal']
        }],
        userVerification: 'required',
        timeout: 60000,
        rpId: window.location.hostname
      }
    }) as PublicKeyCredential;

    return !!assertion;
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Biometric verification was cancelled or timed out.');
    }
    throw new Error('Biometric verification failed.');
  }
};

export const removeBiometric = () => {
  localStorage.removeItem(STORAGE_KEY);
};