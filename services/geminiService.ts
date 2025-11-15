
import { GoogleGenAI } from "@google/genai";
import type { GeminiResponse, GroundingSource } from '../types';

const PROMPT = `Based on the current date, find the two most recent quarterly 13-F filings for Berkshire Hathaway (CIK: 1067983) on the SEC EDGAR database (site:sec.gov).

For each of the two filings, please extract the following information:
1. The filing date and the quarter it represents (e.g., "Q3 2025").
2. The total market value of all holdings reported on the summary page.
3. A list of all holdings from the information table. For each holding, extract:
   - NAME OF ISSUER
   - CUSIP
   - VALUE (x$1000)
   - SHRS OR PRN AMT
   - Ticker Symbol (if you can find it based on the company name)

After extracting the data, return a single JSON object with the following structure. Do not include any text, explanations, or markdown formatting outside of the JSON object.

{
  "quarter1": {
    "label": "Q_ 20YY",
    "filingDate": "YYYY-MM-DD",
    "totalValue": 123456789,
    "holdings": [
      {
        "name": "APPLE INC",
        "cusip": "037833100",
        "ticker": "AAPL",
        "value": 50000000,
        "shares": 150000000
      }
    ]
  },
  "quarter2": {
    "label": "Q_ 20YY",
    "filingDate": "YYYY-MM-DD",
    "totalValue": 113456789,
    "holdings": [
      {
        "name": "APPLE INC",
        "cusip": "037833100",
        "ticker": "AAPL",
        "value": 48000000,
        "shares": 145000000
      }
    ]
  }
}

Ensure 'quarter1' is the most recent quarter and 'quarter2' is the one before it. Remove any dollar signs or commas from numerical values. For the 'shares' field, use the 'sshPrnamt' value. For the 'value' field, use the 'value' value (which is already in thousands).`;


export async function fetchFilingsData(): Promise<{ data: GeminiResponse; groundingChunks: GroundingSource[] }> {
    // API key must be set in the environment
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: PROMPT,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('`')) {
         jsonString = jsonString.substring(1, jsonString.length - 1).trim();
    }

    try {
        const data = JSON.parse(jsonString);
        return { data, groundingChunks };
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", e);
        console.error("Raw response text:", response.text);
        throw new Error("The AI returned data in an invalid format. Please try again.");
    }
}
