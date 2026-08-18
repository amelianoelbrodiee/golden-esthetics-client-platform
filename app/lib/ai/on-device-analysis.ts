import type { CosmeticObservation, SkinAnalysisResult } from "./skin-analysis";

type PhotoMetrics = {
  meanLight: number;
  lightVariation: number;
  warmRatio: number;
  shineRatio: number;
};

function getPhotoMetrics(data: Uint8ClampedArray): PhotoMetrics {
  const lights: number[] = [];
  let warmPixels = 0;
  let shinePixels = 0;
  let includedPixels = 0;

  for (let index = 0; index < data.length; index += 16) {
    const red = data[index] / 255;
    const green = data[index + 1] / 255;
    const blue = data[index + 2] / 255;
    const alpha = data[index + 3] / 255;
    if (alpha < 0.5) continue;

    const light = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    if (light < 0.06 || light > 0.98) continue;

    includedPixels += 1;
    lights.push(light);
    if (red - (green + blue) / 2 > 0.075 && red > green * 1.04) warmPixels += 1;
    if (light > 0.78 && Math.max(red, green, blue) - Math.min(red, green, blue) < 0.16) shinePixels += 1;
  }

  if (includedPixels < 250) throw new Error("We couldn’t read enough detail from that photo. Try another image in soft, natural light.");
  const meanLight = lights.reduce((sum, value) => sum + value, 0) / lights.length;
  const variance = lights.reduce((sum, value) => sum + (value - meanLight) ** 2, 0) / lights.length;
  return {
    meanLight,
    lightVariation: Math.sqrt(variance),
    warmRatio: warmPixels / includedPixels,
    shineRatio: shinePixels / includedPixels,
  };
}

export async function analyzePhotoOnDevice(file: File): Promise<SkinAnalysisResult> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 180;
  canvas.height = 180;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    bitmap.close();
    throw new Error("Photo analysis is not supported in this browser. You can still continue with the skin quiz.");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const metrics = getPhotoMetrics(context.getImageData(0, 0, canvas.width, canvas.height).data);
  if (metrics.meanLight < 0.2) throw new Error("That photo is a little too dark to read reliably. Try facing a window or continue with the skin quiz.");
  if (metrics.meanLight > 0.88) throw new Error("That photo is a little too bright to read reliably. Try softer light or continue with the skin quiz.");

  const observations: CosmeticObservation[] = [];
  if (metrics.warmRatio > 0.12) {
    observations.push({
      category: "redness",
      label: "Visible warmth",
      description: "Sparrow noticed some warmer-toned areas in this photo. Lighting, makeup, and camera settings can influence this cue, so McKinnley can confirm it in person.",
    });
  }
  if (metrics.lightVariation > 0.19) {
    observations.push({
      category: "tone",
      label: "Visible tone variation",
      description: "Sparrow noticed some light-and-tone variation in the image. This is a cosmetic photo cue, not a measure of skin health.",
    });
  }
  if (metrics.shineRatio > 0.085) {
    observations.push({
      category: "oiliness",
      label: "Surface shine",
      description: "A few higher-shine areas are visible in this lighting. Skincare, makeup, and the camera flash can all affect how this appears.",
    });
  }
  if (!observations.length) {
    observations.push({
      category: "texture",
      label: "Even-looking snapshot",
      description: "This photo appears relatively even in the current lighting. Sparrow will lean more heavily on your quiz answers for the service match.",
    });
  }

  return {
    observations: observations.slice(0, 3),
    mode: "on-device",
    disclaimer: "Sparrow reviews only non-medical visual cues. This is not a diagnosis or a measure of skin health.",
  };
}
