import { 
  getAiCompanion, 
  createAiCompanion, 
  updateAiCompanion,
  saveConversationMessage, 
  getConversationHistory as getFirestoreConversationHistory 
} from "./firestore";

// Firebase-based AI Companion functions
export async function generateAICompanionResponse(userMessage: string, context: any, userId: string) {
  try {
    // Get companion from Firestore
    let companion = await getAiCompanion(userId);
    if (!companion) {
      // Create default companion if none exists
      await createAiCompanion(userId, {
        name: "Luna",
        personality: {
          tone: "warm",
          style: "supportive", 
          personality: "nurturing"
        },
        greeting: "Hello! I'm Luna, your health companion. How are you feeling today?"
      });
      companion = await getAiCompanion(userId);
    }
    
    // Save user message to conversation history
    await saveConversationMessage(userId, userId, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });
    
    // Generate AI response (simplified for now)
    const aiResponse = `Hello! I'm Luna, your AI companion. I understand you said: "${userMessage}". How can I help you with your health journey today?`;
    
    // Save AI response to conversation history
    await saveConversationMessage(userId, userId, {
      type: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });
    
    return { content: aiResponse };
  } catch (error) {
    console.error('Error generating AI companion response:', error);
    throw error;
  }
}

export async function getAICompanionPersonality(userId: string) {
  try {
    const companion = await getAiCompanion(userId);
    return companion;
  } catch (error) {
    console.error('Error fetching AI companion personality:', error);
    throw error;
  }
}

export async function updateAICompanionPersonality(userId: string, updates: any) {
  try {
    await updateAiCompanion(userId, updates);
    return await getAiCompanion(userId);
  } catch (error) {
    console.error('Error updating AI companion personality:', error);
    throw error;
  }
}

export async function getConversationHistoryForUser(userId: string, limit: number = 50) {
  try {
    const messages = await getFirestoreConversationHistory(userId, userId, limit);
    return messages;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
}