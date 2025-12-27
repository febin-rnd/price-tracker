
import { GoogleGenAI, Type } from "@google/genai";
import { ScrapingResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractProductData = async (url: string): Promise<ScrapingResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract the current product name, price (as a number), currency code, and a high-quality image URL from this e-commerce link: ${url}. If you cannot find the exact price from the URL, use Google Search to find the latest live price for this specific product.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Full name of the product" },
            price: { type: Type.NUMBER, description: "Current price as a numeric value" },
            currency: { type: Type.STRING, description: "Currency symbol or code (e.g., $, ₹)" },
            imageUrl: { type: Type.STRING, description: "Direct URL to the product image" },
            platform: { 
              type: Type.STRING, 
              enum: ["Amazon", "Flipkart", "Other"],
              description: "The e-commerce platform name"
            }
          },
          required: ["name", "price", "currency", "imageUrl", "platform"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return data as ScrapingResult;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract product data. Please check the URL.");
  }
};

export const checkPriceUpdate = async (productName: string, url: string): Promise<{ price: number }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current live price for ${productName} at ${url}? Return only the numeric price value.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            price: { type: Type.NUMBER }
          },
          required: ["price"]
        }
      }
    });

    return JSON.parse(response.text || '{"price": 0}');
  } catch (error) {
    console.error("Price Update Error:", error);
    return { price: 0 };
  }
};
