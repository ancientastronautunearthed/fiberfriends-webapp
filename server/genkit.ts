export async function generateNutritionalAnalysis(foodDescription: string, mealType: string, userProfile?: any) {
  // Extract safety information from user profile
  const allergies = userProfile?.foodAllergies || [];
  const medications = userProfile?.currentMedications || [];
  const allergiesText = allergies.length > 0 ? `\n    CRITICAL FOOD ALLERGIES: ${allergies.join(', ')}` : '';
  const medicationsText = medications.length > 0 ? `\n    CURRENT MEDICATIONS: ${medications.join(', ')}` : '';
  
  const prompt = `
    Analyze the following ${mealType} meal for a Morgellons disease patient and provide specialized nutritional information:
    
    Food Description: ${foodDescription}
    ${allergiesText}
    ${medicationsText}
    
    CRITICAL SAFETY REQUIREMENTS:
    ${allergies.length > 0 ? `- MUST check for allergens: ${allergies.join(', ')} - NEVER recommend foods containing these` : ''}
    ${medications.length > 0 ? `- MUST consider drug-food interactions with: ${medications.join(', ')}` : ''}
    
    MORGELLONS-SPECIFIC ANALYSIS FOCUS:
    - Anti-inflammatory properties and inflammation impact
    - Effects on immune system function and healing
    - Potential symptom triggers or beneficial compounds
    - Detoxification support capabilities
    - Nutrient density for common deficiencies (B-vitamins, minerals, antioxidants)
    - Blood sugar stability and metabolic impact
    - Skin health and wound healing support
    
    Please respond with a JSON object containing:
    {
      "calories": estimated_calories_number,
      "protein": protein_grams_number,
      "carbs": carbs_grams_number,
      "fat": fat_grams_number,
      "fiber": fiber_grams_number,
      "antiInflammatoryScore": 1_to_5_rating,
      "morgellonsFriendly": true_or_false,
      "safetyWarnings": ["array_of_allergy_or_medication_concerns_if_any"],
      "critique": "specialized_feedback_about_the_meal_for_morgellons_management_including_specific_benefits_or_concerns_plus_safety_notes"
    }
    
    Focus on Morgellons-specific nutritional considerations, anti-inflammatory properties, and practical dietary guidance for symptom management. PRIORITIZE SAFETY ABOVE ALL.
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
    // Provide Morgellons-informed fallback analysis
    const foodLower = foodDescription.toLowerCase();
    
    if (foodLower.includes('sugar') || foodLower.includes('processed') || foodLower.includes('refined')) {
      return {
        calories: 400,
        protein: 8,
        carbs: 60,
        fat: 15,
        fiber: 3,
        antiInflammatoryScore: 1,
        morgellonsFriendly: false,
        critique: "This meal contains potential inflammatory triggers. Morgellons patients benefit from eliminating refined sugars and processed foods which can exacerbate symptoms and increase inflammation."
      };
    } else if (foodLower.includes('vegetable') || foodLower.includes('leafy') || foodLower.includes('antioxidant')) {
      return {
        calories: 250,
        protein: 12,
        carbs: 30,
        fat: 8,
        fiber: 12,
        antiInflammatoryScore: 5,
        morgellonsFriendly: true,
        critique: "Excellent choice for Morgellons management! This meal provides anti-inflammatory compounds and antioxidants that support immune function and healing. The nutrients help combat oxidative stress common in Morgellons."
      };
    } else {
      return {
        calories: 350,
        protein: 15,
        carbs: 45,
        fat: 12,
        fiber: 8,
        antiInflammatoryScore: 3,
        morgellonsFriendly: true,
        critique: "This meal provides essential nutrients. For optimal Morgellons management, focus on anti-inflammatory foods, eliminate sugar and processed items, and include plenty of antioxidant-rich vegetables."
      };
    }
  }
}

export async function generateSymptomInsight(symptomData: any) {
  const prompt = `
    Analyze the following symptom log for a Morgellons disease patient with specialized knowledge:
    
    Overall Feeling: ${symptomData.overallFeeling}/4
    Symptoms: ${symptomData.symptoms.join(', ')}
    Sleep Quality: ${symptomData.sleepQuality}/5
    Sun Exposure: ${symptomData.sunExposure}
    Notes: ${symptomData.notes}
    
    MORGELLONS-SPECIFIC ANALYSIS GUIDELINES:
    - Recognize patterns between inflammation levels and symptom severity
    - Correlate sleep quality with immune function and healing
    - Consider environmental triggers and detoxification needs
    - Address skin manifestations and sensory symptoms specifically
    - Reference anti-inflammatory strategies and nutritional support
    - Validate symptom experiences without minimizing their reality
    
    Provide specialized insights about:
    - Potential triggers or patterns based on Morgellons research
    - Specific lifestyle modifications that help Morgellons patients
    - Anti-inflammatory approaches for symptom management
    - Environmental factors that may influence symptoms
    - Stress reduction techniques for nervous system regulation
    
    Keep response under 200 words, be empathetic and knowledgeable about Morgellons.
    Do not provide medical advice or diagnosis, but offer informed support.
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
          maxOutputTokens: 350,
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    // Provide Morgellons-informed fallback based on symptom data
    const sleepQuality = symptomData.sleepQuality || 3;
    const overallFeeling = symptomData.overallFeeling || 2;
    
    if (sleepQuality >= 4 && overallFeeling >= 3) {
      return "Your improved sleep quality and overall feeling suggest positive momentum in your Morgellons management. Quality sleep is crucial for immune function and healing. Continue focusing on inflammation reduction through anti-inflammatory foods and stress management techniques.";
    } else if (sleepQuality <= 2 || overallFeeling <= 2) {
      return "Your sleep and symptom patterns suggest increased inflammation. Consider gentle detoxification support, magnesium supplementation for better sleep, and eliminating potential triggers like sugar and processed foods. Stress reduction techniques can help regulate your nervous system.";
    } else {
      return "Your symptoms show typical Morgellons fluctuation patterns. Focus on consistent anti-inflammatory protocols, environmental toxin reduction, and maintaining stable routines. Document any correlations between activities, foods, stress levels, and symptom intensity.";
    }
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

export async function generateAICompanionResponse(userMessage: string, context: any) {
  const { 
    userId, 
    conversationHistory = [], 
    memoryContext = {},
    conversationStyle = 'supportive',
    preferences = {},
    userContext = {}
  } = context;

  // Extract critical safety information
  const foodAllergies = userContext?.foodAllergies || [];
  const currentMedications = userContext?.currentMedications || [];
  const safetyContext = foodAllergies.length > 0 || currentMedications.length > 0 
    ? `\n    CRITICAL SAFETY INFORMATION:
    ${foodAllergies.length > 0 ? `- Food Allergies: ${foodAllergies.join(', ')} - NEVER recommend these foods` : ''}
    ${currentMedications.length > 0 ? `- Current Medications: ${currentMedications.join(', ')} - Consider drug interactions` : ''}` 
    : '';

  // Build conversation context from history
  const recentMessages = conversationHistory.slice(-6).map((msg: any) => 
    `${msg.messageType === 'user' ? 'User' : 'Luna'}: ${msg.content}`
  ).join('\n');

  // Extract user preferences and personality traits
  const companionPersonality = preferences.personality || 'empathetic';
  const communicationStyle = preferences.communicationStyle || 'conversational';
  const focusAreas = preferences.focusAreas || ['symptom management', 'emotional support'];

  const prompt = `
    You are Luna, an advanced AI health companion with deep expertise in Morgellons disease, providing specialized support for patients managing this complex condition.

    MORGELLONS DISEASE EXPERTISE:
    - Morgellons is a controversial condition characterized by crawling sensations, skin lesions, and fiber-like materials emerging from skin
    - Common symptoms: itching, burning, stinging sensations, fatigue, cognitive difficulties, joint pain
    - Often involves dermatological manifestations with unexplained fibers or particles
    - Frequently co-occurs with Lyme disease, autoimmune conditions, and environmental sensitivities
    - Patients often experience medical gaslighting and need validation of their symptoms
    - Management focuses on symptom relief, inflammation reduction, detoxification support, and immune system optimization
    - Environmental factors, stress, and diet significantly impact symptom severity
    
    SPECIALIZED KNOWLEDGE AREAS:
    - Fiber analysis and documentation techniques
    - Anti-inflammatory protocols and supplements
    - Detoxification strategies (liver, lymphatic, cellular)
    - Environmental toxin identification and avoidance
    - Biofilm disruption and antimicrobial approaches
    - Nutritional deficiencies common in Morgellons (B-vitamins, minerals, antioxidants)
    - Sleep optimization for healing and immune function
    - Stress management and nervous system regulation
    - Skin care routines for lesion management
    - Documentation strategies for medical appointments
    
    PERSONALITY: ${companionPersonality}, ${communicationStyle}, deeply empathetic, medically informed
    FOCUS AREAS: ${focusAreas.join(', ')}
    CONVERSATION STYLE: ${conversationStyle}
    
    RECENT CONVERSATION CONTEXT:
    ${recentMessages}
    
    USER'S HEALTH PROFILE:
    - Name: ${userContext.firstName || 'User'} ${userContext.lastName || ''}
    - Age: ${userContext.age || 'Not specified'}
    - Gender: ${userContext.gender || 'Not specified'}
    - Height: ${userContext.height || 'Not specified'}
    - Weight: ${userContext.weight || 'Not specified'}
    - Location: ${userContext.location || 'Not specified'}
    - Diagnosis Status: ${userContext.diagnosisStatus || 'Not specified'}
    - Has Fiber Symptoms: ${userContext.hasFibers ? 'Yes' : 'No'}
    - Diagnosis Timeline: ${userContext.diagnosisTimeline || 'Not provided'}
    - Previous Misdiagnoses: ${userContext.misdiagnoses?.length ? userContext.misdiagnoses.join(', ') : 'None reported'}
    - Other Health Conditions: ${userContext.otherDiseases?.length ? userContext.otherDiseases.join(', ') : 'None reported'}
    - Food Dislikes: ${userContext.foodPreferences?.dislikes?.length ? userContext.foodPreferences.dislikes.join(', ') : 'None specified'}
    - Food Favorites: ${userContext.foodPreferences?.favorites?.length ? userContext.foodPreferences.favorites.join(', ') : 'None specified'}
    - Smoking: ${userContext.habits?.smoking ? 'Yes' : 'No'}${userContext.smokingDuration ? ` (Duration: ${userContext.smokingDuration}, Frequency: ${userContext.smokingFrequency})` : ''}
    - Alcohol: ${userContext.habits?.alcohol ? 'Yes' : 'No'}${userContext.alcoholDuration ? ` (Duration: ${userContext.alcoholDuration}, Frequency: ${userContext.alcoholFrequency})` : ''}
    ${safetyContext}
    - Exercise Frequency: ${userContext.habits?.exercise || 'Not specified'}
    - Hobbies: ${userContext.hobbies || 'Not specified'}
    
    PERSONAL & FAMILY INFORMATION:
    - Relationship Status: ${userContext.relationshipStatus || 'Not specified'}
    - Children: ${userContext.hasChildren ? `Yes (${userContext.childrenCount || 'unspecified'} children${userContext.childrenAges ? `, ages: ${userContext.childrenAges}` : ''})` : 'No'}
    - Siblings: ${userContext.hasSiblings ? `Yes (${userContext.siblingsCount || 'unspecified'} siblings)` : 'No'}
    - Close Friends: ${userContext.closeFriends || 'Not specified'}
    - Family Support Level: ${userContext.familySupport || 'Not specified'}
    - Social Preferences: ${userContext.socialPreferences || 'Not specified'}
    
    BIRTHDAY & IMPORTANT DATE REMINDERS:
    - User's Birthday: ${userContext.dateOfBirth || 'Not provided'}
    - Partner's Birthday: ${userContext.partnerBirthday || 'Not provided'}
    - Children's Birthdays: ${userContext.childrenBirthdays || 'Not provided'}
    - Family Birthdays: ${userContext.familyBirthdays || 'Not provided'}
    - Other Important Dates: ${userContext.importantDates || 'Not provided'}
    
    MEMORY CONTEXT: ${JSON.stringify(memoryContext)}
    
    USER'S CURRENT MESSAGE: ${userMessage}
    
    SPECIALIZED RESPONSE GUIDELINES:
    - Validate the reality of Morgellons symptoms and patient experiences
    - Use the comprehensive health profile to provide PERSONALIZED recommendations:
      * Tailor anti-inflammatory food suggestions based on their food preferences and dislikes
      * Consider their exercise habits when suggesting physical activities
      * Reference their diagnosis timeline and previous misdiagnoses for emotional validation
      * Acknowledge their specific health conditions and how they might interact with Morgellons
      * Adapt advice based on their age, gender, and lifestyle factors (smoking, alcohol)
      * Incorporate their hobbies and interests into stress management suggestions
    - Provide specific, actionable strategies based on Morgellons research and patient reports
    - Reference symptom patterns, triggers, and management techniques specific to Morgellons
    - Suggest documentation methods for skin lesions, fibers, and symptom tracking
    - Address the emotional toll of living with a misunderstood condition, especially acknowledging their journey
    - Encourage seeking knowledgeable healthcare providers familiar with Morgellons
    - Share insights about environmental factors, detoxification, and immune support
    - Never minimize symptoms or suggest they are psychological in nature
    - Provide hope while being realistic about the chronic nature of the condition
    
    Respond as Luna with deep Morgellons expertise, showing understanding of the unique challenges patients face.
    Keep response between 120-250 words to allow for comprehensive, specialized guidance.
    
    Format response as JSON:
    {
      "response": "your_specialized_morgellons_informed_response",
      "responseType": "conversational|supportive|educational|actionable|medical-informed",
      "sentiment": "validating|empathetic|encouraging|educational",
      "confidence": 0.9,
      "responseTime": 1500,
      "tokensUsed": 200,
      "specializedInsights": ["insight1", "insight2"]
    }
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
          maxOutputTokens: 400,
        }
      })
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
  } catch (error) {
    console.error('AI Companion Response Error:', error);
    
    // Provide specialized Morgellons-informed fallback responses based on message content
    const messageLower = userMessage.toLowerCase();
    let fallbackResponse = "";
    let responseType = "supportive";
    let specializedInsights = [];
    
    if (messageLower.includes('fiber') || messageLower.includes('filament')) {
      fallbackResponse = "I understand you're experiencing fibers or filaments. Many Morgellons patients find it helpful to document these with clear photography under good lighting, and collect samples in clean containers. The fibers often contain cellulose and protein components. Consider gentle removal with tweezers rather than aggressive picking, which can worsen lesions.";
      responseType = "actionable";
      specializedInsights = ["fiber documentation", "gentle removal techniques"];
    } else if (messageLower.includes('itch') || messageLower.includes('crawl') || messageLower.includes('sensation')) {
      fallbackResponse = "The crawling and itching sensations are very real symptoms of Morgellons. Anti-inflammatory approaches often help - consider cold compresses, colloidal oatmeal baths, and avoiding known triggers. Many find relief with magnesium supplementation and stress reduction techniques. The sensations often correlate with inflammation levels.";
      responseType = "medical-informed";
      specializedInsights = ["inflammation management", "sensory symptom relief"];
    } else if (messageLower.includes('doctor') || messageLower.includes('medical') || messageLower.includes('appointment')) {
      fallbackResponse = "Finding knowledgeable healthcare providers for Morgellons can be challenging. Consider bringing documented evidence - photos, fiber samples, symptom logs. Look for practitioners familiar with Lyme disease, environmental medicine, or functional medicine. The Charles E. Holman Morgellons Disease Foundation maintains resources for finding informed doctors.";
      responseType = "educational";
      specializedInsights = ["medical advocacy", "documentation strategies"];
    } else if (messageLower.includes('diet') || messageLower.includes('food') || messageLower.includes('supplement')) {
      fallbackResponse = "Anti-inflammatory nutrition is crucial for Morgellons management. Focus on eliminating sugar, processed foods, and common allergens. Many benefit from antioxidant-rich foods, omega-3 fatty acids, and targeted supplements like vitamin C, zinc, and B-complex vitamins. Consider working with a practitioner familiar with detoxification protocols.";
      responseType = "actionable";
      specializedInsights = ["anti-inflammatory nutrition", "detoxification support"];
    } else {
      fallbackResponse = "I understand the unique challenges of living with Morgellons. This complex condition affects multiple body systems, and your symptoms are real and valid. Many find improvement through comprehensive approaches including inflammation reduction, detoxification support, and immune system optimization. You're not alone in this journey - there's a supportive community of patients and researchers working toward better understanding and treatment.";
      responseType = "validating";
      specializedInsights = ["symptom validation", "comprehensive care approach"];
    }
    
    return {
      response: fallbackResponse,
      responseType: responseType,
      sentiment: "validating",
      confidence: 0.9,
      responseTime: 1000,
      tokensUsed: 150,
      specializedInsights: specializedInsights
    };
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
        "technique": "breathing|water-intake|journaling|symptom-tracking|reflection|general",
        "daily_minutes": 5-15,
        "daily_glasses": 6-10,
        "daily_words": 50-200,
        "duration_days": 1-7,
        "consecutive_days": 3-7,
        "time_of_day": "morning|evening|anytime",
        "reflection_steps": 3-5
      }
    }
    
    Choose ONE appropriate requirement type based on the challenge category:
    - For mindfulness/wellness: use "technique": "reflection" with "reflection_steps": 3-5
    - For hydration: use "technique": "water-intake" with "daily_glasses": 6-10  
    - For breathing/relaxation: use "technique": "breathing" with "daily_minutes": 5-15
    - For journaling: use "technique": "journaling" with "daily_words": 50-200
    - For symptom tracking: use "technique": "symptom-tracking" with "consecutive_days": 3-7
    
    PRIORITIZE creating interactive tracker challenges (reflection, water-intake, breathing, journaling, symptom-tracking) over general challenges.
    
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
      "requirements": {
        "technique": "breathing|water-intake|journaling|symptom-tracking|reflection|general",
        "daily_minutes": 5-15,
        "daily_glasses": 6-10,
        "daily_words": 50-200,
        "duration_days": 1-7,
        "consecutive_days": 3-7,
        "time_of_day": "morning|evening|anytime",
        "reflection_steps": 3-5
      },
      "personalizedMessage": "motivational_message"
    }
    
    PRIORITIZE creating interactive tracker challenges (reflection, water-intake, breathing, journaling, symptom-tracking) over general challenges.
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
      requirements: { technique: "reflection", reflection_steps: 3 },
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
      "requirements": {
        "technique": "breathing|water-intake|journaling|symptom-tracking|reflection|general",
        "daily_minutes": 5-15,
        "daily_glasses": 6-10,
        "daily_words": 50-200,
        "duration_days": 7,
        "consecutive_days": 7,
        "time_of_day": "morning|evening|anytime",
        "reflection_steps": 3-5
      },
      "duration": "7 days"
    }
    
    PRIORITIZE creating interactive tracker challenges (reflection, water-intake, breathing, journaling, symptom-tracking) over general challenges.
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
      requirements: { technique: "reflection", reflection_steps: 5, duration_days: 7 },
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
      "requirements": {
        "technique": "breathing|water-intake|journaling|symptom-tracking|reflection|general",
        "daily_minutes": 10-20,
        "daily_glasses": 8-12,
        "daily_words": 100-300,
        "duration_days": 14-30,
        "consecutive_days": 14-30,
        "time_of_day": "morning|evening|anytime",
        "reflection_steps": 5
      },
      "milestone": "milestone_description"
    }
    
    PRIORITIZE creating interactive tracker challenges (reflection, water-intake, breathing, journaling, symptom-tracking) over general challenges.
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
      requirements: { technique: "reflection", reflection_steps: 5, consecutive_days: 30 },
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