
import type { StylePreset, AspectRatio } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  { label: 'Photorealistic', value: 'photorealistic, 8k, detailed, professional photography' },
  { label: 'Oil Painting', value: 'oil painting, classic, textured, masterpiece' },
  { label: 'Cyberpunk', value: 'cyberpunk, futuristic, neon lights, dystopian' },
  { label: 'Watercolor', value: 'watercolor, vibrant, soft, blended' },
  { label: '3D Render', value: '3d render, octane render, high detail, cinematic' },
  { label: 'Anime', value: 'anime style, vibrant, detailed background' },
  { label: 'Minimalist', value: 'minimalist, clean lines, simple' },
  { label: 'Fantasy Art', value: 'fantasy art, epic, magical, detailed' },
];

export const ASPECT_RATIOS: AspectRatio[] = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
];
