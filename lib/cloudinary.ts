/**
 * Cloudinary upload helper using backend API (no signed uploads needed).
 * Posts file to /api/cloudinary/upload which uses Cloudinary SDK directly.
 */

export async function cloudinaryUpload(file: File, folder = "portfolio-rahat"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const result = await res.json();
  return result.secure_url;
}

export async function cloudinaryUploadMultiple(files: File[], folder = "portfolio-rahat"): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await cloudinaryUpload(file, folder);
    urls.push(url);
  }
  return urls;
}
