import CryptoJS from 'crypto-js';

// PENTING: Simpan kunci rahasia ini di environment variable (.env)
// Jangan pernah hardcode kunci rahasia langsung di dalam kode untuk produksi!
const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || 'your-default-super-secret-key';

// Fungsi untuk mengenkripsi data
export const encryptData = (data: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return ''; // Kembalikan string kosong jika gagal
  }
};

// Fungsi untuk mendekripsi data
export const decryptData = (ciphertext: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || null; // Kembalikan null jika hasil dekripsi kosong
  } catch (error) {
    // Ini bisa terjadi jika mencoba mendekripsi token lama yang tidak terenkripsi
    return null; // Kembalikan null jika gagal
  }
};