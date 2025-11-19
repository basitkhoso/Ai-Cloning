import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned from the model.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const generateClonedSpeech = async (text: string, audioData: string, mimeType: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioData,
            },
          },
          {
            text: `Please act as a professional voice actor. Listen to the voice in the audio file provided. Then, speak the following text aloud, strictly mimicking the voice, tone, pacing, and style of the speaker in the audio file. Do not add any introductory or concluding remarks. Just speak the text:\n\n"${text}"`
          },
        ],
      },
      config: {
        responseModalities: [Modality.AUDIO],
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned from the model. The model might have refused the request or encountered an error.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Error generating cloned speech:", error);
    throw error;
  }
};
