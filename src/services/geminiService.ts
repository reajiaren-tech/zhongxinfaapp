
import { GoogleGenAI } from "@google/genai";
import { Character, IterationStep } from "../types";

// Declare process to avoid TypeScript errors in Vite environments
declare var process: any;

const getSystemInstruction = (character: Character) => {
  switch (character) {
    case Character.LOCOMOTIVE:
      return "You are 'Iron Head', a cartoon locomotive engine from Guangzhou Railway Polytechnic. You are energetic, authoritative like a conductor, and use train metaphors ('Full steam ahead!', 'On the right track!'). You explain the logistics logic clearly and loudly.";
    case Character.CONTAINER:
      return "You are 'Boxy', a cartoon shipping container. You are steady, reliable, and a bit nerdy about weight and capacity. You focus on the 'weight' aspect of the Center of Gravity method. Use phrases like 'Heavy lifting!', 'Secure the cargo!'.";
    default:
      return "You are a helpful logistics assistant.";
  }
};

export const fetchCharacterCommentary = async (
  character: Character, 
  step: IterationStep, 
  prevStep: IterationStep | null
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Signal lost! Check API Key!";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const deltaX = prevStep ? (step.x - prevStep.x).toFixed(2) : 0;
    const deltaY = prevStep ? (step.y - prevStep.y).toFixed(2) : 0;
    const isConverged = prevStep && Math.abs(step.x - prevStep.x) < 0.1 && Math.abs(step.y - prevStep.y) < 0.1;

    const prompt = `
      Context: We are performing the Center of Gravity Iterative Method for a logistics facility location problem.
      Current Iteration: ${step.step}
      Current Coordinate: (${step.x.toFixed(2)}, ${step.y.toFixed(2)})
      Movement from last step: X moved ${deltaX}, Y moved ${deltaY}.
      Total Cost: ${step.distanceCost.toFixed(2)}.
      ${isConverged ? "We have converged! The train has arrived at the station!" : "Still iterating towards the optimal cost."}
      
      Please write a short (1-2 sentence) commentary in Chinese suitable for students at a railway college. Be professional but fun.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(character),
        temperature: 0.7,
      }
    });

    return response.text || "Calculating route...";
  } catch (error) {
    console.error("Gemini Error", error);
    return "Communication error with control tower...";
  }
};
