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
    // Get companion from Firestore or demo mode
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
        greeting: "Hello! I'm Luna, your health companion specialized in Morgellons disease support. How are you feeling today?",
        conversationStyle: "supportive",
        focusAreas: ["symptom management", "emotional support", "Morgellons expertise"]
      });
      companion = await getAiCompanion(userId);
    }
    
    // Save user message to conversation history
    await saveConversationMessage(userId, userId, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });
    
    // Generate context-aware AI response with Morgellons expertise
    const messageLower = userMessage.toLowerCase();
    let aiResponse = "";
    
    if (messageLower.includes('fiber') || messageLower.includes('filament')) {
      aiResponse = "I understand you're experiencing fibers or filaments. Many Morgellons patients find it helpful to document these with clear photography under good lighting, and collect samples in clean containers. The fibers often contain cellulose and protein components. Consider gentle removal with tweezers rather than aggressive picking, which can worsen lesions. How long have you been noticing these fibers?";
    } else if (messageLower.includes('itch') || messageLower.includes('crawl') || messageLower.includes('sensation')) {
      aiResponse = "The crawling and itching sensations are very real symptoms of Morgellons. Anti-inflammatory approaches often help - consider cold compresses, colloidal oatmeal baths, and avoiding known triggers. Many find relief with magnesium supplementation and stress reduction techniques. The sensations often correlate with inflammation levels. What seems to trigger these sensations for you?";
    } else if (messageLower.includes('doctor') || messageLower.includes('medical') || messageLower.includes('appointment')) {
      aiResponse = "Finding knowledgeable healthcare providers for Morgellons can be challenging. Consider bringing documented evidence - photos, fiber samples, symptom logs. Look for practitioners familiar with Lyme disease, environmental medicine, or functional medicine. The Charles E. Holman Morgellons Disease Foundation maintains resources for finding informed doctors. Have you been able to find supportive medical care?";
    } else if (messageLower.includes('diet') || messageLower.includes('food') || messageLower.includes('supplement')) {
      aiResponse = "Anti-inflammatory nutrition is crucial for Morgellons management. Focus on eliminating sugar, processed foods, and common allergens. Many benefit from antioxidant-rich foods, omega-3 fatty acids, and targeted supplements like vitamin C, zinc, and B-complex vitamins. Consider working with a practitioner familiar with detoxification protocols. What dietary changes have you tried so far?";
    } else if (messageLower.includes('stress') || messageLower.includes('anxiety') || messageLower.includes('depression')) {
      aiResponse = "The emotional impact of Morgellons is significant, and your feelings are completely valid. Chronic symptoms, medical dismissal, and social isolation can take a real toll. Stress management through meditation, gentle exercise, and connecting with understanding support groups can help. The nervous system dysregulation often seen in Morgellons responds well to calming practices. How are you coping emotionally right now?";
    } else {
      aiResponse = `Hello! I'm Luna, your AI companion specialized in Morgellons disease support. I understand you said: "${userMessage}". This complex condition affects multiple body systems, and your symptoms are real and valid. Many find improvement through comprehensive approaches including inflammation reduction, detoxification support, and immune system optimization. How can I best support you on your health journey today?`;
    }
    
    // Save AI response to conversation history
    await saveConversationMessage(userId, userId, {
      type: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });
    
    return { 
      content: aiResponse,
      response: aiResponse,
      responseType: "supportive",
      sentiment: "validating",
      confidence: 0.9
    };
  } catch (error) {
    console.error('Error generating AI companion response:', error);
    
    // Fallback response for any errors
    const fallbackResponse = "I understand you're reaching out for support with your health journey. While I'm experiencing some technical difficulties right now, I want you to know that your symptoms are real and valid. Morgellons is a complex condition that requires comprehensive care. Please continue tracking your symptoms and seeking knowledgeable healthcare providers. How can I help you today?";
    
    return { 
      content: fallbackResponse,
      response: fallbackResponse,
      responseType: "supportive",
      sentiment: "validating",
      confidence: 0.8
    };
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