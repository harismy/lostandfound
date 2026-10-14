// Daftar URL foto dari data API: bisa berupa array, string JSON array, atau satu URL
export const parsePhotos = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [String(parsed)];
    } catch {
      return raw.startsWith("http") ? [raw] : [];
    }
  }
  return [];
};

// Foto Cloudinary diperkecil dan dikompres otomatis sesuai lebar tampilan
export const optimizeImage = (url, width = 800) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
};
