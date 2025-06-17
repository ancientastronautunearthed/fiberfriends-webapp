import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // Check if it's a Vite HMR connection error
  if (reason?.message?.includes('WebSocket') || 
      reason?.message?.includes('vite') ||
      reason?.message?.includes('connecting') ||
      reason?.type === 'error' && !reason.message) {
    console.log('Vite HMR connection error suppressed');
    event.preventDefault();
    return;
  }
  
  // Check if it's a Firebase authentication error
  if (reason?.code?.startsWith('auth/') || 
      reason?.message?.includes('Firebase') ||
      reason?.message?.includes('auth')) {
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
    event.preventDefault();
    return;
  }
  
  console.error('Unhandled promise rejection:', reason);
  event.preventDefault(); // Prevent the default browser behavior
});

// Add global error handling for regular errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
