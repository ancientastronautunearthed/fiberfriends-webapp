// Complex symptom pattern matching and analytics
import { DailyLog, SymptomPattern, SymptomCorrelation } from "@shared/schema";

export interface SymptomData {
  symptom: string;
  severity: number;
  timestamp: Date;
  contextFactors?: string[];
}

export interface PatternAnalysis {
  patterns: SymptomPattern[];
  correlations: SymptomCorrelation[];
  insights: string[];
  recommendations: string[];
}

// Calculate correlation coefficient between two symptom time series
export function calculateCorrelation(symptom1Data: SymptomData[], symptom2Data: SymptomData[]): number {
  if (symptom1Data.length < 2 || symptom2Data.length < 2) return 0;

  // Align data by date and calculate correlation
  const alignedData: Array<{ s1: number; s2: number }> = [];
  
  symptom1Data.forEach(s1 => {
    const matchingS2 = symptom2Data.find(s2 => 
      Math.abs(s1.timestamp.getTime() - s2.timestamp.getTime()) < 24 * 60 * 60 * 1000 // within 24 hours
    );
    if (matchingS2) {
      alignedData.push({ s1: s1.severity, s2: matchingS2.severity });
    }
  });

  if (alignedData.length < 3) return 0;

  const n = alignedData.length;
  const sumX = alignedData.reduce((sum, d) => sum + d.s1, 0);
  const sumY = alignedData.reduce((sum, d) => sum + d.s2, 0);
  const sumXY = alignedData.reduce((sum, d) => sum + d.s1 * d.s2, 0);
  const sumX2 = alignedData.reduce((sum, d) => sum + d.s1 * d.s1, 0);
  const sumY2 = alignedData.reduce((sum, d) => sum + d.s2 * d.s2, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

// Detect cyclical patterns in symptom data
export function detectCyclicalPatterns(symptomData: SymptomData[]): Array<{
  period: number;
  confidence: number;
  description: string;
}> {
  if (symptomData.length < 14) return [];

  const patterns: Array<{ period: number; confidence: number; description: string }> = [];
  
  // Check for weekly patterns (7 days)
  const weeklyCorrelation = calculateWeeklyPattern(symptomData);
  if (weeklyCorrelation > 0.1) {
    patterns.push({
      period: 7,
      confidence: Math.round(weeklyCorrelation * 100),
      description: "Weekly pattern detected - symptoms tend to follow a 7-day cycle"
    });
  }

  // Check for monthly patterns (28-30 days)
  const monthlyCorrelation = calculateMonthlyPattern(symptomData);
  if (monthlyCorrelation > 0.1) {
    patterns.push({
      period: 28,
      confidence: Math.round(monthlyCorrelation * 100),
      description: "Monthly pattern detected - symptoms show cyclical behavior over 4 weeks"
    });
  }

  return patterns;
}

function calculateWeeklyPattern(data: SymptomData[]): number {
  const dayOfWeekSeverities: number[][] = Array(7).fill(null).map(() => []);
  
  data.forEach(d => {
    const dayOfWeek = d.timestamp.getDay();
    dayOfWeekSeverities[dayOfWeek].push(d.severity);
  });

  // Calculate variance across days of week
  const dayAverages = dayOfWeekSeverities.map(severities => 
    severities.length > 0 ? severities.reduce((sum, s) => sum + s, 0) / severities.length : 0
  );

  const overallAverage = dayAverages.reduce((sum, avg) => sum + avg, 0) / 7;
  const variance = dayAverages.reduce((sum, avg) => sum + Math.pow(avg - overallAverage, 2), 0) / 7;

  return Math.min(variance / 10, 1); // Normalize to 0-1 scale
}

function calculateMonthlyPattern(data: SymptomData[]): number {
  if (data.length < 60) return 0; // Need at least 2 months of data

  const weekOfMonthSeverities: number[][] = Array(4).fill(null).map(() => []);
  
  data.forEach(d => {
    const weekOfMonth = Math.floor((d.timestamp.getDate() - 1) / 7);
    if (weekOfMonth < 4) {
      weekOfMonthSeverities[weekOfMonth].push(d.severity);
    }
  });

  const weekAverages = weekOfMonthSeverities.map(severities => 
    severities.length > 0 ? severities.reduce((sum, s) => sum + s, 0) / severities.length : 0
  );

  const overallAverage = weekAverages.reduce((sum, avg) => sum + avg, 0) / 4;
  const variance = weekAverages.reduce((sum, avg) => sum + Math.pow(avg - overallAverage, 2), 0) / 4;

  return Math.min(variance / 8, 1);
}

// Detect trending patterns (increasing/decreasing over time)
export function detectTrends(symptomData: SymptomData[]): Array<{
  direction: 'improving' | 'worsening' | 'stable';
  confidence: number;
  description: string;
  slope: number;
}> {
  if (symptomData.length < 7) return [];

  // Sort by timestamp
  const sortedData = [...symptomData].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Calculate moving averages
  const windowSize = Math.min(7, Math.floor(sortedData.length / 3));
  const movingAverages: Array<{ timestamp: Date; average: number }> = [];

  for (let i = windowSize - 1; i < sortedData.length; i++) {
    const window = sortedData.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, d) => sum + d.severity, 0) / window.length;
    movingAverages.push({
      timestamp: sortedData[i].timestamp,
      average
    });
  }

  if (movingAverages.length < 3) return [];

  // Calculate linear regression slope
  const n = movingAverages.length;
  const xValues = movingAverages.map((_, index) => index);
  const yValues = movingAverages.map(ma => ma.average);

  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const confidence = Math.min(Math.abs(slope) * 20, 100); // Scale confidence

  let direction: 'improving' | 'worsening' | 'stable';
  let description: string;

  if (slope < -0.1) {
    direction = 'improving';
    description = `Symptoms showing improvement trend with ${Math.abs(slope).toFixed(2)} severity decrease per week`;
  } else if (slope > 0.1) {
    direction = 'worsening';
    description = `Symptoms showing worsening trend with ${slope.toFixed(2)} severity increase per week`;
  } else {
    direction = 'stable';
    description = 'Symptoms remaining relatively stable over time';
  }

  return [{
    direction,
    confidence,
    description,
    slope
  }];
}

