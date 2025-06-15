import { apiRequest } from "./queryClient";

// Enhanced AI Companion API functions
export async function generateAICompanionResponse(userMessage: string, context: any) {
  try {
    const companion = await apiRequest("GET", "/api/ai-companion");
    if (!companion) {
      throw new Error("No AI companion found");
    }
    
    const response = await apiRequest("POST", `/api/ai-companion/${companion.id}/message`, {
      message: userMessage,
      context
    });
    return response;
  } catch (error) {
    console.error('Error generating AI companion response:', error);
    throw error;
  }
}

export async function getAICompanionPersonality(companionId: string) {
  try {
    const response = await apiRequest("GET", `/api/ai-companion`);
    return response;
  } catch (error) {
    console.error('Error fetching AI companion personality:', error);
    throw error;
  }
}

export async function updateAICompanionPersonality(companionId: string, updates: any) {
  try {
    const response = await apiRequest("PATCH", `/api/ai-companion/${companionId}`, updates);
    return response;
  } catch (error) {
    console.error('Error updating AI companion personality:', error);
    throw error;
  }
}

export async function getConversationHistory(companionId: string, limit: number = 50) {
  try {
    const response = await apiRequest("GET", `/api/ai-companion/${companionId}/conversation?limit=${limit}`);
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

export async function getHealthInsights(companionId?: string) {
  try {
    const url = companionId ? `/api/ai-companion/health-insights?companionId=${companionId}` : `/api/ai-companion/health-insights`;
    const response = await apiRequest("GET", url);
    return response;
  } catch (error) {
    console.error('Error fetching health insights:', error);
    throw error;
  }
}

export async function createHealthInsight(insight: any) {
  try {
    const response = await apiRequest("POST", "/api/ai-companion/health-insights", insight);
    return response;
  } catch (error) {
    console.error('Error creating health insight:', error);
    throw error;
  }
}

export async function dismissHealthInsight(insightId: string) {
  try {
    const response = await apiRequest("PATCH", `/api/ai-companion/health-insights/${insightId}/dismiss`);
    return response;
  } catch (error) {
    console.error('Error dismissing health insight:', error);
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