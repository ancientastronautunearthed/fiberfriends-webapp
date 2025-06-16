import { useEffect, useState } from "react";
import { checkDailySymptomLog } from "@/lib/firestore";
import { useFirebaseAuth } from "./useFirebaseAuth";

export function useDailySymptomCheck() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useFirebaseAuth();

  useEffect(() => {
    const checkSymptomLog = async () => {
      if (!user?.id) {
        setData({ needsSymptomLog: true, lastSubmission: null, today: new Date().toISOString().split('T')[0] });
        setIsLoading(false);
        return;
      }

      try {
        const result = await checkDailySymptomLog(user.id);
        setData(result);
      } catch (error) {
        console.error("Error checking daily symptom log:", error);
        // Set default fallback data instead of causing rejections
        setData({ needsSymptomLog: true, lastSubmission: null, today: new Date().toISOString().split('T')[0] });
      } finally {
        setIsLoading(false);
      }
    };

    // Only check if we have authentication data (or are not authenticated)
    if (isAuthenticated && user) {
      checkSymptomLog().catch((error) => {
        console.error("Async error in symptom check:", error);
        setData({ needsSymptomLog: true, lastSubmission: null, today: new Date().toISOString().split('T')[0] });
        setIsLoading(false);
      });
    } else if (!isAuthenticated) {
      // If not authenticated, don't require symptom log
      setData({ needsSymptomLog: false, lastSubmission: null, today: new Date().toISOString().split('T')[0] });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  return {
    needsSymptomLog: data?.needsSymptomLog ?? false,
    lastSubmission: data?.lastSubmission,
    today: data?.today,
    isLoading,
  };
}