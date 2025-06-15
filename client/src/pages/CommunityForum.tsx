import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, User, Heart, MessageCircle, Share, Brain, Trophy, Flame, Star, Award, TrendingUp, Clock, Eye, ThumbsUp, Bookmark, Flag, X } from "lucide-react";

export default function CommunityForum() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [showEngagementTips, setShowEngagementTips] = useState(true);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "support",
  });
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/community-posts", selectedCategory],
    enabled: isAuthenticated,
  });

  const createPost = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/community-posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
      setIsCreatePostOpen(false);
      setNewPost({ title: "", content: "", category: "support" });
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "", label: "All Posts" },
    { value: "story", label: "Success Stories" },
    { value: "success_tactic", label: "Treatment Tips" },
    { value: "support", label: "Support" },
    { value: "question", label: "Questions" },
  ];

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      story: { label: "Success Story", className: "bg-green-100 text-green-700" },
      success_tactic: { label: "Treatment Tip", className: "bg-blue-100 text-blue-700" },
      support: { label: "Support", className: "bg-purple-100 text-purple-700" },
      question: { label: "Question", className: "bg-yellow-100 text-yellow-700" },
    };
    
    const config = categoryMap[category as keyof typeof categoryMap] || { label: category, className: "bg-gray-100 text-gray-700" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }
    
    createPost.mutate(newPost);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Enhanced posts with engagement metrics
  const mockPosts = posts?.length ? posts : [
    {
      id: 1,
      title: "3 Months of Progress: Diet Changes That Helped",
      content: "I wanted to share my experience with dietary modifications over the past 3 months. After eliminating processed foods and focusing on anti-inflammatory foods, I've noticed significant improvements in my symptoms...",
      category: "story",
      authorId: "anonymous_1",
      authorName: "Sarah M.",
      authorLevel: "Supporter",
      authorBadges: ["Helper", "Streak 30"],
      likes: 24,
      replies: 8,
      views: 156,
      shares: 3,
      bookmarks: 12,
      trending: true,
      quality: "high",
      aiAnalysis: "This post discusses evidence-based dietary approaches. The anti-inflammatory diet mentioned has shown benefits in similar conditions. Consider consulting with healthcare providers before major dietary changes.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      timeToRead: "2 min read",
    },
    {
      id: 2,
      title: "Looking for Sleep Quality Tips",
      content: "Has anyone found effective natural methods to improve sleep quality? I've been struggling with restless nights and it's affecting my overall symptom management...",
      category: "question",
      authorId: "anonymous_2",
      authorName: "Mike R.",
      authorLevel: "Community Member",
      authorBadges: ["New Member"],
      likes: 12,
      replies: 15,
      views: 89,
      shares: 1,
      bookmarks: 8,
      trending: false,
      quality: "medium",
      aiAnalysis: "Sleep quality is crucial for symptom management. Common helpful approaches include maintaining consistent sleep schedules, creating dark environments, and considering magnesium supplementation under medical guidance.",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      timeToRead: "1 min read",
    },
    {
      id: 3,
      title: "Weekly Victory: First Symptom-Free Day in Months!",
      content: "I wanted to celebrate with everyone here - yesterday was my first completely symptom-free day in over 4 months! It might not seem like much, but for me it's huge...",
      category: "story",
      authorId: "anonymous_3",
      authorName: "Alex T.",
      authorLevel: "Champion",
      authorBadges: ["Victory Sharer", "Motivator", "Streak 60"],
      likes: 45,
      replies: 23,
      views: 234,
      shares: 8,
      bookmarks: 18,
      trending: true,
      quality: "high",
      aiAnalysis: "Celebrating symptom-free days is an important part of recovery tracking. This positive milestone can help maintain motivation and provide hope to others in the community.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      timeToRead: "2 min read",
    },
  ];

  // Interaction handlers
  const handleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
    
    toast({
      title: newLikedPosts.has(postId) ? "Post liked!" : "Like removed",
      description: newLikedPosts.has(postId) ? "You showed support for this post" : "Like removed from post",
    });
  };

  const handleBookmark = (postId) => {
    const newBookmarkedPosts = new Set(bookmarkedPosts);
    if (newBookmarkedPosts.has(postId)) {
      newBookmarkedPosts.delete(postId);
    } else {
      newBookmarkedPosts.add(postId);
    }
    setBookmarkedPosts(newBookmarkedPosts);
    
    toast({
      title: newBookmarkedPosts.has(postId) ? "Post bookmarked!" : "Bookmark removed",
      description: newBookmarkedPosts.has(postId) ? "Saved to your reading list" : "Removed from reading list",
    });
  };

  // Sort posts based on selected sorting method
  const sortedPosts = [...(selectedCategory 
    ? mockPosts.filter(post => post.category === selectedCategory)
    : mockPosts)].sort((a, b) => {
    switch (sortBy) {
      case "trending":
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.likes - a.likes;
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":
        return b.likes - a.likes;
      case "mostReplies":
        return b.replies - a.replies;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Engagement Tips Banner */}
      {showEngagementTips && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="p-4 flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Build Your Community Reputation!</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Share your progress, help others with questions, and earn badges. Active community members unlock special recognition and features.
                </p>
                <div className="flex gap-4 mt-2 text-xs text-blue-700">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Get likes to earn Helper badge
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    Post daily for streak badges
                  </span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowEngagementTips(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Community Forum</h2>
          <p className="text-slate-600">Connect with others on similar health journeys</p>
        </div>
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            <Button className="px-6 py-3">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
              <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="story">Success Story</SelectItem>
                  <SelectItem value="success_tactic">Treatment Tip</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Share your thoughts..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="h-32"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreatePost} disabled={createPost.isPending}>
                  {createPost.isPending ? "Posting..." : "Post"}
                </Button>
                <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Forum Posts */}
      <div className="space-y-6">
        {postsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No posts found in this category.</p>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-slate-800">Anonymous User</h3>
                    {getCategoryBadge(post.category)}
                    <span className="text-sm text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-slate-800 mb-3">{post.title}</h4>
                  <p className="text-slate-600 mb-4">{post.content}</p>
                  
                  {/* AI Analysis */}
                  {post.aiAnalysis && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-blue-800 font-medium text-sm">AI Analysis:</span>
                          <p className="text-blue-700 text-sm">{post.aiAnalysis}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes} likes</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies} replies</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Share className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
