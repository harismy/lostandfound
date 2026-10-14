import crypto from "crypto";

// Foto di-upload langsung dari browser ke Cloudinary, tidak lewat server ini, karena
// Passenger di hosting tidak bisa menerima request di atas 128 KB. Backend hanya membuat
// tanda tangan upload, memeriksa URL hasil upload, dan menghapus foto.

const ROOT_FOLDER = "lostandfound";
export const PHOTO_FOLDERS = ["barang", "konfirmasi", "satpam"];
const MAX_PHOTOS = 5;

const config = () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
});

// https://cloudinary.com/documentation/authentication_signatures
const sign = (params) => {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(toSign + config().apiSecret)
    .digest("hex");
};

const toArray = (value) => {
  if (!value) return [];
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return Array.isArray(value) ? value : [value];
};

// Semua parameter di `params` wajib dikirim apa adanya oleh frontend ke Cloudinary.
export const createUploadSignature = (folder) => {
  const { cloudName, apiKey } = config();
  const params = {
    allowed_formats: "jpg,jpeg,png,webp,gif",
    folder: `${ROOT_FOLDER}/${folder}`,
    timestamp: Math.floor(Date.now() / 1000),
  };
  return {
    cloud_name: cloudName,
    api_key: apiKey,
    signature: sign(params),
    params,
  };
};

// Ambil daftar URL foto dari body request dan pastikan semuanya hasil upload ke folder
// kita di Cloudinary. Mengembalikan null kalau ada URL yang tidak valid.
export const parsePhotoUrls = (value, folder) => {
  const urls = toArray(value);
  const pattern = new RegExp(
    `^https://res\\.cloudinary\\.com/${config().cloudName}/image/upload/(v\\d+/)?` +
      `${ROOT_FOLDER}/${folder}/[\\w-]+\\.[a-z0-9]+$`,
    "i"
  );

  if (urls.length > MAX_PHOTOS) return null;
  if (urls.some((url) => typeof url !== "string" || !pattern.test(url))) return null;
  return urls;
};

const publicIdFromUrl = (url) => {
  const match =
    typeof url === "string" &&
    url.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return match && match[1].startsWith(`${ROOT_FOLDER}/`) ? match[1] : null;
};

// Hapus foto di Cloudinary. Menerima satu URL, array URL, atau string JSON array seperti
// yang tersimpan di database. URL yang ada di `keep` tidak ikut dihapus.
export const deletePhotos = async (value, keep = []) => {
  const { cloudName, apiKey } = config();

  for (const url of toArray(value)) {
    const publicId = !keep.includes(url) && publicIdFromUrl(url);
    if (!publicId) continue;

    const params = { public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: "POST",
          body: new URLSearchParams({ ...params, api_key: apiKey, signature: sign(params) }),
        }
      );
      if (!res.ok) console.error("Gagal hapus foto:", url, await res.text());
    } catch (err) {
      console.error("Gagal hapus foto:", url, err.message);
    }
  }
};
