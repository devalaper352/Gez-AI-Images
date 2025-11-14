
import { GoogleGenAI, Modality, GenerateContentResponse, Content } from "@google/genai";

const getAiClient = () => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set. Please select a key in the application.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string"));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateImagesFromPrompt(
  prompt: string,
  numberOfImages: number,
  aspectRatio: '1:1' | '16:9'
): Promise<string[]> {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    return response.generatedImages.map(img => img.image.imageBytes);
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error("Failed to generate images. Please try again.");
  }
}

export async function enhanceImage(base64Image: string, prompt: string): Promise<string> {
  const enhancedPrompt = `Enhance this image with more detail, higher quality, and cinematic lighting. Original prompt: "${prompt}"`;
  const response = await generateImagesFromPrompt(enhancedPrompt, 1, '1:1');
  return response[0];
}

export async function editImage(imageFile: File, prompt: string): Promise<string> {
    try {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(imageFile);
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image was generated in the response.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit the image. The model may not be suitable for this type of edit.");
    }
}


export async function sendMessageToChatbot(
    message: string, 
    history: Content[],
    mode: 'fast' | 'search' | 'thinking'
): Promise<{ text: string; sources: {title: string, uri: string}[] }> {
    let modelName: string;
    let config: any = {};
    
    switch (mode) {
        case 'search':
            modelName = 'gemini-2.5-flash';
            config.tools = [{googleSearch: {}}];
            break;
        case 'thinking':
            modelName = 'gemini-2.5-pro';
            config.thinkingConfig = { thinkingBudget: 32768 };
            break;
        case 'fast':
        default:
            modelName = 'gemini-flash-lite-latest';
            break;
    }

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [...history, { role: 'user', parts: [{ text: message }] }],
            config,
        });

        const text = response.text;
        let sources: {title: string, uri: string}[] = [];

        if (mode === 'search' && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            sources = response.candidates[0].groundingMetadata.groundingChunks
                .filter(chunk => chunk.web)
                .map(chunk => ({
                    title: chunk.web.title || chunk.web.uri,
                    uri: chunk.web.uri,
                }));
        }

        return { text, sources };
    } catch (error) {
        console.error(`Error in chatbot (${mode} mode):`, error);
        throw new Error("The AI assistant is currently unavailable. Please try again later.");
    }
}

export async function generateVideo(prompt: string): Promise<any> {
    const ai = getAiClient();
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
        return operation;
    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found")) {
             throw new Error("API Key is invalid or expired. Please select a new key.");
        }
        throw new Error("Failed to start video generation. Please check your prompt and try again.");
    }
}

export async function checkVideoGenerationStatus(operation: any): Promise<any> {
    const ai = getAiClient();
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error checking video status:", error);
         if (error instanceof Error && error.message.includes("Requested entity was not found")) {
            throw new Error("API Key is invalid or expired. Please select a new key.");
        }
        throw new Error("Failed to check video generation status.");
    }
}
