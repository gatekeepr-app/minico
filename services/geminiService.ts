
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_PROMPT = `
You are a Meeting Minutes Generator for Minico, a premium professional application.

CORE RESPONSIBILITY:
Convert audio/text content into clean, professional Meeting Minutes using the locked Meeting Minutes format.

⚠️ HARD RULE (NON-NEGOTIABLE):
You MUST always use this exact 11-point structure in this order:
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

STYLE:
- NGO / Institutional tone (formal, concise, objective).
- Use clean Markdown: '##' for main sections, '###' for sub-sections, and '*' for bullets.
- DO NOT use excessive symbols or hashtags. 
- Ensure the output is readable as a standalone document.
- No meta-commentary.
`;

export const generateMinutesStream = async function* (
  input: string | { data: string; mimeType: string },
  additionalInstructions: string = ""
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
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
      model: 'gemini-3-flash-preview',
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
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("MINICO_AUTH_OR_CORE_FAILURE");
  }
};

export const generateExtraFeature = async (
  sourceMinutes: string,
  feature: 'followup' | 'whatsapp' | 'actionItems' | 'attendance'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const featurePrompts = {
    followup: "Generate a professional post-meeting follow-up email. Use the minutes to thank attendees and reiterate next steps.",
    whatsapp: "Generate a concise WhatsApp announcement for the group. Bullet points for key highlights only.",
    actionItems: "Create a formal Action Items table with columns: Task, Owner, Deadline, Status.",
    attendance: "Create a professional Attendance Tracking Sheet based on the names mentioned in the minutes. Include columns for Name, Organization/Role, and Status (Present/Absent/Excused)."
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: `Source Minutes:\n\n${sourceMinutes}\n\nTask: ${featurePrompts[feature]}` }
      ],
      config: {
        systemInstruction: "You are a professional NGO coordinator. Output ONLY the requested document. No meta-commentary.",
        temperature: 0.2,
      },
    });

    return response.text || "No content generated.";
  } catch (error) {
    throw new Error(`Failed to generate ${feature}.`);
  }
};
