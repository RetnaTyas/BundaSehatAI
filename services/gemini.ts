
import { GoogleGenAI, Type } from "@google/genai";
import { MealAnalysisResult, SupplementAnalysisResult, DailyMenuPlan } from '../types';

// Helper to get client safely only when needed
const getGenAIClient = () => {
  let apiKey = '';
  // Check process.env (bundler injected) first, then window.process (runtime shim)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    apiKey = process.env.API_KEY;
  } else if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
    apiKey = (window as any).process.env.API_KEY;
  }

  // Return null if no key, handle gracefully in caller
  if (!apiKey) return null;

  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Failed to initialize Gemini client:", e);
    return null;
  }
};

const MODEL_NAME = 'gemini-2.5-flash';

export const analyzeMealWithAI = async (mealDescription: string): Promise<MealAnalysisResult> => {
  const ai = getGenAIClient();
  if (!ai) {
    console.error("API Key missing");
    return {
      calories: 0,
      protein: 0,
      isPregnancySafe: true,
      nutritionalNotes: "API Key belum dikonfigurasi. Mohon cek pengaturan deployment."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze this meal for a pregnant woman: "${mealDescription}". 
      Estimate calories, protein, pregnancy safety, and provide brief nutritional notes.
      IMPORTANT: The 'nutritionalNotes' MUST be in the SAME LANGUAGE as the user's input "${mealDescription}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER, description: "Estimated calories in kcal" },
            protein: { type: Type.NUMBER, description: "Estimated protein in grams" },
            isPregnancySafe: { type: Type.BOOLEAN, description: "Is this generally considered safe for pregnant women?" },
            nutritionalNotes: { type: Type.STRING, description: "Brief advice (max 1 sentence) in the SAME LANGUAGE as input." }
          },
          required: ["calories", "protein", "isPregnancySafe", "nutritionalNotes"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MealAnalysisResult;
    }
    throw new Error("No response text from AI");
  } catch (error) {
    console.error("Error analyzing meal:", error);
    return {
      calories: 0,
      protein: 0,
      isPregnancySafe: true,
      nutritionalNotes: "Gagal menganalisis. Silakan coba lagi."
    };
  }
};

export const analyzeSupplementsWithAI = async (text: string): Promise<SupplementAnalysisResult> => {
  const ai = getGenAIClient();
  if (!ai) {
    return { detected: {}, feedback: "API Key missing." };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze this text from a pregnant woman: "${text}". Determine which supplements she just took.
      Mapping:
      - Folic Acid / Asam Folat -> folicAcid
      - Iron / Zat Besi / TTD -> iron
      - Calcium / Kalsium -> calcium
      - Vitamin D -> vitaminD

      Output JSON. 
      1. Set booleans to true ONLY if explicitly mentioned. 
      2. 'feedback': A very short sentence confirming what was logged (e.g., "Logged Iron and Calcium.") in the SAME LANGUAGE as the input text.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detected: {
              type: Type.OBJECT,
              properties: {
                folicAcid: { type: Type.BOOLEAN },
                iron: { type: Type.BOOLEAN },
                calcium: { type: Type.BOOLEAN },
                vitaminD: { type: Type.BOOLEAN },
              }
            },
            feedback: { type: Type.STRING, description: "Brief confirmation message in user's language" }
          }
        }
      }
    });

    if (response.text) {
      const json = JSON.parse(response.text);
      return {
        detected: json.detected || {},
        feedback: json.feedback || "Processed."
      };
    }
    return { detected: {}, feedback: "" };
  } catch (error) {
    console.error("Error analyzing supplements:", error);
    return { detected: {}, feedback: "" };
  }
};

export const generateDailyMenu = async (
  pregnancyWeek: number, 
  avgCalories: number, 
  avgProtein: number
): Promise<DailyMenuPlan | null> => {
  const ai = getGenAIClient();
  if (!ai) return null;

  try {
    const prompt = `
      Act as a professional nutritionist for pregnant women in Indonesia.
      User Context:
      - Pregnancy Week: ${pregnancyWeek}
      - Recent Average Intake: ${avgCalories} kcal/day, ${avgProtein}g protein/day.
      - Target: ~2200 kcal/day, ~75g protein/day.

      Task: Generate a 1-day meal plan (Breakfast, Lunch, Dinner, Snack) using INDONESIAN CUISINE that helps balance her nutrition.
      If her protein is low, suggest high protein meals. If calories are low, suggest nutrient-dense foods.
      
      Also provide:
      1. 'nutritionalReasoning': A short explanation (in Indonesian) why this menu fits her current stats/deficiencies.
      2. 'cookingTip': A specific food safety or cooking tip relevant to pregnancy (in Indonesian).

      Output must be strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            breakfast: { 
              type: Type.OBJECT, 
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCalories: { type: Type.NUMBER },
                estimatedProtein: { type: Type.NUMBER }
              }
            },
            lunch: { 
              type: Type.OBJECT, 
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCalories: { type: Type.NUMBER },
                estimatedProtein: { type: Type.NUMBER }
              }
            },
            dinner: { 
              type: Type.OBJECT, 
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCalories: { type: Type.NUMBER },
                estimatedProtein: { type: Type.NUMBER }
              }
            },
            snack: { 
              type: Type.OBJECT, 
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCalories: { type: Type.NUMBER },
                estimatedProtein: { type: Type.NUMBER }
              }
            },
            nutritionalReasoning: { type: Type.STRING },
            cookingTip: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DailyMenuPlan;
    }
    return null;
  } catch (error) {
    console.error("Error generating menu:", error);
    return null;
  }
};

export const chatWithAdvisor = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  const ai = getGenAIClient();
  if (!ai) return "Mohon konfigurasi API Key terlebih dahulu.";

  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history,
      config: {
        systemInstruction: `You are 'BundaSehat', a friendly and supportive personal nutrition and health assistant for pregnant women. 
        IMPORTANT: Always reply in the SAME LANGUAGE as the user's last message. 
        If the user speaks Indonesian, reply in polite, soothing Indonesian. 
        If the user speaks English, reply in English.
        Focus on nutrition, food safety, and general well-being. For medical emergencies, advise seeing a doctor immediately.`,
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Maaf, saya sedang mengalami gangguan sebentar.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Maaf, terjadi kesalahan koneksi. Silakan coba lagi nanti.";
  }
};
