import { GoogleGenAI } from '@google/genai';

// 1. Initialize the Google Gen AI SDK using Vercel's Environment Variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: any, res: any) {
  // 2. Security Check: Only allow POST requests (which your frontend uses to send prompts)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 3. Extract the user prompt (query) from the incoming frontend request body
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing query payload in request body.' });
    }

    // 4. Call Google's Gemini model to generate a response
    // Using the standard gemini-2.5-flash model optimized for speed and chat tasks
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
    });

    // 5. Send the text result back to your frontend template 
    // We format it as a JSON object containing the text response
    return res.status(200).json({ text: aiResponse.text });

  } catch (error: any) {
    // If anything breaks (like an expired API key), capture it and send a 500 error
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message || error 
    });
  }
}
