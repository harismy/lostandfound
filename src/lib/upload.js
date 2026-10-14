import api from "@/lib/axios";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/constants";

// Foto yang dipilih disimpan sebagai { file, url }; url preview dilepas setelah tidak dipakai
export const releasePhotos = (photos) =>
  photos.forEach((photo) => URL.revokeObjectURL(photo.url));

// Foto di-upload langsung dari browser ke Cloudinary, lalu yang dikirim ke API hanya URL-nya.
// Hosting API tidak bisa menerima request di atas 128 KB, jadi foto tidak boleh lewat API.
export const uploadPhotos = async (files, folder) => {
  if (!files || files.length === 0) return [];

  if (files.some((file) => file.size > MAX_UPLOAD_BYTES)) {
    throw new Error(`Ukuran setiap foto maksimal ${MAX_UPLOAD_MB} MB.`);
  }

  const { data } = await api.get("/upload/signature", { params: { folder } });
  const { cloud_name, api_key, signature, params } = data.data;

  return Promise.all(
    files.map(async (file) => {
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", api_key);
      body.append("signature", signature);
      Object.entries(params).forEach(([key, value]) => body.append(key, value));

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: "POST", body }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Gagal mengupload foto.");
      }
      return result.secure_url;
    })
  );
};
