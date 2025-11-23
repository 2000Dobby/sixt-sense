import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/vertex';

export async function GET() {
  try {
    // You can change the model ID here. 
    // Common values: 'gemini-1.5-flash-001', 'gemini-1.5-pro-001', 'gemini-experimental'
    const modelId = 'gemini-3-pro-preview'; 
    
    const generativeModel = getGeminiModel(modelId);

    const prompt = "Hello! Please verify that you are working by saying 'Vertex AI connection successful!' and telling me a short joke.";

    const resp = await generativeModel.generateContent(prompt);
    const contentResponse = await resp.response;
    const text = contentResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ 
      success: true,
      model: modelId,
      response: text,
      raw: contentResponse
    });

  } catch (error: any) {
    console.error("Vertex AI Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error 
    }, { status: 500 });
  }
}
