import "dotenv/config";
import { callLLMForJSON } from "./lib/llm";

async function main() {
    const systemPrompt = `You are a legal AI assistant. Classify the user's incident.
Respond ONLY in valid JSON matching this structure:
{
  "is_cognizable": boolean,
  "offence_category": string,
  "bns_sections": string[],
  "confidence": number
}`;

    const userMessage = "मेरी बाइक कल रात घर के बाहर से चोरी हो गई।";

    try {
        console.log("Testing callLLMForJSON with Gemini...");
        const result = await callLLMForJSON(systemPrompt, userMessage);
        console.log("LLM returned valid JSON:");
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

main();
