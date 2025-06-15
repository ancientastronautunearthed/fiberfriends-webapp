import { useQuery } from "@tanstack/react-query";

export function useDailySymptomCheck() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/daily-symptom-check"],
    retry: false,
  });

  return {
    needsSymptomLog: data?.needsSymptomLog || false,
    lastSubmission: data?.lastSubmission,
    today: data?.today,
    isLoading
  };
}