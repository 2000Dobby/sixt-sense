import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';

const projectId = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';

let vertexClient: VertexAI | null = null;

export function getVertexClient(): VertexAI {
  if (!vertexClient) {
    if (!projectId) {
      throw new Error("Project ID is not set. Please set PROJECT_ID in your environment variables.");
    }
    console.log(`Initializing Vertex AI with Project: ${projectId}, Location: ${location}`);
    
    const options: any = { project: projectId, location };
    
    // Explicitly set apiEndpoint for global location to avoid global-aiplatform.googleapis.com
    if (location === 'global') {
      options.apiEndpoint = 'aiplatform.googleapis.com';
    }

    vertexClient = new VertexAI(options);
  }
  return vertexClient;
}

export function getGeminiModel(modelId: string = 'gemini-3-pro-preview'): GenerativeModel {
  const client = getVertexClient();
  return client.getGenerativeModel({ model: modelId });
}

export async function generateStructuredJson<T>(
  responseSchema: any, // Using any to be flexible with Vertex SDK types
  systemPrompt: string,
  userPrompt: string,
  modelId: string = 'gemini-3-pro-preview'
): Promise<{ raw: string; parsed: T }> {
  const client = getVertexClient();
  const generativeModel = client.getGenerativeModel({
    model: modelId,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const response = await generativeModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\nUSER_INPUT:\n${userPrompt}`,
          },
        ],
      },
    ],
  });

  const candidate = response.response?.candidates?.[0];
  const part = candidate?.content?.parts?.[0];
  
  if (!part?.text) {
    throw new Error("Vertex AI returned an empty response or no text content.");
  }

  const text = part.text;

  let parsed: T;
  try {
    parsed = JSON.parse(text) as T;
    
    // Basic runtime validation: ensure result is an object and not null, and NOT an array
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
       throw new Error("Parsed JSON is not an object (received array or null/undefined).");
    }

  } catch (err) {
    throw new Error(
      `Failed to parse JSON from Vertex response: ${(err as Error).message}\nRaw text: ${text}`
    );
  }

  return { raw: text, parsed };
}
