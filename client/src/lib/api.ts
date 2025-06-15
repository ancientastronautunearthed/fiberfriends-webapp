import { apiRequest } from "./queryClient";

// AI Companion API functions
export async function generateAICompanionResponse(userMessage: string, context: any) {
  try {
    const response = await apiRequest("POST", "/api/ai-companion/chat", {
      message: userMessage,
      context
    });
    return response.response;
  } catch (error) {
    console.error('Error generating AI companion response:', error);
    throw error;
  }
}

export async function getAICompanionPersonality(userId: string) {
  try {
    const response = await apiRequest("GET", `/api/ai-companion/personality/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching AI companion personality:', error);
    throw error;
  }
}

export async function updateAICompanionPersonality(userId: string, personality: any) {
  try {
    const response = await apiRequest("PUT", `/api/ai-companion/personality/${userId}`, personality);
    return response;
  } catch (error) {
    console.error('Error updating AI companion personality:', error);
    throw error;
  }
}

export async function getConversationHistory(userId: string, limit: number = 50) {
  try {
    const response = await apiRequest("GET", `/api/ai-companion/history/${userId}?limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
}

export async function saveConversationMessage(userId: string, message: any) {
  try {
    const response = await apiRequest("POST", "/api/ai-companion/save-message", {
      userId,
      ...message
    });
    return response;
  } catch (error) {
    console.error('Error saving conversation message:', error);
    throw error;
  }
}

export async function generateHealthInsights(userId: string) {
  try {
    const response = await apiRequest("GET", `/api/ai-companion/insights/${userId}`);
    return response;
  } catch (error) {
    console.error('Error generating health insights:', error);
    throw error;
  }
}