
export interface StylePreset {
  label: string;
  value: string;
}

export interface AspectRatio {
  label: string;
  value: string;
}

export interface ImageHistoryItem {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  imageUrl: string;
}
