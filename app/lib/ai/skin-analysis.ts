export type CosmeticObservation = {
  category: "hydration" | "redness" | "tone" | "texture" | "congestion" | "oiliness";
  label: string;
  description: string;
};
export type SkinAnalysisResult = { observations: CosmeticObservation[]; mode: "mock" | "on-device" | "live"; disclaimer: string };
export type SkinAnalysisInput = { imageBytes: Uint8Array; mimeType: string; goals: string[] };
export interface SkinAnalysisProvider { analyzeSkinConsultation(input: SkinAnalysisInput): Promise<SkinAnalysisResult> }

class MockSkinAnalysisProvider implements SkinAnalysisProvider {
  async analyzeSkinConsultation(input: SkinAnalysisInput): Promise<SkinAnalysisResult> {
    const observations: CosmeticObservation[] = [];
    if (input.goals.some(x => ["dryness", "hydration", "dullness"].includes(x))) observations.push({ category: "hydration", label: "Hydration", description: "Demo mode: some areas may appear less hydrated. McKinnley can assess this in person." });
    if (input.goals.includes("visible redness") || input.goals.includes("sensitivity")) observations.push({ category: "redness", label: "Visible redness", description: "Demo mode: your answers suggest keeping the experience gentle and soothing." });
    if (input.goals.some(x => ["uneven-looking tone", "dark spots", "hyperpigmentation"].includes(x))) observations.push({ category: "tone", label: "Tone", description: "Demo mode: a brighter-looking, more even appearance is one of your stated goals." });
    if (!observations.length) observations.push({ category: "texture", label: "Skin snapshot", description: "Demo mode is active. Your photo was accepted, but no live computer-vision claim is being made." });
    return { observations: observations.slice(0, 3), mode: "mock", disclaimer: "Cosmetic guidance only. This is not a medical diagnosis or a measure of skin health." };
  }
}

export function getSkinAnalysisProvider(): SkinAnalysisProvider {
  // A live provider can replace this implementation without changing the upload route or UI.
  return new MockSkinAnalysisProvider();
}
