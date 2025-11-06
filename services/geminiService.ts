
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisItem } from "../types";

const analysisSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: "The type of issue: 'ERROR', 'WARNING', or 'INFO'. Errors are critical, warnings are potential problems, and info is for non-critical notices.",
          enum: ["ERROR", "WARNING", "INFO"],
        },
        title: {
          type: Type.STRING,
          description: "A short, descriptive title for the issue found (e.g., 'XML Parsing Error', 'Missing Mod Dependency').",
        },
        logLines: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: "An array of the exact, unmodified log line(s) that indicate this issue.",
        },
        description: {
          type: Type.STRING,
          description: "A clear and detailed explanation of what the issue means and what its impact is on the server. Explain the root cause.",
        },
        solution: {
          type: Type.STRING,
          description: "A step-by-step guide on how to resolve the issue. Be specific about file names, configuration changes, or actions to take.",
        },
      },
      required: ["type", "title", "logLines", "description", "solution"],
    },
};


export const analyzeLogFile = async (logContent: string): Promise<AnalysisItem[]> => {
    // Lazy initialization of GoogleGenAI to ensure API key is available
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert DayZ server administrator and troubleshooter. Your primary function is to analyze the provided DayZ server log file to identify all errors, critical warnings, and significant issues. For each issue you find, you must provide a concise title, the relevant log lines, a clear description of the problem, and a detailed, actionable solution.

    Analyze the following DayZ server log file. Identify all issues and provide solutions for each one. Your response MUST be a valid JSON array matching the schema provided and nothing else.

    Log File Content:
    ---
    ${logContent}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '');
        const result = JSON.parse(cleanedJsonText);
        
        if (Array.isArray(result)) {
            return result as AnalysisItem[];
        }
        console.warn("Gemini response was not an array:", result);
        return [];

    } catch (error) {
        console.error("Error analyzing log file with Gemini:", error);
        if (error instanceof Error) {
           throw new Error(`Failed to analyze log file with Gemini: ${error.message}`);
        }
        throw new Error("An unknown error occurred during log analysis.");
    }
};
