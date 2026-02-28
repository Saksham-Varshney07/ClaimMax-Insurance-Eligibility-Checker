import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const geminiAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groqAi = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function callLLM(
    systemPrompt: string,
    userMessage: string
): Promise<string> {
    try {
        const model = geminiAi.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.1,
            },
        });

        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: userMessage }] },
            ],
            systemInstruction: systemPrompt,
        });

        return result.response.text();
    } catch (geminiError) {
        console.error("[LLM Service] Gemini error, falling back to Groq:", geminiError);

        try {
            const completion = await groqAi.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
                response_format: { type: "json_object" },
            });

            return completion.choices[0]?.message?.content || "";
        } catch (groqError) {
            console.error("[LLM Service] Groq error:", groqError);
            throw new Error(`LLM Fallback completely failed: ${(groqError as Error).message}`);
        }
    }
}

export async function callLLMForJSON<T>(
    systemPrompt: string,
    userMessage: string
): Promise<T> {
    let text = await callLLM(systemPrompt, userMessage);

    if (text.startsWith("```json")) {
        text = text.replace(/^```json\n?/, "");
    }
    if (text.endsWith("```")) {
        text = text.replace(/```$/, "");
    }
    text = text.trim();

    try {
        return JSON.parse(text) as T;
    } catch (e) {
        throw new Error("LLM returned invalid JSON");
    }
}
