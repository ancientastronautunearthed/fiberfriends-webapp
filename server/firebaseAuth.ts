import { Request, Response, NextFunction } from 'express';

// For development, we'll use a simple authentication system
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    claims?: any;
  };
}

export const isAuthenticated = (req: any, res: Response, next: NextFunction) => {
  // Development mode - allow all requests with a mock user
  req.user = {
    uid: 'dev-user-123',
    email: 'dev@example.com',
    claims: { sub: 'dev-user-123' }
  };
  next();
};

export const setupFirebaseAuth = (app: any) => {
  // Add CORS headers for Firebase auth
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  console.log('Firebase authentication setup complete');
};