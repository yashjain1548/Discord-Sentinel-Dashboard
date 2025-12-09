import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from '../types';

const apiKey = process.env.API_KEY; // Assumes API Key is injected by the environment
const ai = new GoogleGenAI({ apiKey: apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sentiment_score: {
      type: Type.NUMBER,
      description: "A float between -1.0 (negative) and 1.0 (positive) representing the sentiment.",
    },
    primary_topic: {
      type: Type.STRING,
      description: "The main subject of the message (e.g., 'Support', 'Gaming', 'Spam', 'Random', 'Coding').",
    },
    is_toxic: {
      type: Type.BOOLEAN,
      description: "True if the message contains hate speech, harassment, or excessive profanity.",
    },
  },
  required: ["sentiment_score", "primary_topic", "is_toxic"],
};

export const analyzeMessage = async (content: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    // Fallback mock for when no API key is present in preview
    console.warn("No API Key found. Returning mock analysis.");
    await new Promise(resolve => setTimeout(resolve, 800)); // Fake latency
    return {
      sentiment_score: Math.random() * 2 - 1,
      primary_topic: ['General', 'Help', 'Gaming', 'Off-topic'][Math.floor(Math.random() * 4)],
      is_toxic: Math.random() > 0.9
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following Discord message for community health monitoring: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are Discord Sentinel, an automated moderation bot. Analyze messages strictly. Sentiment ranges from -1.0 to 1.0. Topics should be concise categories.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    
    throw new Error("Empty response from model");
  } catch (error) {
    console.error("Analysis failed:", error);
    // Fallback on error to prevent app crash
    return {
      sentiment_score: 0,
      primary_topic: "Unknown",
      is_toxic: false
    };
  }
};