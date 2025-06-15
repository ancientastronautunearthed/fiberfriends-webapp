import { storage } from "./storage";

interface WeatherData {
  temperature: number;
  condition: string; // sunny, cloudy, rainy, snowy, etc.
  humidity: number;
  windSpeed: number;
  description: string;
  location: string;
  timestamp: Date;
  barometricPressure?: number;
  uvIndex?: number;
  airQuality?: number;
  visibility?: number;
  feelsLike?: number;
}

interface HealthyActivity {
  id: string;
  name: string;
  description: string;
  duration: string;
  category: 'indoor' | 'outdoor' | 'both';
  weatherConditions: string[];
  healthBenefits: string[];
  morgellonsSpecific: boolean;
  equipmentNeeded?: string[];
}

export class WeatherService {
  
  async getCurrentWeather(location: string): Promise<WeatherData | null> {
    try {
      // Using OpenWeatherMap API (user will need to provide API key)
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn('OpenWeather API key not provided');
        return null;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed || 0,
        description: data.weather[0].description,
        location: data.name,
        timestamp: new Date(),
        barometricPressure: data.main.pressure ? data.main.pressure * 0.02953 : undefined, // Convert hPa to inHg
        uvIndex: data.uvi || undefined,
        feelsLike: Math.round(data.main.feels_like),
        visibility: data.visibility ? data.visibility / 1609.34 : undefined // Convert meters to miles
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  async isWorkDay(userId: string): Promise<boolean> {
    // For now, consider weekends as days off
    // In the future, this could be user-configurable
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Monday-Friday are work days
  }

  getHealthyActivities(weather: WeatherData, isWorkDay: boolean): HealthyActivity[] {
    const allActivities: HealthyActivity[] = [
      // Sunny weather activities
      {
        id: "gentle-outdoor-walk",
        name: "Gentle Outdoor Walk",
        description: "Take a peaceful walk in shaded areas, wearing protective clothing to shield sensitive skin from direct sunlight.",
        duration: "20-30 minutes",
        category: "outdoor",
        weatherConditions: ["clear", "sunny"],
        healthBenefits: ["Vitamin D exposure", "Fresh air", "Gentle exercise", "Mood enhancement"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Hat", "Long sleeves", "Sunscreen"]
      },
      {
        id: "morning-stretching-outdoor",
        name: "Morning Stretching in Nature",
        description: "Light stretching exercises in a garden or park, taking advantage of the pleasant weather while being mindful of skin sensitivity.",
        duration: "15-20 minutes",
        category: "outdoor",
        weatherConditions: ["clear", "sunny", "clouds"],
        healthBenefits: ["Flexibility", "Connection with nature", "Stress relief"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Yoga mat", "Comfortable clothing"]
      },

      // Cloudy/mild weather activities
      {
        id: "extended-outdoor-walk",
        name: "Extended Nature Walk",
        description: "Longer walks are more comfortable in cloudy weather, with less UV exposure and cooler temperatures.",
        duration: "30-45 minutes",
        category: "outdoor",
        weatherConditions: ["clouds", "partly cloudy"],
        healthBenefits: ["Cardiovascular health", "Stress reduction", "Fresh air"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Comfortable shoes", "Light jacket"]
      },

      // Rainy weather activities
      {
        id: "indoor-meditation",
        name: "Mindful Rain Meditation",
        description: "Use the calming sound of rain for deep meditation and breathing exercises.",
        duration: "15-30 minutes",
        category: "indoor",
        weatherConditions: ["rain", "drizzle"],
        healthBenefits: ["Stress reduction", "Mental clarity", "Emotional balance"],
        morgellonsSpecific: true,
        equipmentNeeded: []
      },
      {
        id: "gentle-indoor-yoga",
        name: "Gentle Indoor Yoga",
        description: "Perfect weather for indoor movement practices that promote flexibility and relaxation.",
        duration: "20-40 minutes",
        category: "indoor",
        weatherConditions: ["rain", "drizzle", "thunderstorm"],
        healthBenefits: ["Flexibility", "Stress relief", "Body awareness"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Yoga mat"]
      },

      // Cold weather activities
      {
        id: "warm-indoor-stretching",
        name: "Warming Indoor Stretches",
        description: "Gentle movements to keep the body warm and flexible during cold weather.",
        duration: "15-25 minutes",
        category: "indoor",
        weatherConditions: ["snow", "cold"],
        healthBenefits: ["Circulation", "Warmth", "Flexibility"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Comfortable clothing"]
      },

      // Hot weather activities
      {
        id: "early-morning-activity",
        name: "Early Morning Movement",
        description: "Take advantage of cooler morning temperatures for gentle outdoor activities.",
        duration: "15-20 minutes",
        category: "outdoor",
        weatherConditions: ["hot", "warm"],
        healthBenefits: ["Fresh air", "Gentle exercise", "Cooler temperatures"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Hat", "Water bottle", "Light clothing"]
      },

      // Universal indoor activities
      {
        id: "breathing-exercises",
        name: "Deep Breathing Practice",
        description: "Focused breathing exercises to reduce stress and promote overall well-being.",
        duration: "10-15 minutes",
        category: "indoor",
        weatherConditions: ["any"],
        healthBenefits: ["Stress reduction", "Better sleep", "Anxiety relief"],
        morgellonsSpecific: true,
        equipmentNeeded: []
      },
      {
        id: "gentle-stretching",
        name: "Gentle Full-Body Stretching",
        description: "Light stretching routine designed for sensitive skin and overall flexibility.",
        duration: "15-20 minutes",
        category: "indoor",
        weatherConditions: ["any"],
        healthBenefits: ["Flexibility", "Circulation", "Muscle tension relief"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Yoga mat (optional)"]
      }
    ];

    // Filter activities based on weather conditions
    const suitableActivities = allActivities.filter(activity => 
      activity.weatherConditions.includes(weather.condition) || 
      activity.weatherConditions.includes("any")
    );

    // For work days, prioritize shorter activities
    const timeFiltered = isWorkDay 
      ? suitableActivities.filter(activity => {
          const durationMatch = activity.duration.match(/(\d+)-?(\d+)?/);
          if (durationMatch) {
            const maxDuration = parseInt(durationMatch[2] || durationMatch[1]);
            return maxDuration <= 30; // 30 minutes or less for work days
          }
          return true;
        })
      : suitableActivities;

    return timeFiltered.slice(0, 4); // Return top 4 recommendations
  }

  async getPersonalizedActivities(userId: string): Promise<{
    weather: WeatherData | null;
    isWorkDay: boolean;
    dayOffMessage?: string;
    activities: HealthyActivity[];
    weatherMessage: string;
  }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const weather = await this.getCurrentWeather(user.location || 'New York');
      const isWorkDay = await this.isWorkDay(userId);
      
      let dayOffMessage;
      if (!isWorkDay) {
        const now = new Date();
        const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
        dayOffMessage = `It's ${dayName} - a perfect day to focus on your health and well-being!`;
      }

      const activities = weather ? this.getHealthyActivities(weather, isWorkDay) : this.getGeneralHealthyActivities(isWorkDay);

      let weatherMessage = 'Weather information unavailable - showing general recommendations';
      if (weather) {
        weatherMessage = `It's ${weather.temperature}°F and ${weather.description} in ${weather.location}`;
      }

      return {
        weather,
        isWorkDay,
        dayOffMessage,
        activities: activities.length > 0 ? activities.slice(0, 4) : this.getGeneralHealthyActivities(isWorkDay).slice(0, 4),
        weatherMessage
      };
    } catch (error) {
      console.error('Error getting personalized activities:', error);
      return {
        weather: null,
        isWorkDay: true,
        activities: this.getGeneralHealthyActivities(true),
        weatherMessage: 'Unable to get weather information - showing general recommendations'
      };
    }
  }

  // General activities when weather data is unavailable
  getGeneralHealthyActivities(isWorkDay: boolean): HealthyActivity[] {
    const allActivities: HealthyActivity[] = [
      {
        id: "gentle-stretching",
        name: "Gentle Stretching Routine",
        description: "Light stretching exercises to improve flexibility and reduce muscle tension. Focus on gentle movements to avoid skin irritation.",
        duration: "15-20 minutes",
        category: "both",
        weatherConditions: ["any"],
        healthBenefits: ["Improves flexibility", "Reduces stress", "Promotes circulation", "Gentle on sensitive skin"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Yoga mat (optional)"]
      },
      {
        id: "meditation-breathing",
        name: "Mindfulness and Breathing",
        description: "Calming meditation and deep breathing exercises to reduce stress and promote mental well-being.",
        duration: "10-30 minutes",
        category: "indoor",
        weatherConditions: ["any"],
        healthBenefits: ["Reduces anxiety", "Improves focus", "Lowers stress hormones", "Supports immune function"],
        morgellonsSpecific: true,
        equipmentNeeded: []
      },
      {
        id: "light-walking",
        name: "Light Indoor Walking",
        description: "Gentle walking exercises that can be done indoors or in covered areas. Perfect for maintaining activity without weather concerns.",
        duration: "20-30 minutes",
        category: "both",
        weatherConditions: ["any"],
        healthBenefits: ["Cardiovascular health", "Gentle exercise", "Mood enhancement", "Joint mobility"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Comfortable shoes"]
      },
      {
        id: "hydration-therapy",
        name: "Hydration and Skin Care",
        description: "Focus on proper hydration and gentle skin care routines that support overall health and skin condition.",
        duration: "15 minutes",
        category: "indoor",
        weatherConditions: ["any"],
        healthBenefits: ["Skin health", "Detoxification", "Improves circulation", "Supports healing"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Water bottle", "Gentle moisturizer"]
      },
      {
        id: "journaling",
        name: "Health Journaling",
        description: "Document symptoms, mood, and daily experiences to track patterns and communicate effectively with healthcare providers.",
        duration: "10-15 minutes",
        category: "indoor",
        weatherConditions: ["any"],
        healthBenefits: ["Mental clarity", "Symptom tracking", "Emotional processing", "Communication aid"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Notebook or app"]
      },
      {
        id: "gentle-yoga",
        name: "Gentle Yoga Flow",
        description: "Slow, mindful yoga movements designed to be gentle on sensitive skin while promoting flexibility and relaxation.",
        duration: "20-30 minutes",
        category: "indoor",
        weatherConditions: ["any"],
        healthBenefits: ["Flexibility", "Stress relief", "Body awareness", "Gentle movement"],
        morgellonsSpecific: true,
        equipmentNeeded: ["Yoga mat", "Comfortable clothing"]
      }
    ];

    // Return more activities for days off
    return isWorkDay ? allActivities.slice(0, 3) : allActivities;
  }
}

export const weatherService = new WeatherService();