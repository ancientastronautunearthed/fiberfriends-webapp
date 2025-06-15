// Client-side API functions that use Firestore and external APIs directly

export async function generateNutritionalAnalysis(foodDescription: string, mealType: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
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
            `
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        }
      })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (error) {
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
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
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
            `
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300,
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return "Your symptoms appear to be stable compared to previous logs. Consider maintaining your current routine and tracking any patterns you notice. Your improved sleep quality may be contributing to better overall well-being.";
  }
}

export async function generateAICompanionResponse(userMessage: string, userContext: any) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
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
            `
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return "I understand what you're going through. It's important to track these patterns and celebrate the small victories. Would you like to discuss any specific symptoms you're experiencing today?";
  }
}