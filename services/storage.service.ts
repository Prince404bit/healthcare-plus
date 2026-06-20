import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import { buildFileKey } from "@/utils/helpers";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const storageService = {
  validateFile(file: File) {
    if (file.size > MAX_FILE_SIZE) throw new Error("File exceeds 10 MB limit");
    if (!ALLOWED_MIME_TYPES.includes(file.type))
      throw new Error("Only PDF and image files are allowed");
  },

  async upload(userId: string, file: File) {
    this.validateFile(file);
    const key = buildFileKey(userId, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(key, buffer, { contentType: file.type, upsert: false });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(key);
    return { url: data.publicUrl, key, name: file.name, size: file.size, mimeType: file.type };
  },

  async delete(key: string) {
    const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([key]);
    if (error) throw new Error(`Delete failed: ${error.message}`);
  },

  async getSignedUrl(key: string, expiresIn = 3600) {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(key, expiresIn);
    if (error) throw new Error(`Signed URL failed: ${error.message}`);
    return data.signedUrl;
  },
};
