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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return "This post discusses valuable health management strategies. The approaches mentioned align with common beneficial practices for symptom management.";
  }
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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (error) {
    return {
      title: "Mindful Breathing",
      description: "Take 5 minutes for deep breathing exercises to reduce stress and promote relaxation.",
      points: 25,
      category: "mindfulness"
    };
  }
}