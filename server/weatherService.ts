import { storage } from "./storage";

interface WeatherData {
  temperature: number;
  condition: string; // sunny, cloudy, rainy, snowy, etc.
  humidity: number;
  windSpeed: number;
  description: string;
  location: string;
  timestamp: Date;
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
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        location: data.name,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  async isWorkDay(userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user?.isEmployed) return false;

      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Basic work day detection (Monday-Friday for most people)
      // This could be enhanced with user-specific work schedules
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      
      // Check if user has weekend work based on work hours
      const workHours = user.workHours || '';
      const hasWeekendWork = workHours.toLowerCase().includes('weekend');
      
      if (hasWeekendWork) {
        return true; // Always a work day if they work weekends
      }
      
      return isWeekday;
    } catch (error) {
      console.error('Error checking work day:', error);
      return false;
    }
  }

  getHealthyActivities(weather: WeatherData, isWorkDay: boolean): HealthyActivity[] {
    const allActivities: HealthyActivity[] = [
      // Outdoor Activities
      {
        id: 'morning_walk',
        name: 'Morning Nature Walk',
        description: 'Gentle 20-30 minute walk in fresh air to reduce stress and improve circulation',
        duration: '20-30 minutes',
        category: 'outdoor',
        weatherConditions: ['sunny', 'clear', 'clouds', 'partly cloudy'],
        healthBenefits: ['Reduces stress', 'Improves circulation', 'Vitamin D exposure', 'Mental clarity'],
        morgellonsSpecific: true
      },
      {
        id: 'garden_therapy',
        name: 'Garden Therapy',
        description: 'Light gardening or plant care to connect with nature and reduce anxiety',
        duration: '30-45 minutes',
        category: 'outdoor',
        weatherConditions: ['sunny', 'clear', 'clouds', 'partly cloudy'],
        healthBenefits: ['Stress reduction', 'Mindfulness', 'Light exercise', 'Purpose and accomplishment'],
        morgellonsSpecific: true,
        equipmentNeeded: ['Gardening gloves', 'Small tools']
      },
      {
        id: 'covered_exercise',
        name: 'Covered Porch Exercise',
        description: 'Gentle stretching or yoga under shelter while getting fresh air',
        duration: '15-20 minutes',
        category: 'outdoor',
        weatherConditions: ['rain', 'drizzle', 'light rain'],
        healthBenefits: ['Flexibility', 'Fresh air', 'Stress relief'],
        morgellonsSpecific: true
      },

      // Indoor Activities
      {
        id: 'meditation',
        name: 'Guided Meditation',
        description: 'Mindfulness meditation focused on body awareness and stress reduction',
        duration: '10-20 minutes',
        category: 'indoor',
        weatherConditions: ['rain', 'snow', 'thunderstorm', 'extreme cold', 'extreme heat'],
        healthBenefits: ['Stress reduction', 'Pain management', 'Emotional regulation', 'Sleep improvement'],
        morgellonsSpecific: true
      },
      {
        id: 'gentle_yoga',
        name: 'Gentle Yoga',
        description: 'Restorative yoga poses designed for sensitive skin conditions',
        duration: '20-30 minutes',
        category: 'indoor',
        weatherConditions: ['rain', 'snow', 'thunderstorm', 'extreme cold', 'extreme heat'],
        healthBenefits: ['Flexibility', 'Circulation', 'Stress relief', 'Pain management'],
        morgellonsSpecific: true,
        equipmentNeeded: ['Yoga mat', 'Comfortable clothing']
      },
      {
        id: 'breathing_exercises',
        name: 'Deep Breathing Exercises',
        description: 'Structured breathing techniques to manage anxiety and promote healing',
        duration: '5-15 minutes',
        category: 'both',
        weatherConditions: ['sunny', 'cloudy', 'rain', 'snow'],
        healthBenefits: ['Stress reduction', 'Oxygenation', 'Anxiety management', 'Sleep improvement'],
        morgellonsSpecific: true
      },
      {
        id: 'epsom_bath',
        name: 'Therapeutic Epsom Salt Bath',
        description: 'Warm bath with Epsom salts to soothe skin and reduce inflammation',
        duration: '15-20 minutes',
        category: 'indoor',
        weatherConditions: ['cold', 'rain', 'snow', 'windy'],
        healthBenefits: ['Skin soothing', 'Muscle relaxation', 'Stress relief', 'Improved circulation'],
        morgellonsSpecific: true,
        equipmentNeeded: ['Epsom salts', 'Comfortable bath temperature']
      },

      // Day-off Specific Activities
      {
        id: 'nature_photography',
        name: 'Nature Photography Walk',
        description: 'Combine gentle exercise with creative expression and mindfulness',
        duration: '45-60 minutes',
        category: 'outdoor',
        weatherConditions: ['sunny', 'clear', 'partly cloudy'],
        healthBenefits: ['Creative expression', 'Mindfulness', 'Light exercise', 'Vitamin D'],
        morgellonsSpecific: true,
        equipmentNeeded: ['Camera or phone']
      },
      {
        id: 'cooking_therapy',
        name: 'Healing Recipe Preparation',
        description: 'Prepare anti-inflammatory meals using fresh, whole ingredients',
        duration: '30-60 minutes',
        category: 'indoor',
        weatherConditions: ['rain', 'snow', 'extreme weather'],
        healthBenefits: ['Nutrition focus', 'Mindfulness', 'Accomplishment', 'Dietary management'],
        morgellonsSpecific: true
      }
    ];

    // Filter activities based on weather conditions
    const suitableActivities = allActivities.filter(activity => {
      const weatherMatch = activity.weatherConditions.some(condition => 
        weather.condition.includes(condition) || weather.description.includes(condition)
      );
      
      // For extreme temperatures, suggest indoor activities
      if (weather.temperature < 32 || weather.temperature > 85) {
        return activity.category === 'indoor' || activity.category === 'both';
      }
      
      return weatherMatch || activity.category === 'both';
    });

    // If it's a day off, prioritize longer, more restorative activities
    if (!isWorkDay) {
      return suitableActivities.sort((a, b) => {
        const aDuration = parseInt(a.duration);
        const bDuration = parseInt(b.duration);
        return bDuration - aDuration; // Longer activities first on days off
      });
    }

    // On work days, prioritize shorter activities
    return suitableActivities.filter(activity => {
      const duration = parseInt(activity.duration);
      return duration <= 30; // Shorter activities for work days
    });
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

      let weatherMessage = 'Weather information unavailable';
      if (weather) {
        weatherMessage = `It's ${weather.temperature}°F and ${weather.description} in ${weather.location}`;
      }

      return {
        weather,
        isWorkDay,
        dayOffMessage,
        activities: activities.slice(0, 4), // Return top 4 recommendations
        weatherMessage
      };
    } catch (error) {
      console.error('Error getting personalized activities:', error);
      return {
        weather: null,
        isWorkDay: true,
        activities: [],
        weatherMessage: 'Unable to get weather information'
      };
    }
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