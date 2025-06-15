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
    
    if (messageLower.includes('fiber') || messageLower.includes('filament') || messageLower.includes('thread')) {
      aiResponse = "I understand you're experiencing fibers or filaments - this is one of the hallmark symptoms of Morgellons Disease. Document these carefully with macro photography under natural lighting, and collect samples in clean glass containers. The fibers often contain cellulose, keratin, and collagen components. Use sterile tweezers for gentle removal and avoid aggressive picking which can create secondary infections. Many patients find that fibers increase during inflammatory flares. Have you noticed any patterns in when the fibers appear more frequently?";
    } else if (messageLower.includes('itch') || messageLower.includes('crawl') || messageLower.includes('sensation') || messageLower.includes('burning') || messageLower.includes('stinging')) {
      aiResponse = "The crawling, itching, and burning sensations are neurological manifestations of Morgellons Disease. These formication symptoms stem from nerve inflammation and mast cell activation. Cool compresses with colloidal silver or aloe can provide relief. Antihistamines like quercetin may help reduce mast cell degranulation. Avoid scratching as it triggers more inflammation. Many find relief with TENS units, meditation, and nervous system calming protocols. What time of day are these sensations most intense for you?";
    } else if (messageLower.includes('lesion') || messageLower.includes('sore') || messageLower.includes('wound') || messageLower.includes('healing')) {
      aiResponse = "Morgellons lesions heal slowly due to the underlying inflammatory process and biofilm formation. Keep wounds clean with antimicrobial solutions like diluted hydrogen peroxide or colloidal silver. Manuka honey has excellent healing properties for Morgellons lesions. Avoid petroleum-based products which can trap pathogens. Consider zinc supplementation for wound healing and vitamin C for collagen synthesis. Document lesion progression with photos for medical appointments. Are your lesions primarily on specific body areas?";
    } else if (messageLower.includes('doctor') || messageLower.includes('medical') || messageLower.includes('appointment') || messageLower.includes('physician')) {
      aiResponse = "Finding knowledgeable healthcare providers for Morgellons requires persistence. Bring comprehensive documentation: high-quality photos, fiber samples in sterile containers, detailed symptom logs, and timeline of progression. Seek practitioners familiar with complex infectious diseases, environmental medicine, or Lyme-literate doctors. The Charles E. Holman Morgellons Disease Foundation maintains a physician directory. Consider integrative or functional medicine practitioners who understand biofilm-based infections. Have you encountered medical dismissal, and how can I help you advocate for proper care?";
    } else if (messageLower.includes('diet') || messageLower.includes('food') || messageLower.includes('supplement') || messageLower.includes('nutrition')) {
      aiResponse = "Anti-inflammatory nutrition is fundamental for Morgellons management. Eliminate sugar, gluten, dairy, and processed foods which feed biofilms and increase inflammation. Focus on organic vegetables, wild-caught fish, grass-fed meats, and antioxidant-rich foods. Key supplements include vitamin C (bowel tolerance dosing), zinc, magnesium, B-complex, omega-3s, and biofilm disruptors like NAC or serrapeptase. Many benefit from antimicrobial herbs like oregano oil, berberine, or garlic extract. Work with a practitioner familiar with biofilm protocols. What dietary triggers have you identified?";
    } else if (messageLower.includes('stress') || messageLower.includes('anxiety') || messageLower.includes('depression') || messageLower.includes('mental') || messageLower.includes('emotional')) {
      aiResponse = "The psychological impact of Morgellons is profound and often underestimated. Chronic pain, medical gaslighting, and social isolation create significant trauma. Your emotional responses are completely normal given these extraordinary circumstances. Nervous system dysregulation is common in Morgellons, making stress management crucial. Consider trauma-informed therapy, EMDR, somatic experiencing, or neurofeedback. Vagal tone exercises, breathwork, and gentle movement help regulate the autonomic nervous system. Connect with Morgellons support groups for validation and understanding. How has this condition affected your relationships and daily functioning?";
    } else if (messageLower.includes('biofilm') || messageLower.includes('infection') || messageLower.includes('pathogen') || messageLower.includes('bacteria')) {
      aiResponse = "Morgellons appears to involve complex biofilm-forming pathogens that create protective matrices, making them resistant to standard treatments. Biofilm disruptors like N-acetylcysteine, lumbrokinase, serrapeptase, or EDTA can help break down these protective barriers. Antimicrobial protocols often include rotating herbal antimicrobials, silver-based treatments, or specialized antibiotics under medical supervision. The key is persistence and addressing biofilms systemically. Many practitioners use pulsed protocols to prevent resistance. Are you currently working with any biofilm-disrupting treatments?";
    } else if (messageLower.includes('fatigue') || messageLower.includes('energy') || messageLower.includes('tired') || messageLower.includes('exhausted')) {
      aiResponse = "Chronic fatigue in Morgellons results from systemic inflammation, mitochondrial dysfunction, and the energy demands of fighting persistent infections. Support mitochondrial function with CoQ10, PQQ, magnesium, and B-vitamins. Address adrenal fatigue with adaptogenic herbs like ashwagandha or rhodiola. Gentle movement like tai chi or yoga can help without overtaxing your system. Prioritize sleep hygiene and consider melatonin for its antioxidant properties. Pace yourself and practice energy conservation. How does your fatigue pattern relate to symptom flares?";
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