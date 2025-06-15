import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// User Management
export const createUser = async (userId: string, userData: any) => {
  await setDoc(doc(db, "users", userId), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getUser = async (userId: string) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};

export const updateUser = async (userId: string, updates: any) => {
  await updateDoc(doc(db, "users", userId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Daily Symptom Logs
export const createDailySymptomLog = async (userId: string, symptomData: any) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Demo mode fallback
  if (localStorage.getItem('test-mode') === 'true') {
    const logData = {
      userId,
      entryDate: today,
      symptomData,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`dailySymptomLog_${userId}_${today}`, JSON.stringify(logData));
    return;
  }
  
  await setDoc(doc(db, "dailySymptomLogs", `${userId}_${today}`), {
    userId,
    entryDate: today,
    symptomData,
    createdAt: serverTimestamp()
  });
};

export const getDailySymptomLogs = async (userId: string) => {
  const q = query(
    collection(db, "dailySymptomLogs"), 
    where("userId", "==", userId),
    orderBy("entryDate", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const checkDailySymptomLog = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Demo mode fallback
  if (localStorage.getItem('test-mode') === 'true') {
    const logKey = `dailySymptomLog_${userId}_${today}`;
    const existingLog = localStorage.getItem(logKey);
    return {
      needsSymptomLog: !existingLog,
      lastSubmission: existingLog ? today : null,
      today
    };
  }
  
  const logDoc = await getDoc(doc(db, "dailySymptomLogs", `${userId}_${today}`));
  return {
    needsSymptomLog: !logDoc.exists(),
    lastSubmission: logDoc.exists() ? today : null,
    today
  };
};

// AI Companions
export const createAiCompanion = async (userId: string, companionData: any) => {
  // Demo mode fallback
  if (localStorage.getItem('test-mode') === 'true') {
    const companion = {
      id: userId,
      userId,
      ...companionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`aiCompanion_${userId}`, JSON.stringify(companion));
    return;
  }

  await setDoc(doc(db, "aiCompanions", userId), {
    userId,
    ...companionData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getAiCompanion = async (userId: string) => {
  // Demo mode fallback
  if (localStorage.getItem('test-mode') === 'true') {
    const companionData = localStorage.getItem(`aiCompanion_${userId}`);
    if (companionData) {
      return JSON.parse(companionData);
    }
    // Return default companion for demo mode
    return {
      id: userId,
      name: "Luna",
      personality: {
        tone: "warm",
        style: "supportive",
        personality: "nurturing"
      },
      greeting: "Hello! I'm Luna, your AI health companion specialized in Morgellons disease support. How are you feeling today?",
      conversationStyle: "supportive",
      focusAreas: ["symptom management", "emotional support", "Morgellons expertise"],
      createdAt: new Date().toISOString()
    };
  }

  const companionDoc = await getDoc(doc(db, "aiCompanions", userId));
  return companionDoc.exists() ? { id: companionDoc.id, ...companionDoc.data() } : null;
};

export const updateAiCompanion = async (userId: string, updates: any) => {
  await updateDoc(doc(db, "aiCompanions", userId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Conversation History
export const saveConversationMessage = async (userId: string, companionId: string, message: any) => {
  // Demo mode fallback
  if (localStorage.getItem('test-mode') === 'true') {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      id: messageId,
      userId,
      companionId,
      ...message,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`conversationMessage_${messageId}`, JSON.stringify(messageData));
    return;
  }

  await addDoc(collection(db, "conversationHistory"), {
    userId,
    companionId,
    ...message,
    createdAt: serverTimestamp()
  });
};

export const getConversationHistory = async (userId: string, companionId: string, limitCount = 50) => {
  // Demo mode fallback
  if (localStorage.getItem('test-mode') === 'true') {
    const messages = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('conversationMessage_')) {
        const messageData = JSON.parse(localStorage.getItem(key) || '{}');
        if (messageData.userId === userId && messageData.companionId === companionId) {
          messages.push(messageData);
        }
      }
    }
    return messages
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-limitCount);
  }

  const q = query(
    collection(db, "conversationHistory"),
    where("userId", "==", userId),
    where("companionId", "==", companionId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
};

// Health Insights
export const createHealthInsight = async (userId: string, insightData: any) => {
  await addDoc(collection(db, "aiHealthInsights"), {
    userId,
    ...insightData,
    createdAt: serverTimestamp()
  });
};

export const getHealthInsights = async (userId: string) => {
  const q = query(
    collection(db, "aiHealthInsights"),
    where("userId", "==", userId),
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Community Posts
export const createCommunityPost = async (userId: string, postData: any) => {
  await addDoc(collection(db, "communityPosts"), {
    authorId: userId,
    ...postData,
    likes: 0,
    replies: 0,
    createdAt: serverTimestamp()
  });
};

export const getCommunityPosts = async (category?: string) => {
  let q = query(
    collection(db, "communityPosts"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  
  if (category) {
    q = query(
      collection(db, "communityPosts"),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Challenges
export const createChallenge = async (challengeData: any) => {
  await addDoc(collection(db, "challenges"), {
    ...challengeData,
    createdAt: serverTimestamp()
  });
};

export const getChallenges = async (category?: string) => {
  let q = query(
    collection(db, "challenges"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );
  
  if (category) {
    q = query(
      collection(db, "challenges"),
      where("category", "==", category),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// User Challenges
export const startUserChallenge = async (userId: string, challengeId: string) => {
  await addDoc(collection(db, "userChallenges"), {
    userId,
    challengeId,
    status: "in-progress",
    progress: 0,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getUserChallenges = async (userId: string) => {
  const q = query(
    collection(db, "userChallenges"),
    where("userId", "==", userId),
    orderBy("startedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUserChallenge = async (challengeId: string, updates: any) => {
  await updateDoc(doc(db, "userChallenges", challengeId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Achievements
export const createAchievement = async (achievementData: any) => {
  await addDoc(collection(db, "achievements"), {
    ...achievementData,
    createdAt: serverTimestamp()
  });
};

export const getAchievements = async () => {
  const q = query(
    collection(db, "achievements"),
    orderBy("tier", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const unlockUserAchievement = async (userId: string, achievementId: string) => {
  await addDoc(collection(db, "userAchievements"), {
    userId,
    achievementId,
    unlockedAt: serverTimestamp()
  });
};

export const getUserAchievements = async (userId: string) => {
  const q = query(
    collection(db, "userAchievements"),
    where("userId", "==", userId),
    orderBy("unlockedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Points System
export const awardPoints = async (userId: string, activityType: string, points: number, description?: string) => {
  // Demo mode fallback
  if (localStorage.getItem('test-mode') === 'true') {
    const activityId = `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pointActivity = {
      id: activityId,
      userId,
      activityType,
      points,
      description: description || `Earned ${points} points for ${activityType}`,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`pointActivity_${activityId}`, JSON.stringify(pointActivity));
    
    // Update demo user points
    const testUser = JSON.parse(localStorage.getItem('test-user') || '{}');
    testUser.points = (testUser.points || 0) + points;
    testUser.totalPoints = (testUser.totalPoints || 0) + points;
    localStorage.setItem('test-user', JSON.stringify(testUser));
    return;
  }

  // Add point activity record
  await addDoc(collection(db, "pointActivities"), {
    userId,
    activityType,
    points,
    description: description || `Earned ${points} points for ${activityType}`,
    createdAt: serverTimestamp()
  });

  // Update user's total points
  const userDoc = await getDoc(doc(db, "users", userId));
  if (userDoc.exists()) {
    const currentPoints = userDoc.data().points || 0;
    await updateDoc(doc(db, "users", userId), {
      points: currentPoints + points,
      totalPoints: (userDoc.data().totalPoints || 0) + points,
      updatedAt: serverTimestamp()
    });
  }
};

export const getPointActivities = async (userId: string, limitCount = 20) => {
  const q = query(
    collection(db, "pointActivities"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Research Data (Anonymized)
export const submitAnonymizedResearchData = async (userId: string, researchData: any) => {
  // Demo mode fallback
  if (localStorage.getItem('test-mode') === 'true') {
    const researchId = `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const researchEntry = {
      id: researchId,
      userId,
      ...researchData,
      contributedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`researchData_${researchId}`, JSON.stringify(researchEntry));
    
    // Update demo user research status
    const testUser = JSON.parse(localStorage.getItem('test-user') || '{}');
    testUser.anonymizedDataContributed = true;
    testUser.communityInsightsAccess = true;
    testUser.lastResearchContribution = new Date().toISOString();
    localStorage.setItem('test-user', JSON.stringify(testUser));
    return;
  }

  await addDoc(collection(db, "anonymizedResearchData"), {
    userId,
    ...researchData,
    contributedAt: serverTimestamp()
  });
  
  // Update user's research contribution status
  await updateDoc(doc(db, "users", userId), {
    anonymizedDataContributed: true,
    communityInsightsAccess: true,
    lastResearchContribution: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getResearchContributionStatus = async (userId: string) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  const userData = userDoc.data();
  
  // Count daily logs as contributions
  const dailyLogs = await getDailySymptomLogs(userId);
  
  return {
    hasContributed: dailyLogs.length > 0,
    contributionCount: dailyLogs.length,
    totalDataPoints: dailyLogs.length * 7,
    qualityScore: Math.min(100, dailyLogs.length * 10),
    communityImpactScore: dailyLogs.length * 5,
    hasInsightsAccess: userData?.communityInsightsAccess || dailyLogs.length > 0,
    researchOptIn: userData?.researchDataOptIn !== false
  };
};

// Community Health Insights
export const getCommunityHealthInsights = async () => {
  // Return predefined insights for now
  return [
    {
      id: 'insight-1',
      insightType: 'trend',
      title: 'Sleep Quality Impact on Symptoms',
      description: 'Users with better sleep quality (7+ hours) report 32% fewer severe symptoms during flare-ups',
      dataPoints: {
        average_reduction: 32,
        sleep_threshold: 7,
        symptom_severity_scale: '1-10'
      },
      affectedPopulation: {
        age_ranges: ['26-35', '36-45'],
        sample_size: 156
      },
      confidenceLevel: 85,
      sampleSize: 156,
      priority: 'high',
      category: 'sleep',
      generatedAt: '2025-06-15T00:00:00Z'
    },
    {
      id: 'insight-2',
      insightType: 'correlation',
      title: 'Diet and Fiber Management',
      description: 'Eliminating processed foods correlates with 28% improvement in fiber-related symptoms within 2 weeks',
      dataPoints: {
        improvement_percentage: 28,
        timeframe_days: 14,
        foods_eliminated: ['processed_sugars', 'artificial_additives']
      },
      affectedPopulation: {
        dietary_adherence: 'high',
        location_regions: ['North America', 'Europe']
      },
      confidenceLevel: 78,
      sampleSize: 203,
      priority: 'medium',
      category: 'diet',
      generatedAt: '2025-06-14T00:00:00Z'
    },
    {
      id: 'insight-3',
      insightType: 'pattern',
      title: 'Weather Sensitivity Patterns',
      description: 'Humid weather (>70% humidity) increases symptom reports by 45% in 67% of contributors',
      dataPoints: {
        humidity_threshold: 70,
        symptom_increase: 45,
        affected_percentage: 67
      },
      affectedPopulation: {
        climate_zones: ['humid_subtropical', 'oceanic'],
        diagnosis_status: ['diagnosed', 'suspected']
      },
      confidenceLevel: 92,
      sampleSize: 389,
      priority: 'high',
      category: 'environment',
      generatedAt: '2025-06-13T00:00:00Z'
    }
  ];
};

// Real-time listeners
export const subscribeToConversation = (userId: string, companionId: string, callback: (messages: any[]) => void) => {
  const q = query(
    collection(db, "conversationHistory"),
    where("userId", "==", userId),
    where("companionId", "==", companionId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
    callback(messages);
  });
};