export interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
  id: string;
}

export interface ImageSlot {
  index: number;
  label: string;
  image: ImageData | null;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  story: string | null;
}
