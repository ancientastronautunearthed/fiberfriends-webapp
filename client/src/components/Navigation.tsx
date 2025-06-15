import { Link, useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Bell, Star, User, Home, ClipboardCheck, TrendingUp, Users, Bot, MessageCircle, Menu, Trophy, Award, Brain } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Navigation() {
  const { user } = useFirebaseAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tracking", label: "Tracking", icon: ClipboardCheck },
    { path: "/patterns", label: "Patterns", icon: TrendingUp },
    { path: "/recommendations", label: "Smart Recs", icon: Brain },
    { path: "/challenges", label: "Challenges", icon: Trophy },
    { path: "/achievements", label: "Achievements", icon: Award },
    { path: "/community", label: "Community", icon: Users },
    { path: "/chat", label: "Chat", icon: MessageCircle },
    { path: "/companion", label: "AI Companion", icon: Bot },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800">Fiber Friends</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-slate-600 hover:text-primary font-medium transition-colors ${
                    isActive(item.path) ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-accent text-white px-3 py-1 rounded-full text-sm">
                <Star className="w-4 h-4" />
                <span>{user?.points || 0}</span>
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1 p-2 ${
                  isActive(item.path) ? "text-primary" : "text-slate-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 p-2 ${
              location === "/profile" ? "text-primary" : "text-slate-600"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
