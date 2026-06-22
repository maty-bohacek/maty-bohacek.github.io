// Shared constants for media handling and the submission form.

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB
export const MAX_VIDEO_BYTES = 75 * 1024 * 1024; // 75 MB

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

export const ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];

// Suggestions for the optional "which model" attribution field. Free text is
// always allowed — this just powers an autocomplete datalist. Kept roughly in
// "most likely first" order, newest mainstream models toward the top, images
// before video. Update freely as the landscape shifts.
export const KNOWN_AI_MODELS = [
  // ── Image ────────────────────────────────────────────────
  'Nano Banana (Gemini 2.5 Flash Image)',
  'Nano Banana Pro (Gemini 3 Pro Image)',
  'GPT Image 1 (OpenAI)',
  'GPT-4o image',
  'DALL·E 3',
  'Midjourney v7',
  'Midjourney v6',
  'FLUX.1 (Black Forest Labs)',
  'FLUX1.1 Pro',
  'Stable Diffusion 3.5',
  'Stable Diffusion XL',
  'Google Imagen 4',
  'Google Imagen 3',
  'Ideogram 3.0',
  'Adobe Firefly',
  'Recraft V3',
  'Leonardo Phoenix',
  'Reve',
  'Qwen-Image (Alibaba)',
  'Grok / Aurora (xAI)',
  // ── Video ────────────────────────────────────────────────
  'Sora 2 (OpenAI)',
  'Sora',
  'Google Veo 3',
  'Runway Gen-4',
  'Kling 2.x',
  'Hailuo / MiniMax',
  'Luma Dream Machine',
  'Pika',
  'Seedance (ByteDance)',
  'Wan (Alibaba)',
  'Hunyuan Video (Tencent)',
];

// Capture-date bounds. The camera era starts well before this, but anything
// older is almost certainly a wrong/garbage EXIF timestamp for our purposes.
export const MIN_CAPTURE_YEAR = 1900;

export const MAX_CAPTION_LENGTH = 200;
export const MAX_REASONING_LENGTH = 5000;
export const MAX_LOCATION_LENGTH = 200;
export const MAX_MODEL_LENGTH = 120;
