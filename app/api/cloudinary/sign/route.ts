import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: { folder?: string; resource_type?: string } = {};
    try {
      body = (await req.json()) ?? {};
    } catch {
      body = {};
    }
    
    const { folder = "portfolio-rahat", resource_type = "image" } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Cloudinary requires ALL parameters sent in the upload (except file and signature)
    // to be included in the signature, sorted alphabetically by key.
    // Frontend upload formData includes: api_key, folder, timestamp, signature, file
    // So we must sign: api_key, folder, timestamp (alphabetically: api_key, folder, timestamp)
    // Note: resource_type is NOT sent in the upload formData, so it should NOT be in the signature.
    const paramsToSign = {
      api_key: process.env.CLOUDINARY_API_KEY!,
      folder,
      timestamp,
    };

    // Manually create signature to match Cloudinary's exact expectations:
    // 1. Sort parameters alphabetically by key
    // 2. Create string: key1=value1&key2=value2...
    // 3. Append API secret
    // 4. Create SHA1 hash (hex)
    const sortedKeys = Object.keys(paramsToSign).sort();
    const stringToSign = sortedKeys.map(k => `${k}=${paramsToSign[k]}`).join('&') + process.env.CLOUDINARY_API_SECRET!;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    // Debug: log what we're signing
    console.log("[cloudinary/sign] stringToSign:", stringToSign);
    console.log("[cloudinary/sign] generated signature:", signature);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      resource_type,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    });
  } catch (e) {
    console.error("[cloudinary/sign] error:", e);
    return NextResponse.json(
      { error: "Failed to generate upload signature", details: String(e) },
      { status: 500 },
    );
  }
}
