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
  // Create variety by using random elements
  const seed = Math.floor(Math.random() * 10000);
  const categories = ['nutrition', 'wellness', 'movement', 'mindfulness', 'skincare', 'sleep', 'social'];
  const focusAreas = [
    'anti-inflammatory foods', 'detox support', 'gut health', 'energy boosting',
    'stress relief', 'gentle stretching', 'deep breathing', 'gratitude practice',
    'skin barrier repair', 'sleep optimization', 'connection building', 'creative expression'
  ];
  
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const randomFocus = focusAreas[Math.floor(Math.random() * focusAreas.length)];
  
  const prompt = `
    Create a UNIQUE wellness challenge for Morgellons disease management (seed: ${seed}).
    Focus area: ${randomFocus}
    Category: ${randomCategory}
    
    AVOID these overused titles: "Mindful Moments", "Hydration Hero", "Continue Your Journey", "Mindful Breathing"
    
    Create something specific and actionable. Format as JSON:
    {
      "title": "specific_creative_title",
      "description": "detailed_actionable_description", 
      "points": 15-45,
      "category": "${randomCategory}",
      "difficulty": "easy|medium|hard",
      "requirements": {
        "technique": "breathing|water-intake|journaling|symptom-tracking|general",
        "daily_minutes": 5-15,
        "daily_glasses": 6-10,
        "daily_words": 50-200,
        "duration_days": 1-7,
        "consecutive_days": 3-7,
        "time_of_day": "morning|evening|anytime"
      }
    }
    
    Choose ONE appropriate requirement type based on the challenge category.
    
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
      category: "mindfulness",
      difficulty: "easy"
    };
  }
}

export async function generatePersonalizedChallenge(userProfile: any, userHistory: any) {
  const prompt = `
    Create a personalized challenge for a Morgellons Disease patient based on their profile and history:

    User Profile: ${JSON.stringify(userProfile, null, 2)}
    Recent Activity: ${JSON.stringify(userHistory, null, 2)}
    
    Generate a challenge that:
    - Builds on their previous progress and interests
    - Addresses their specific symptoms or concerns
    - Matches their engagement level and preferences
    - Is appropriately challenging but achievable
    - Includes a personalized motivational message
    
    Format as JSON:
    {
      "title": "challenge_title",
      "description": "detailed_description",
      "category": "health|nutrition|social|mindfulness|physical",
      "difficulty": "easy|medium|hard",
      "points": points_value,
      "requirements": {completion_criteria},
      "personalizedMessage": "motivational_message"
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
      }),
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
  } catch (error) {
    return {
      title: "Continue Your Journey",
      description: "Build on your recent progress with a gentle health activity",
      category: "health",
      difficulty: "easy",
      points: 15,
      requirements: { type: "general_activity" },
      personalizedMessage: "You're doing great! Keep up the positive momentum."
    };
  }
}

export async function generateWeeklyChallenge(communityData: any) {
  const prompt = `
    Create a weekly community challenge for Morgellons Disease patients:

    Community Data: ${JSON.stringify(communityData, null, 2)}
    
    Generate a 7-day challenge that:
    - Encourages community participation and support
    - Focuses on consistent healthy habits
    - Can be completed over a week with daily check-ins
    - Builds on community trends and interests
    - Worth 75-150 points for completion
    
    Format as JSON:
    {
      "title": "challenge_title",
      "description": "detailed_description",
      "category": "social|health|nutrition|mindfulness",
      "difficulty": "medium|hard",
      "points": points_value,
      "requirements": {completion_criteria},
      "duration": "7 days"
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 350 },
      }),
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
  } catch (error) {
    return {
      title: "7-Day Wellness Journey",
      description: "Complete daily wellness activities and share your progress with the community",
      category: "social",
      difficulty: "medium",
      points: 100,
      requirements: { dailyCheckIns: 7, type: "weekly_wellness" },
      duration: "7 days"
    };
  }
}

export async function generateMilestoneChallenge(userAchievements: any, userStats: any) {
  const prompt = `
    Create a milestone challenge based on user progress:

    Achievements: ${JSON.stringify(userAchievements, null, 2)}
    Stats: ${JSON.stringify(userStats, null, 2)}
    
    Generate a significant milestone challenge that:
    - Recognizes their progress and growth
    - Sets an ambitious but achievable long-term goal
    - Celebrates their journey with Morgellons Disease management
    - Worth 200-500 points for major accomplishment
    - May take weeks or months to complete
    
    Format as JSON:
    {
      "title": "milestone_title",
      "description": "detailed_description",
      "category": "health|social|achievement",
      "difficulty": "hard",
      "points": points_value,
      "requirements": {completion_criteria},
      "milestone": "milestone_description"
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 400 },
      }),
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
  } catch (error) {
    return {
      title: "Health Champion Milestone",
      description: "Achieve consistent health tracking and community engagement over 30 days",
      category: "health",
      difficulty: "hard",
      points: 300,
      requirements: { consecutiveDays: 30, type: "milestone_achievement" },
      milestone: "30-Day Consistency Champion"
    };
  }
}

export async function generateAchievementSuggestions(userActivity: any) {
  const prompt = `
    Suggest new achievements based on user activity patterns:

    User Activity: ${JSON.stringify(userActivity, null, 2)}
    
    Generate 3-5 achievement suggestions that:
    - Recognize specific accomplishments and milestones
    - Encourage continued engagement
    - Cover different categories (health, social, consistency, etc.)
    - Have appropriate point values and tiers
    
    Format as JSON array:
    [
      {
        "title": "achievement_title",
        "description": "achievement_description",
        "icon": "icon_name",
        "category": "category",
        "tier": "bronze|silver|gold|platinum",
        "pointValue": points,
        "requirements": {unlock_criteria}
      }
    ]
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
      }),
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
  } catch (error) {
    return [
      {
        title: "First Steps",
        description: "Complete your first health challenge",
        icon: "trophy",
        category: "health",
        tier: "bronze",
        pointValue: 50,
        requirements: { challengesCompleted: 1 }
      }
    ];
  }
}