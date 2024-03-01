import CryptoJS from "crypto-js";

export function encryptText(text, secretKey) {
  const encryptedText = CryptoJS.AES.encrypt(text, secretKey).toString();
  return encryptedText;
}

// Function to decrypt text
export function decryptText(encryptedText, secretKey) {
  const decryptedText = CryptoJS.AES.decrypt(encryptedText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
  return decryptedText;
}
