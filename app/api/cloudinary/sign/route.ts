import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { folder = "portfolio-rahat", resource_type = "image" } =
      (await req.json()) ?? {};

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Cloudinary requires ALL parameters (except file and signature) to be included
    // in the signature, sorted alphabetically by key.
    // Frontend sends: api_key, folder, resource_type, timestamp, signature, file
    // So we must sign: api_key, folder, resource_type, timestamp (alphabetically)
    const paramsToSign = {
      api_key: process.env.CLOUDINARY_API_KEY!,
      folder,
      resource_type,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      resource_type,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resource_type}/upload`,
    });
  } catch (e) {
    console.error("[cloudinary/sign] error:", e);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 },
    );
  }
}
