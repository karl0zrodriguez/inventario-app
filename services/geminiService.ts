
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDescription = async (productName: string, keywords: string): Promise<string> => {
    if(!API_KEY) {
        return Promise.resolve("AI functionality is disabled. Please set your API key.");
    }
    
    try {
        const prompt = `Generate a compelling and professional product description for a product named "${productName}". 
        Key features are: ${keywords}. 
        The description should be suitable for an e-commerce catalog, approximately 50-70 words long. Do not use markdown.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating description with Gemini API:", error);
        return "There was an error generating the description.";
    }
};
