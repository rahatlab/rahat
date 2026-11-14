/**
 * Cloudinary signed upload helper.
 * 1. Calls /api/cloudinary/sign to get signature + credentials
 * 2. Posts file directly to Cloudinary
 * Returns the secure URL of the uploaded asset.
 */

export async function cloudinaryUpload(file: File, folder = "portfolio-rahat"): Promise<string> {
  // Get signature from our API
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, resource_type: "image" }),
  });
  if (!signRes.ok) throw new Error("Failed to get upload signature");
  const signData = await signRes.json();

  // Build form data for Cloudinary direct upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signData.apiKey);
  formData.append("timestamp", signData.timestamp);
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);

  const uploadRes = await fetch(signData.uploadUrl, {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${text}`);
  }
  const result = await uploadRes.json();
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
