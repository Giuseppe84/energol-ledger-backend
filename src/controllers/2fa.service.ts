import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export const generate2FASecret = async (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `Energol (${email})`,
  });

  const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

  return {
    base32: secret.base32,
    qrCode,
  };
};

export const verify2FAToken = (secret: string, token: string) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
};