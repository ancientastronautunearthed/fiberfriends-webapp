// Fix for server/genkit.ts template literal issues
// Replace the problematic sections around lines 381-397 with these explicit string constructions

// Helper function to build user context strings safely
function buildUserContextString(userContext: any, safetyContext: string, memoryContext: any, userMessage: string): string {
  // Break down complex template literals into simpler parts
  const childrenInfo = userContext.hasChildren 
    ? `Yes (${userContext.childrenCount || 'unspecified'} children${userContext.childrenAges ? `, ages: ${userContext.childrenAges}` : ''})`
    : 'No';
  
  const siblingsInfo = userContext.hasSiblings 
    ? `Yes (${userContext.siblingsCount || 'unspecified'} siblings)` 
    : 'No';
  
  const smokingInfo = userContext.habits?.smoking 
    ? `Yes${userContext.smokingDuration ? ` (Duration: ${userContext.smokingDuration}, Frequency: ${userContext.smokingFrequency})` : ''}`
    : 'No';
  
  const alcoholInfo = userContext.habits?.alcohol 
    ? `Yes${userContext.alcoholDuration ? ` (Duration: ${userContext.alcoholDuration}, Frequency: ${userContext.alcoholFrequency})` : ''}`
    : 'No';

  // Build the context string with explicit string concatenation
  const contextString = `
    You are Luna, an advanced AI health companion with deep expertise in Morgellons disease.

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
    - Smoking: ${smokingInfo}
    - Alcohol: ${alcoholInfo}
    ${safetyContext}
    - Exercise Frequency: ${userContext.habits?.exercise || 'Not specified'}
    - Hobbies: ${userContext.hobbies || 'Not specified'}
    
    PERSONAL & FAMILY INFORMATION:
    - Relationship Status: ${userContext.relationshipStatus || 'Not specified'}
    - Children: ${childrenInfo}
    - Siblings: ${siblingsInfo}
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
    - Use the comprehensive health profile to provide PERSONALIZED recommendations
    - Provide specific, actionable strategies based on Morgellons research
    - Never minimize symptoms or suggest they are psychological in nature
    - Provide hope while being realistic about the chronic nature of the condition
    
    Respond as Luna with deep Morgellons expertise.
    Keep response between 120-250 words.
  ` as string; // Explicit type assertion to help TypeScript

  return contextString;
}

// Use this function instead of the complex template literal:
// const prompt = buildUserContextString(userContext, safetyContext, memoryContext, userMessage);

export { buildUserContextString };