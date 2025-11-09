
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an image using the Google Imagen model.
 * @param prompt - The descriptive text prompt for the image.
 * @param aspectRatio - The desired aspect ratio for the image.
 * @returns A promise that resolves to the base64 encoded image string.
 */
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4", // Cast to the expected literal types
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const image = response.generatedImages[0];
      if (image.image?.imageBytes) {
        return image.image.imageBytes;
      }
    }
    
    throw new Error('No image was generated. The response might have been blocked.');

  } catch (error) {
    console.error('Error generating image with Gemini API:', error);
    if (error instanceof Error) {
        // More specific error handling
        if (error.message.includes('SAFETY')) {
            throw new Error('Image generation failed due to safety settings. Please modify your prompt.');
        }
        if (error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check your configuration.');
        }
    }
    throw new Error('Failed to generate image. Please check the console for more details.');
  }
};
