// ================================================================
// KITHTHA GRAND — Cloudinary Image Upload
// supabase/functions/upload-image/index.ts
//
// Plain signed upload to Cloudinary (no AI background removal,
// no enhance/sharpen pass). Cloudinary is now the storage backend
// for product, category and site images.
// ================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
const CLOUDINARY_API_KEY    = Deno.env.get("CLOUDINARY_API_KEY")!;
const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET")!;
const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    /* ── Auth: only admins may upload ── */
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 200, headers: CORS_HEADERS });
    }
    const { data: profile } = await userClient.from("users").select("role").eq("id", userData.user.id).single();
    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 200, headers: CORS_HEADERS });
    }

    const { image, folder } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "Missing image" }), { status: 200, headers: CORS_HEADERS });
    }
    const targetFolder = "kiththa-grand/" + (folder || "products");

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signParams: Record<string, string> = { folder: targetFolder, timestamp };
    const signString = Object.keys(signParams).sort()
      .map(function (k) { return k + "=" + signParams[k]; }).join("&") + CLOUDINARY_API_SECRET;
    const signature = await sha1Hex(signString);

    const cloudForm = new FormData();
    cloudForm.append("file", image);
    cloudForm.append("api_key", CLOUDINARY_API_KEY);
    cloudForm.append("timestamp", timestamp);
    cloudForm.append("signature", signature);
    cloudForm.append("folder", targetFolder);

    const cloudRes = await fetch(
      "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/upload",
      { method: "POST", body: cloudForm }
    );
    const cloudJson = await cloudRes.json();
    if (!cloudRes.ok || !cloudJson.secure_url) {
      console.error("Cloudinary error:", cloudJson);
      const msg = (cloudJson.error && cloudJson.error.message) || "Cloudinary upload failed";
      return new Response(JSON.stringify({ error: msg }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ url: cloudJson.secure_url }), {
      headers: Object.assign({ "Content-Type": "application/json" }, CORS_HEADERS),
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 200, headers: CORS_HEADERS });
  }
});
