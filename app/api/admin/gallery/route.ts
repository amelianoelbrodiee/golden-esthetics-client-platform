import { validateImageUpload } from "../../../lib/ai/image-validation";
import { getAdminSession } from "../../../lib/auth/admin";
import { cleanText } from "../../../lib/forms";
import { getSupabaseUserClient } from "../../../lib/supabase/server";

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Authorized owner or admin access required." }, { status: 401 });

  const uploadedPaths: string[] = [];
  const db = getSupabaseUserClient(session.accessToken)!;
  try {
    const form = await request.formData();
    const before = form.get("beforeImage");
    const after = form.get("afterImage");
    const images = [
      ["before", before instanceof File && before.size ? before : null],
      ["after", after instanceof File && after.size ? after : null],
    ] as const;
    if (!images.some(([, image]) => image)) {
      return Response.json({ error: "Choose at least one before or after photo." }, { status: 400 });
    }
    if (form.get("photoConsentConfirmed") !== "true") {
      return Response.json({ error: "Confirm the client’s publication consent before uploading." }, { status: 400 });
    }

    const category = cleanText(form.get("category"), 80);
    const servicePerformed = cleanText(form.get("servicePerformed"), 120);
    const caption = cleanText(form.get("caption"), 600);
    const serviceDate = cleanText(form.get("serviceDate"), 10);
    if (!category) return Response.json({ error: "Choose a gallery category." }, { status: 400 });
    if (serviceDate && !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
      return Response.json({ error: "Enter a valid service date." }, { status: 400 });
    }

    const validatedImages: ["before" | "after", File, Uint8Array][] = [];
    for (const [label, image] of images) {
      if (!image) continue;
      const bytes = new Uint8Array(await image.arrayBuffer());
      const validationError = validateImageUpload(image, bytes);
      if (validationError) return Response.json({ error: `${label === "before" ? "Before" : "After"} photo: ${validationError}` }, { status: 400 });
      validatedImages.push([label, image, bytes]);
    }

    const uploadResult: Record<string, { path: string; url: string }> = {};
    for (const [label, image, bytes] of validatedImages) {
      const path = `portfolio/${crypto.randomUUID()}-${label}.${extensionByType[image.type]}`;
      const { error: uploadError } = await db.storage.from("gallery").upload(path, bytes, {
        contentType: image.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw new Error("upload");
      uploadedPaths.push(path);
      uploadResult[label] = { path, url: db.storage.from("gallery").getPublicUrl(path).data.publicUrl };
    }

    const { data, error } = await db.from("gallery_items").insert({
      category,
      service_performed: servicePerformed || null,
      caption: caption || null,
      service_date: serviceDate || null,
      before_image_path: uploadResult.before?.path ?? null,
      before_image_url: uploadResult.before?.url ?? null,
      after_image_path: uploadResult.after?.path ?? null,
      after_image_url: uploadResult.after?.url ?? null,
      featured: form.get("featured") === "true",
      active: form.get("active") === "true",
      photo_consent_confirmed: true,
      uploaded_by: session.userId,
    }).select("id,category,service_performed,caption,service_date,before_image_url,after_image_url,featured,active,photo_consent_confirmed,sort_order,created_at").single();
    if (error) throw new Error("record");
    return Response.json({ ok: true, item: data });
  } catch {
    if (uploadedPaths.length) await db.storage.from("gallery").remove(uploadedPaths);
    return Response.json({ error: "The gallery item could not be uploaded." }, { status: 500 });
  }
}
