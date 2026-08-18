import { getSkinAnalysisProvider } from "../../lib/ai/skin-analysis";
import { validateImageUpload } from "../../lib/ai/image-validation";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    const consent = form.get("consent");
    if (consent !== "true") return Response.json({ error: "Photo consent is required." }, { status: 400 });
    if (!(image instanceof File)) return Response.json({ error: "Please select a photo." }, { status: 400 });
    const bytes = new Uint8Array(await image.arrayBuffer());
    const validationError = validateImageUpload(image, bytes);
    if (validationError) return Response.json({ error: validationError }, { status: 400 });
    let goals: string[] = [];
    try { goals = JSON.parse(String(form.get("goals") || "[]")); } catch { goals = []; }
    const result = await getSkinAnalysisProvider().analyzeSkinConsultation({ imageBytes: bytes, mimeType: image.type, goals });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "We couldn't analyze your photo this time — no worries. We can still recommend a service using your answers." }, { status: 500 });
  }
}
