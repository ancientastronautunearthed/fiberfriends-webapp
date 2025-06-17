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

  if (alignedData.length < 2) return 0;

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

// Detect cyclical patterns (e.g., weekly, monthly) in symptom data
export function detectCyclicalPatterns(symptomData: SymptomData[]): Array<{
  period: number;
  confidence: number;
  description: string;
}> {
  if (symptomData.length < 14) return []; // Need at least 2 weeks of data

  const patterns: Array<{ period: number; confidence: number; description: string }> = [];
  
  // Check for weekly patterns (7-day cycle)
  const weeklyConfidence = calculateCyclicalConfidence(symptomData, 7);
  if (weeklyConfidence > 60) {
    patterns.push({
      period: 7,
      confidence: weeklyConfidence,
      description: "Weekly pattern detected - symptoms may be influenced by work/weekend cycles"
    });
  }

  // Check for monthly patterns (28-30 day cycle)
  if (symptomData.length >= 56) { // Need at least 2 months
    const monthlyConfidence = calculateCyclicalConfidence(symptomData, 28);
    if (monthlyConfidence > 60) {
      patterns.push({
        period: 28,
        confidence: monthlyConfidence,
        description: "Monthly pattern detected - may be related to hormonal or environmental cycles"
      });
    }
  }

  return patterns;
}

// Calculate confidence score for a specific cycle period
function calculateCyclicalConfidence(data: SymptomData[], period: number): number {
  const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Group data by position in cycle
  const cycleGroups: Map<number, number[]> = new Map();
  
  sortedData.forEach((item, index) => {
    const cyclePosition = index % period;
    if (!cycleGroups.has(cyclePosition)) {
      cycleGroups.set(cyclePosition, []);
    }
    cycleGroups.get(cyclePosition)!.push(item.severity);
  });

  // Calculate variance within each cycle position
  const variances: number[] = [];
  cycleGroups.forEach((severities) => {
    if (severities.length > 1) {
      const mean = severities.reduce((sum, s) => sum + s, 0) / severities.length;
      const variance = severities.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / severities.length;
      variances.push(variance);
    }
  });

  // Lower variance = higher confidence in pattern
  const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length;
  const confidence = Math.max(0, 100 - (avgVariance * 10));
  
  return Math.round(confidence);
}

// Analyze patterns for a specific symptom over the past 4 weeks
export function analyzeSymptomConsistency(symptomData: SymptomData[]): number {
  if (symptomData.length < 28) return 0;

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentData = symptomData.filter(d => d.timestamp >= fourWeeksAgo);
  
  // Group by week
  const weekGroups: Map<number, number[]> = new Map();
  
  recentData.forEach(item => {
    const weekNum = Math.floor((new Date().getTime() - item.timestamp.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (!weekGroups.has(weekNum)) {
      weekGroups.set(weekNum, []);
    }
    weekGroups.get(weekNum)!.push(item.severity);
  });

  // Calculate weekly averages
  const weekAverages: number[] = [];
  for (let i = 0; i < 4; i++) {
    const severities = weekGroups.get(i) || [];
    weekAverages.push(
      severities.length > 0 ? severities.reduce((sum, s) => sum + s, 0) / severities.length : 0
    );
  }

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
    
    // Use the correct property names based on what's available
    const symptom1 = (correlation as any).primarySymptom || correlation.symptom1;
    const symptom2 = (correlation as any).correlatedSymptom || correlation.symptom2;
    
    insights.push(`${symptom1} and ${symptom2} ${relationship} (${strength}% correlation strength).`);
  });

  return insights;
}