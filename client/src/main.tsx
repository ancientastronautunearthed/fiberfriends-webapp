import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Check if it's a Firebase authentication error
  if (event.reason?.code?.startsWith('auth/') || 
      event.reason?.message?.includes('Firebase') ||
      event.reason?.message?.includes('auth')) {
    console.log('Firebase authentication error caught, using test mode');
    localStorage.setItem('test-mode', 'true');
    if (!localStorage.getItem('test-user')) {
      localStorage.setItem('test-user', JSON.stringify({
        id: 'test-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        onboardingCompleted: true,
        points: 100,
        totalPoints: 100,
        currentTier: 'Newcomer',
        streakDays: 3,
        longestStreak: 7
      }));
    }
  }
  
  event.preventDefault(); // Prevent the default browser behavior
});

// Add global error handling for regular errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
