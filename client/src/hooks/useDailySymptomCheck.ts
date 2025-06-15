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
        setIsLoading(false);
        return;
      }

      try {
        const result = await checkDailySymptomLog(user.id);
        setData(result);
      } catch (error) {
        console.error("Error checking daily symptom log:", error);
        setData({ needsSymptomLog: true, lastSubmission: null, today: new Date().toISOString().split('T')[0] });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      checkSymptomLog();
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  return {
    needsSymptomLog: data?.needsSymptomLog ?? true,
    lastSubmission: data?.lastSubmission,
    today: data?.today,
    isLoading,
  };
}