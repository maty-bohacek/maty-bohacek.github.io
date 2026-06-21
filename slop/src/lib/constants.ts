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
// always allowed — this just powers an autocomplete datalist.
export const KNOWN_AI_MODELS = [
  'Midjourney',
  'DALL·E 3',
  'Stable Diffusion',
  'Flux',
  'Google Imagen',
  'Adobe Firefly',
  'Ideogram',
  'Leonardo',
  'Grok / Aurora',
  'GPT-4o image',
  'Nano Banana (Gemini)',
  'Sora',
  'Google Veo',
  'Runway',
  'Kling',
  'Luma Dream Machine',
  'Hailuo / MiniMax',
  'Pika',
];

export const MAX_CAPTION_LENGTH = 200;
export const MAX_REASONING_LENGTH = 5000;
export const MAX_LOCATION_LENGTH = 200;
export const MAX_MODEL_LENGTH = 120;
