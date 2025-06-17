// server/lunaGenerator.ts
import { 
  generateNutritionalAnalysis, 
  generateSymptomInsight, 
  generateCommunityPostAnalysis,
  generateAICompanionResponse,
  generateDailyChallenge,
  generatePersonalizedChallenge,
  generateWeeklyChallenge,
  generateMilestoneChallenge,
  generateAchievementSuggestions
} from "./genkit";

export interface LunaPersonality {
  tone: 'warm' | 'professional' | 'playful' | 'gentle' | 'energetic';
  style: 'supportive' | 'analytical' | 'motivational' | 'empathetic' | 'practical';
  personality: 'nurturing' | 'scientific' | 'encouraging' | 'calm' | 'enthusiastic';
  appearance: {
    hairColor: 'blonde' | 'brown' | 'black' | 'red' | 'silver' | 'blue';
    eyeColor: 'blue' | 'brown' | 'green' | 'hazel' | 'purple' | 'amber';
    style: 'professional' | 'casual' | 'artistic' | 'futuristic' | 'natural';
    outfit: 'lab_coat' | 'casual_wear' | 'business_attire' | 'artistic_clothing' | 'nature_inspired';
    environment: 'medical_office' | 'cozy_room' | 'garden' | 'tech_space' | 'peaceful_sanctuary';
  };
}

export interface GeneratedLuna {
  name: string;
  personality: LunaPersonality;
  imageUrl: string;
  description: string;
  communicationStyle: string;
  focusAreas: string[];
  greeting: string;
}

async function generateLunaImageInternal(personality: LunaPersonality): Promise<string> {
  try {
    // Create a detailed prompt based on user choices
    const prompt = createImagePrompt(personality);
    
    // For now, we'll use a placeholder image system since Gemini doesn't directly generate images
    // In a real implementation, this would call DALL-E or similar service
    const imageUrl = await generatePlaceholderImage(personality);
    
    return imageUrl;
  } catch (error) {
    console.error("Error generating Luna image:", error);
    // Return a default avatar if generation fails
    return "/api/avatars/default-luna.png";
  }
}

function createImagePrompt(personality: LunaPersonality): string {
  const { appearance, tone, style, personality: personalityType } = personality;
  
  return `Create a digital avatar of a friendly AI health companion named Luna. 
  
  Physical appearance:
  - Hair: ${appearance.hairColor} hair in a ${appearance.style} style
  - Eyes: ${appearance.eyeColor} eyes that convey ${tone} energy
  - Outfit: ${appearance.outfit.replace('_', ' ')} that looks ${appearance.style}
  - Environment: ${appearance.environment.replace('_', ' ')} background
  
  Personality expression:
  - Overall demeanor: ${personalityType} and ${style}
  - Facial expression: ${tone} and welcoming
  - Pose: confident yet approachable, suitable for a health companion
  
  Style: Digital art, clean, professional, warm lighting, friendly healthcare AI assistant, 
  high quality, detailed, suitable for a health app avatar.`;
}

async function generatePlaceholderImage(personality: LunaPersonality): Promise<string> {
  // Generate a unique avatar based on personality choices
  const { appearance } = personality;
  
  // Create a deterministic avatar URL based on choices
  const avatarSeed = `${appearance.hairColor}-${appearance.eyeColor}-${appearance.style}-${appearance.outfit}`;
  
  // Use a service like DiceBear or similar for consistent avatar generation
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=b6e3f4&clothingColor=65c5db&hairColor=${getHairColorCode(appearance.hairColor)}&eyeColor=${getEyeColorCode(appearance.eyeColor)}&style=circle`;
  
  return avatarUrl;
}

function getHairColorCode(hairColor: string): string {
  const colorMap: Record<string, string> = {
    'blonde': 'f59e0b',
    'brown': '92400e',
    'black': '1f2937',
    'red': 'dc2626',
    'silver': '9ca3af',
    'blue': '3b82f6'
  };
  return colorMap[hairColor] || '92400e';
}

function getEyeColorCode(eyeColor: string): string {
  const colorMap: Record<string, string> = {
    'blue': '3b82f6',
    'brown': '92400e',
    'green': '059669',
    'hazel': 'd97706',
    'purple': '7c3aed',
    'amber': 'f59e0b'
  };
  return colorMap[eyeColor] || '92400e';
}

export async function generateLunaImage(personality: LunaPersonality): Promise<string> {
  return generateLunaImageInternal(personality);
}

export async function generateLunaPersonality(choices: LunaPersonality): Promise<GeneratedLuna> {
  try {
    const imageUrl = await generateLunaImageInternal(choices);
    
    const personalityPrompt = `Based on these personality choices for Luna, an AI health companion for Morgellons disease patients:
    - Tone: ${choices.tone}
    - Style: ${choices.style}
    - Personality: ${choices.personality}
    
    Generate a detailed personality profile including:
    1. A welcoming greeting message
    2. Communication style description
    3. 3-5 focus areas for health support
    4. A brief personality description
    
    Format as JSON with keys: greeting, communicationStyle, focusAreas (array), description`;
    
    const personalityResponse = await generateAICompanionResponse(personalityPrompt, { conversationHistory: [], context: choices });
    
    let personalityData;
    try {
      personalityData = JSON.parse(personalityResponse);
    } catch {
      // Fallback if JSON parsing fails
      personalityData = createFallbackPersonality(choices);
    }
    
    return {
      name: "Luna",
      personality: choices,
      imageUrl,
      description: personalityData.description,
      communicationStyle: personalityData.communicationStyle,
      focusAreas: personalityData.focusAreas || [],
      greeting: personalityData.greeting
    };
  } catch (error) {
    console.error("Error generating Luna personality:", error);
    return createFallbackPersonality(choices);
  }
}

async function createFallbackPersonality(choices: LunaPersonality): Promise<GeneratedLuna> {
  const greetings: Record<string, string> = {
    warm: "Hello! I'm Luna, your caring health companion. I'm here to support you on your wellness journey with warmth and understanding.",
    professional: "Good day! I'm Luna, your dedicated health assistant. I'm here to provide you with evidence-based support and guidance.",
    playful: "Hey there! I'm Luna, your friendly health buddy! Let's make your wellness journey fun and engaging together!",
    gentle: "Hi, I'm Luna. I'm here to gently guide and support you through your health journey with patience and care.",
    energetic: "Hi! I'm Luna, your enthusiastic health companion! I'm excited to help you achieve your wellness goals!"
  };
  
  const imageUrl = await generateLunaImage(choices);
  
  return {
    name: "Luna",
    personality: choices,
    imageUrl,
    description: `A ${choices.personality} AI companion with a ${choices.tone} approach to health support.`,
    communicationStyle: `${choices.style} and ${choices.tone}`,
    focusAreas: ["Symptom tracking", "Emotional support", "Health education", "Lifestyle guidance"],
    greeting: greetings[choices.tone] || greetings.warm
  };
}