// Identify potential triggers based on context factors
export function identifyTriggers(symptomData: SymptomData[]): Array<{
  trigger: string;
  correlation: number;
  occurrences: number;
  description: string;
}> {
  const triggerMap = new Map<string, { severities: number[]; occurrences: number }>();

  symptomData.forEach(d => {
    if (d.contextFactors) {
      d.contextFactors.forEach(factor => {
        if (!triggerMap.has(factor)) {
          triggerMap.set(factor, { severities: [], occurrences: 0 });
        }
        const data = triggerMap.get(factor)!;
        data.severities.push(d.severity);
        data.occurrences++;
      });
    }
  });

  // Calculate baseline severity
  const baselineSeverity = symptomData.reduce((sum, d) => sum + d.severity, 0) / symptomData.length;

  const triggers: Array<{
    trigger: string;
    correlation: number;
    occurrences: number;
    description: string;
  }> = [];

  triggerMap.forEach((data, trigger) => {
    if (data.occurrences >= 2) { // Need at least 2 occurrences
      const avgSeverityWithTrigger = data.severities.reduce((sum, s) => sum + s, 0) / data.severities.length;
      const correlation = (avgSeverityWithTrigger - baselineSeverity) / 10; // Normalize to -1 to 1

      if (Math.abs(correlation) > 0.05) { // Significant correlation
        triggers.push({
          trigger,
          correlation,
          occurrences: data.occurrences,
          description: correlation > 0 
            ? `${trigger} appears to worsen symptoms (${Math.abs(correlation * 100).toFixed(0)}% increase)`
            : `${trigger} appears to improve symptoms (${Math.abs(correlation * 100).toFixed(0)}% decrease)`
        });
      }
    }
  });

  return triggers.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

// Generate AI-powered insights using Gemini
export async function generatePatternInsights(
  patterns: ReturnType<typeof detectCyclicalPatterns>,
  trends: ReturnType<typeof detectTrends>,
  triggers: ReturnType<typeof identifyTriggers>,
  correlations: SymptomCorrelation[]
): Promise<string[]> {
  const insights: string[] = [];

  // Pattern-based insights
  patterns.forEach(pattern => {
    if (pattern.confidence > 70) {
      insights.push(`Strong ${pattern.period}-day cyclical pattern detected with ${pattern.confidence}% confidence. Consider tracking additional factors during these cycles.`);
    }
  });

  // Trend-based insights
  trends.forEach(trend => {
    if (trend.confidence > 60) {
      if (trend.direction === 'improving') {
        insights.push(`Positive trend detected: symptoms improving by ${Math.abs(trend.slope).toFixed(1)} points per week. Continue current management strategies.`);
      } else if (trend.direction === 'worsening') {
        insights.push(`Concerning trend: symptoms worsening by ${trend.slope.toFixed(1)} points per week. Consider consulting healthcare provider.`);
      }
    }
  });

  // Trigger insights
  triggers.slice(0, 3).forEach(trigger => {
    if (Math.abs(trigger.correlation) > 0.3) {
      insights.push(`High correlation found: ${trigger.description}. Observed in ${trigger.occurrences} instances.`);
    }
  });

  // Correlation insights
  correlations.filter(c => Math.abs(c.correlationStrength) > 50).forEach(correlation => {
    const strength = Math.abs(correlation.correlationStrength);
    const relationship = correlation.correlationStrength > 0 ? "often occur together" : "tend to be inversely related";
    insights.push(`${correlation.primarySymptom} and ${correlation.correlatedSymptom} ${relationship} (${strength}% correlation strength).`);
  });

  return insights;
}