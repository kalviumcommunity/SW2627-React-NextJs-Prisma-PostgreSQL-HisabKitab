import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function extractLedgerData(imageBase64: string, mimeType: string) {
  // Use the flash model for fast extraction
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert at extracting financial ledger (khata) data from handwritten or printed images.
    Extract the following from the provided ledger image:
    1. The contact (customer/vendor) name.
    2. A list of transactions.
       - date: the date of the transaction if visible (YYYY-MM-DD or whatever format is present, translate to ISO if possible).
       - amount: the numeric amount of the transaction.
       - type: "YOU_GAVE" if the shopkeeper gave money/goods to the contact (debit). "YOU_GOT" if the shopkeeper received money from the contact (credit).
       - note: any description or items mentioned.

    Return the result strictly as a valid JSON object matching this schema:
    {
      "contactName": "string",
      "transactions": [
        {
          "date": "string (optional)",
          "amount": number,
          "type": "YOU_GAVE" | "YOU_GOT",
          "note": "string (optional)"
        }
      ],
      "finalBalance": number (optional, the ending balance if explicitly written)
    }
    Do NOT wrap the JSON in Markdown formatting (no \`\`\`json). Just return the raw JSON object.
  `;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  
  try {
    // Try to parse the response as JSON
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    // Sometimes it wraps in markdown even if told not to
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}
