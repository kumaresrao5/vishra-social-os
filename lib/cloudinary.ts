export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const uploadResp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const uploadJson = (await uploadResp.json()) as { secure_url?: string; error?: { message?: string } };

  if (!uploadResp.ok || !uploadJson.secure_url) {
    const msg = uploadJson.error?.message ?? "Cloudinary upload failed.";
    throw new Error(msg);
  }
  return uploadJson.secure_url;
}

