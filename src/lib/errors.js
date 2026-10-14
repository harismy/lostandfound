// Pesan error yang aman ditampilkan, termasuk untuk error jaringan/Cloudinary yang tidak punya response
export const getErrorMessage = (error, fallback = "Terjadi kesalahan, coba lagi.") =>
  error?.response?.data?.message || error?.message || fallback;
