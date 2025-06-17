import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
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

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  authorLevel: string;
  authorBadges: string[];
  likes: number;
  replies: number;
  views: number;
  shares: number;
  bookmarks: number;
  trending: boolean;
  quality: string;
  aiAnalysis?: string;
  createdAt: string;
  timeToRead: string;
}

export default function CommunityForum() {
  const { isAuthenticated, isLoading } = useFirebaseAuth();
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
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

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

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/community-posts", selectedCategory],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/community-posts");
      return response.json();
    }
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
      } else {
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Mock data for demonstration
  const mockPosts: Post[] = Array.isArray(posts) && posts.length > 0 ? posts : [
    {
      id: "1",
      title: "Discovered DMSO really helps with the itching!",
      content: "I've been dealing with terrible itching for months and finally tried DMSO gel. Within days, the itching reduced by about 60%! Has anyone else tried this? I'm using a 70% concentration...",
      category: "success_tactic",
      authorId: "user_1",
      authorName: "Sarah M.",
      authorLevel: "Explorer",
      authorBadges: ["Helpful Member", "30-Day Streak"],
      likes: 24,
      replies: 8,
      views: 156,
      shares: 3,
      bookmarks: 12,
      trending: true,
      quality: "high",
      aiAnalysis: "DMSO has anti-inflammatory properties that may help with certain skin conditions. Always consult with a healthcare provider before trying new treatments.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      timeToRead: "2 min read",
    },
    {
      id: "2",
      title: "Need support: Family doesn't understand",
      content: "I'm struggling with family members who think I'm making this up. They don't understand the constant fatigue and skin sensations. How do you deal with unsupportive family?",
      category: "support",
      authorId: "anonymous_2",
      authorName: "Anonymous",
      authorLevel: "Newcomer",
      authorBadges: ["First Post"],
      likes: 15,
      replies: 12,
      views: 89,
      shares: 1,
      bookmarks: 5,
      trending: false,
      quality: "normal",
      aiAnalysis: "Many chronic conditions face skepticism. Building a support network and educating loved ones with medical information can help improve understanding.",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      timeToRead: "3 min read",
    },
    {
      id: "3",
      title: "3 months symptom-free!",
      content: "I can't believe I'm writing this, but I've been symptom-free for 3 months now! It's been a long journey of diet changes, stress management, and finding the right treatments. It might not seem like much, but for me it's huge...",
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
    {
      id: "4",
      title: "Question about diet restrictions",
      content: "I've been reading about elimination diets and how they might help with symptoms. Has anyone tried cutting out gluten, dairy, or sugar? What were your results?",
      category: "question",
      authorId: "user_4",
      authorName: "Mike R.",
      authorLevel: "Explorer",
      authorBadges: ["Curious Learner"],
      likes: 8,
      replies: 15,
      views: 67,
      shares: 2,
      bookmarks: 7,
      trending: false,
      quality: "normal",
      aiAnalysis: "Elimination diets can help identify food triggers for various conditions. Working with a nutritionist ensures proper nutrition while testing for sensitivities.",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      timeToRead: "1 min read",
    }
  ];

  // Interaction handlers
  const handleLike = (postId: string) => {
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

  const handleBookmark = (postId: string) => {
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
    ? mockPosts.filter((post: Post) => post.category === selectedCategory)
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

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "support":
        return <Badge className="bg-blue-100 text-blue-800">Support</Badge>;
      case "question":
        return <Badge className="bg-purple-100 text-purple-800">Question</Badge>;
      case "story":
        return <Badge className="bg-green-100 text-green-800">Success Story</Badge>;
      case "success_tactic":
        return <Badge className="bg-amber-100 text-amber-800">Treatment Tip</Badge>;
      default:
        return <Badge>General</Badge>;
    }
  };

  const handleSubmitPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    createPost.mutate(newPost);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
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
                  Share your progress, help others with questions, and earn badges. Quality contributions earn more points!
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowEngagementTips(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </Card>
      )}

      {/* Header and Create Post Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Community Forum</h1>
          <p className="text-slate-600 mt-2">Connect with others, share experiences, and find support</p>
        </div>
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newPost.category}
                  onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                >
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
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Give your post a clear title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Share your thoughts, questions, or experiences..."
                  rows={6}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleSubmitPost}
                  disabled={!newPost.title || !newPost.content || createPost.isPending}
                >
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

      {/* Enhanced Filters and Sorting */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Browse Posts</h3>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </span>
                </SelectItem>
                <SelectItem value="recent">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Most Recent
                  </span>
                </SelectItem>
                <SelectItem value="popular">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Most Liked
                  </span>
                </SelectItem>
                <SelectItem value="mostReplies">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Most Replies
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Category filters */}
        <div className="flex gap-3 flex-wrap">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => setSelectedCategory("")}
            className="text-sm"
          >
            All Posts
          </Button>
          <Button
            variant={selectedCategory === "support" ? "default" : "outline"}
            onClick={() => setSelectedCategory("support")}
            className="text-sm"
          >
            Support
          </Button>
          <Button
            variant={selectedCategory === "question" ? "default" : "outline"}
            onClick={() => setSelectedCategory("question")}
            className="text-sm"
          >
            Questions
          </Button>
          <Button
            variant={selectedCategory === "story" ? "default" : "outline"}
            onClick={() => setSelectedCategory("story")}
            className="text-sm"
          >
            Success Stories
          </Button>
          <Button
            variant={selectedCategory === "success_tactic" ? "default" : "outline"}
            onClick={() => setSelectedCategory("success_tactic")}
            className="text-sm"
          >
            Treatment Tips
          </Button>
        </div>
      </div>

      {/* Forum Posts */}
      <div className="space-y-6">
        {postsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : sortedPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No posts found</h3>
            <p className="text-slate-600 mb-4">
              {selectedCategory ? `No posts in the ${selectedCategory} category.` : "No posts available."}
            </p>
            <Button onClick={() => setIsCreatePostOpen(true)}>
              Create First Post
            </Button>
          </Card>
        ) : (
          sortedPosts.map((post) => (
            <Card key={post.id} className={`p-6 ${post.trending ? 'ring-2 ring-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold">
                  {post.authorName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">{post.authorName}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {post.authorLevel}
                      </Badge>
                      {post.trending && (
                        <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                          <Flame className="w-3 h-3" />
                          Trending
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {post.authorBadges.map((badge: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
                      <span>{post.timeToRead}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Post Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryBadge(post.category)}
                    {post.quality === 'high' && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Star className="w-3 h-3 mr-1" />
                        Quality Post
                      </Badge>
                    )}
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
                  
                  {/* Enhanced Engagement Metrics */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-4 h-4" />
                      {post.bookmarks} saved
                    </span>
                    <span className="flex items-center gap-1">
                      <Share className="w-4 h-4" />
                      {post.shares} shares
                    </span>
                  </div>
                  
                  {/* Interactive Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`transition-all ${likedPosts.has(post.id) 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Reply ({post.replies})
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`transition-all ${bookmarkedPosts.has(post.id) 
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                          : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className={`w-4 h-4 mr-2 ${bookmarkedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        {bookmarkedPosts.has(post.id) ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-green-600 hover:bg-green-50">
                        <Share className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
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