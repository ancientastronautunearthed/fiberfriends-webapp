import { configureGenkit } from '@genkit-ai/core';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';

configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export async function generateNutritionalAnalysis(foodDescription: string, mealType: string) {
  const prompt = `
    Analyze the following ${mealType} meal and provide nutritional information:
    
    Food Description: ${foodDescription}
    
    Please respond with a JSON object containing:
    {
      "calories": estimated_calories_number,
      "protein": protein_grams_number,
      "carbs": carbs_grams_number,
      "fat": fat_grams_number,
      "fiber": fiber_grams_number,
      "critique": "brief_constructive_feedback_about_the_meal_for_morgellons_patients"
    }
    
    Focus on anti-inflammatory properties and nutritional balance. Be encouraging and supportive.
  `;

  const response = await generate({
    model: gemini15Flash,
    prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 500,
    },
  });

  try {
    return JSON.parse(response.text());
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      calories: 350,
      protein: 15,
      carbs: 45,
      fat: 12,
      fiber: 8,
      critique: "This meal provides good nutritional balance. Consider adding more vegetables for additional vitamins and minerals."
    };
  }
}

export async function generateSymptomInsight(symptomData: any) {
  const prompt = `
    Analyze the following symptom log for a Morgellons disease patient:
    
    Overall Feeling: ${symptomData.overallFeeling}/4
    Symptoms: ${symptomData.symptoms.join(', ')}
    Sleep Quality: ${symptomData.sleepQuality}/5
    Sun Exposure: ${symptomData.sunExposure}
    Notes: ${symptomData.notes}
    
    Provide a supportive, non-medical insight about patterns and general wellness suggestions.
    Focus on lifestyle factors, routine management, and encouragement.
    Keep response under 150 words and be empathetic.
    Do not provide medical advice or diagnosis.
  `;

  const response = await generate({
    model: gemini15Flash,
    prompt,
    config: {
      temperature: 0.4,
      maxOutputTokens: 300,
    },
  });

  return response.text();
}

export async function generateCommunityPostAnalysis(postContent: string, category: string) {
  const prompt = `
    Analyze this community post from a health support forum:
    
    Category: ${category}
    Content: ${postContent}
    
    Provide a brief, supportive analysis that:
    - Acknowledges the shared experience
    - Highlights any mentioned helpful strategies
    - Offers general encouragement
    - Suggests considering professional guidance when appropriate
    
    Keep response under 100 words. Be empathetic and supportive.
    Do not provide medical advice.
  `;

  const response = await generate({
    model: gemini15Flash,
    prompt,
    config: {
      temperature: 0.5,
      maxOutputTokens: 200,
    },
  });

  return response.text();
}

export async function generateAICompanionResponse(userMessage: string, userContext: any) {
  const prompt = `
    You are Luna, a supportive AI health companion for someone managing Morgellons disease.
    
    User's recent context:
    - Recent mood: ${userContext.recentMood || 'Not specified'}
    - Sleep quality: ${userContext.sleepQuality || 'Not specified'}
    - Symptom level: ${userContext.symptomLevel || 'Not specified'}
    
    User message: ${userMessage}
    
    Respond as Luna with:
    - Empathy and understanding
    - Encouraging but realistic tone
    - Focus on daily management and self-care
    - No medical advice or diagnosis
    - Personal, conversational style
    
    Keep response under 150 words.
  `;

  const response = await generate({
    model: gemini15Flash,
    prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 300,
    },
  });

  return response.text();
}

export async function generateDailyChallenge() {
  const prompt = `
    Create a daily wellness challenge for someone managing Morgellons disease.
    Focus on:
    - Nutrition education
    - Stress management
    - Sleep hygiene
    - Gentle movement
    - Mindfulness
    
    Format as a JSON object:
    {
      "title": "challenge_title",
      "description": "challenge_description",
      "points": points_reward_number,
      "category": "nutrition|wellness|movement|mindfulness"
    }
    
    Make it achievable and encouraging.
  `;

  const response = await generate({
    model: gemini15Flash,
    prompt,
    config: {
      temperature: 0.8,
      maxOutputTokens: 200,
    },
  });

  try {
    return JSON.parse(response.text());
  } catch (error) {
    return {
      title: "Mindful Breathing",
      description: "Take 5 minutes for deep breathing exercises to reduce stress and promote relaxation.",
      points: 25,
      category: "mindfulness"
    };
  }
}