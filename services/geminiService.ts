
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Use the latest stable flash model for best reliability across different API keys
const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Safely retrieves the API key. 
 * On Vercel, this must be set in the 'Environment Variables' dashboard.
 */
const getApiKey = () => {
  try {
    // Check for process.env (Node/Bundler) or a global fallback
    const key = typeof process !== 'undefined' ? process.env?.API_KEY : (window as any).API_KEY;
    return key || '';
  } catch (e) {
    return '';
  }
};

const SYSTEM_PROMPT = `
You are a Meeting Minutes Generator for Minico.
You MUST always use this exact structure:
1. Meeting Minutes
2. Meeting Title
3. Date
4. Type of Meeting
5. Attendees
6. Agenda
7. Meeting Summary
8. Key Discussions & Decisions
9. Timeframe & Weekly Action Plan
10. Conclusion
11. Minutes Taken By
`;

export const generateMinutesStream = async function* (
  input: string | { data: string; mimeType: string },
  additionalInstructions: string = ""
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: Please set your Gemini API key in the environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const contents: any[] = [];
  if (typeof input === 'string') {
    contents.push({ text: input });
  } else {
    contents.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
  }

  if (additionalInstructions) {
    contents.push({ text: `Additional Instructions: ${additionalInstructions}` });
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: { parts: contents },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Handle specific API errors like 403 (Invalid Key)
    if (error.message?.includes('403') || error.message?.includes('401')) {
      throw new Error("AUTH_ERROR: Your API key is invalid or lacks permissions.");
    }
    throw new Error("GENERATION_FAILED: The AI synthesis was interrupted.");
  }
};

export const generateExtraFeature = async (
  sourceMinutes: string,
  feature: 'followup' | 'whatsapp' | 'actionItems' | 'attendance'
): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const featurePrompts = {
    followup: "Generate a professional post-meeting follow-up email.",
    whatsapp: "Generate a concise WhatsApp announcement summary.",
    actionItems: "Create a formal Action Items table.",
    attendance: "Create a professional Attendance Tracking Sheet."
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        { text: `Source Minutes:\n\n${sourceMinutes}\n\nTask: ${featurePrompts[feature]}` }
      ],
      config: {
        systemInstruction: "You are a professional NGO coordinator.",
        temperature: 0.2,
      },
    });

    return response.text || "No content generated.";
  } catch (error) {
    throw new Error(`Failed to generate ${feature}.`);
  }
};
