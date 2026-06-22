// ================================================================
// KITHTHA GRAND — AI Product Image Processing
// supabase/functions/process-product-image/index.ts
//
// Flow: raw phone photo -> Cloudinary (AI background removal +
// white pad to 1:1 + color/sharpness enhance + compression) ->
// download processed result -> store in Supabase Storage ->
// delete the temp Cloudinary copy -> return the Storage URL.
// ================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
const CLOUDINARY_API_KEY    = Deno.env.get("CLOUDINARY_API_KEY")!;
const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET")!;
const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    /* ── Auth: only admins may process images ── */
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: CORS_HEADERS });
    }
    const { data: profile } = await userClient.from("users").select("role").eq("id", userData.user.id).single();
    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: CORS_HEADERS });
    }

    const { image, bucket } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "Missing image" }), { status: 400, headers: CORS_HEADERS });
    }
    const targetBucket = bucket || "products";

    /* ── 1. Cloudinary: AI background removal + white 1:1 pad + enhance ── */
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const transformation = "b_white,c_pad,ar_1.0/e_improve/e_sharpen:60/e_vibrance:30/q_auto,f_jpg";
    const signParams: Record<string, string> = {
      background_removal: "cloudinary_ai",
      timestamp,
      transformation,
    };
    const signString = Object.keys(signParams).sort()
      .map(function (k) { return k + "=" + signParams[k]; }).join("&") + CLOUDINARY_API_SECRET;
    const signature = await sha1Hex(signString);

    const cloudForm = new FormData();
    cloudForm.append("file", image);
    cloudForm.append("api_key", CLOUDINARY_API_KEY);
    cloudForm.append("timestamp", timestamp);
    cloudForm.append("signature", signature);
    cloudForm.append("background_removal", "cloudinary_ai");
    cloudForm.append("transformation", transformation);

    const cloudRes = await fetch(
      "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/upload",
      { method: "POST", body: cloudForm }
    );
    const cloudJson = await cloudRes.json();
    if (!cloudRes.ok || !cloudJson.secure_url) {
      console.error("Cloudinary error:", cloudJson);
      const msg = (cloudJson.error && cloudJson.error.message) || "Cloudinary processing failed";
      return new Response(JSON.stringify({ error: msg }), { status: 502, headers: CORS_HEADERS });
    }

    /* ── 2. Download the processed image ── */
    const finalImgRes = await fetch(cloudJson.secure_url);
    const finalImgBlob = await finalImgRes.blob();

    /* ── 3. Store the final result in Supabase Storage ── */
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    const ext = cloudJson.format || "jpg";
    const path = Date.now() + "-" + Math.random().toString(36).slice(2) + "." + ext;
    const { error: storeErr } = await adminClient.storage.from(targetBucket).upload(path, finalImgBlob, {
      contentType: finalImgBlob.type || "image/jpeg",
    });
    if (storeErr) {
      return new Response(JSON.stringify({ error: storeErr.message }), { status: 500, headers: CORS_HEADERS });
    }
    const { data: pub } = adminClient.storage.from(targetBucket).getPublicUrl(path);

    /* ── 4. Clean up the temp Cloudinary copy (Supabase Storage is now the source of truth) ── */
    const destroyTimestamp = Math.floor(Date.now() / 1000).toString();
    const destroySignature = await sha1Hex(
      "public_id=" + cloudJson.public_id + "&timestamp=" + destroyTimestamp + CLOUDINARY_API_SECRET
    );
    const destroyForm = new FormData();
    destroyForm.append("public_id", cloudJson.public_id);
    destroyForm.append("api_key", CLOUDINARY_API_KEY);
    destroyForm.append("timestamp", destroyTimestamp);
    destroyForm.append("signature", destroySignature);
    fetch("https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/destroy", {
      method: "POST", body: destroyForm,
    }).catch(function () {});

    return new Response(JSON.stringify({ url: pub.publicUrl }), {
      headers: Object.assign({ "Content-Type": "application/json" }, CORS_HEADERS),
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: CORS_HEADERS });
  }
});
