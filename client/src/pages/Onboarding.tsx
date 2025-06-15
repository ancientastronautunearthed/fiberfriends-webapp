import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, User, MapPin, Heart, Utensils, Activity, Plus, X, Users, Sparkles } from "lucide-react";

// Comprehensive onboarding schema based on your initial document
const onboardingSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"), // For birthday bonus points
  age: z.number().min(1).max(150),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  location: z.string().min(1, "Location is required"),
  
  // Employment Information
  isEmployed: z.boolean(),
  workHours: z.string().optional(), // e.g., "9am-5pm", "Night shift", "Part-time"
  incomeLevel: z.enum(["low", "middle", "high", "prefer-not-to-say"]).optional(),
  
  // Medical History
  diagnosisStatus: z.enum(["diagnosed", "suspected"]),
  misdiagnoses: z.array(z.string()).optional(),
  diagnosisTimeline: z.string().optional(),
  hasFibers: z.boolean(),
  otherDiseases: z.array(z.string()).optional(),
  
  // Enhanced Food Preferences
  foodDislikes: z.array(z.string()).optional(),
  customFoodDislikes: z.string().optional(), // Custom text field
  foodFavorites: z.array(z.string()).optional(),
  customFoodFavorites: z.string().optional(), // Custom text field
  foodAllergies: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  
  // Lifestyle Habits
  smokingHabit: z.boolean(),
  smokingDuration: z.string().optional(),
  smokingFrequency: z.string().optional(),
  alcoholHabit: z.boolean(),
  alcoholDuration: z.string().optional(),
  alcoholFrequency: z.string().optional(),
  exerciseFrequency: z.enum(["daily", "weekly", "monthly", "rarely", "never"]),
  
  // Personal & Family Information
  relationshipStatus: z.string().optional(),
  hasChildren: z.boolean().optional(),
  childrenCount: z.number().optional(),
  childrenAges: z.string().optional(),
  hasSiblings: z.boolean().optional(),
  siblingsCount: z.number().optional(),
  
  // Important Dates for Reminders
  importantBirthdays: z.string().optional(),
  socialPreferences: z.string().optional(),
  
  // Optional Profile
  hobbies: z.string().optional(),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

// Comprehensive food preference lists
const FOOD_DISLIKES_OPTIONS = [
  "Dairy products", "Gluten/Wheat", "Spicy foods", "Seafood", "Red meat", "Poultry", 
  "Eggs", "Nuts", "Soy products", "Mushrooms", "Onions", "Garlic", "Tomatoes", 
  "Citrus fruits", "Beans/Legumes", "Cruciferous vegetables", "Processed foods",
  "Artificial sweeteners", "High-sodium foods", "Fried foods", "Refined sugar",
  "Alcohol", "Caffeine", "Carbonated drinks", "High-fat foods"
];

const FOOD_FAVORITES_OPTIONS = [
  "Fresh fruits", "Leafy greens", "Lean proteins", "Whole grains", "Nuts and seeds",
  "Fish", "Chicken", "Turkey", "Beef", "Pork", "Eggs", "Dairy products",
  "Root vegetables", "Bell peppers", "Berries", "Citrus fruits", "Avocados",
  "Sweet potatoes", "Quinoa", "Brown rice", "Oats", "Beans/Legumes",
  "Olive oil", "Coconut oil", "Dark chocolate", "Green tea", "Herbal teas"
];

const WORK_HOURS_OPTIONS = [
  "9am-5pm (Standard)", "8am-4pm", "7am-3pm", "10am-6pm", "11am-7pm",
  "Evening shift (3pm-11pm)", "Night shift (11pm-7am)", "Rotating shifts",
  "Part-time mornings", "Part-time afternoons", "Part-time evenings",
  "Weekends only", "Flexible hours", "Remote work", "Unemployed/Not working"
];

// Birthday Add Button Component with Relationship Selection
const BirthdayAddButton = ({ onAdd }: { onAdd: (relationship: string, name: string, dateOfBirth: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [relationship, setRelationship] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const relationships = [
    "Son", "Daughter", "Brother", "Sister", "Cousin", "Friend", 
    "Grandma", "Grandpa", "Mom", "Dad", "Aunt", "Uncle", 
    "Partner", "Spouse", "Niece", "Nephew", "Best Friend"
  ];

  const handleAdd = () => {
    if (relationship && name && dateOfBirth) {
      onAdd(relationship, name, dateOfBirth);
      setRelationship("");
      setName("");
      setDateOfBirth("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Birthday
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
          <h4 className="font-medium text-gray-900 mb-3">Add Birthday</h4>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Relationship</Label>
              <Select onValueChange={setRelationship} value={relationship}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Date of Birth</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleAdd}
                disabled={!relationship || !name || !dateOfBirth}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add
              </Button>
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const steps = [
  { id: 1, title: "Basic Information", icon: User },
  { id: 2, title: "Location & Health", icon: MapPin },
  { id: 3, title: "Medical History", icon: Heart },
  { id: 4, title: "Food & Lifestyle", icon: Utensils },
  { id: 5, title: "Personal & Family", icon: Activity },
  { id: 6, title: "Hobbies & Interests", icon: Activity },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [commonMisdiagnoses, setCommonMisdiagnoses] = useState<string[]>([]);
  const [commonDiseases, setCommonDiseases] = useState<string[]>([]);
  const [foodDislikes, setFoodDislikes] = useState<string[]>([]);
  const [foodFavorites, setFoodFavorites] = useState<string[]>([]);
  const [foodAllergies, setFoodAllergies] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [importantBirthdays, setImportantBirthdays] = useState<Array<{id: string, relationship: string, name: string, dateOfBirth: string}>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      misdiagnoses: [],
      otherDiseases: [],
      foodDislikes: [],
      customFoodDislikes: "",
      foodFavorites: [],
      customFoodFavorites: "",
      foodAllergies: [],
      currentMedications: [],
      hasFibers: false,
      smokingHabit: false,
      alcoholHabit: false,
      hasChildren: false,
      hasSiblings: false,
      isEmployed: false,
      exerciseFrequency: "rarely",
      importantBirthdays: "[]"
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      // Transform data to match backend schema
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        location: data.location,
        diagnosisStatus: data.diagnosisStatus,
        misdiagnoses: data.misdiagnoses || [],
        diagnosisTimeline: data.diagnosisTimeline,
        hasFibers: data.hasFibers,
        otherDiseases: data.otherDiseases || [],
        foodPreferences: {
          dislikes: data.foodDislikes || [],
          favorites: data.foodFavorites || [],
        },
        habits: {
          smoking: data.smokingHabit,
          alcohol: data.alcoholHabit,
          exercise: data.exerciseFrequency,
        },
        // Enhanced smoking/alcohol details
        smokingDuration: data.smokingDuration,
        smokingFrequency: data.smokingFrequency,
        alcoholDuration: data.alcoholDuration,
        alcoholFrequency: data.alcoholFrequency,
        
        // Personal & Family Information
        relationshipStatus: data.relationshipStatus,
        hasChildren: data.hasChildren || false,
        childrenCount: data.childrenCount,
        childrenAges: data.childrenAges,
        hasSiblings: data.hasSiblings || false,
        siblingsCount: data.siblingsCount,
        
        // Important Dates for Luna's reminders and gift suggestions
        importantBirthdays: data.importantBirthdays,
        socialPreferences: data.socialPreferences,
        
        hobbies: data.hobbies,
        onboardingCompleted: true,
      };

      return await apiRequest("POST", "/api/auth/complete-onboarding", profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Complete!",
        description: "Welcome to Fiber Friends! Luna is ready to meet you.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingData) => {
    onboardingMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const addMisdiagnosis = (diagnosis: string) => {
    if (diagnosis && !commonMisdiagnoses.includes(diagnosis)) {
      const updated = [...commonMisdiagnoses, diagnosis];
      setCommonMisdiagnoses(updated);
      form.setValue("misdiagnoses", updated);
    }
  };

  const removeMisdiagnosis = (diagnosis: string) => {
    const updated = commonMisdiagnoses.filter(d => d !== diagnosis);
    setCommonMisdiagnoses(updated);
    form.setValue("misdiagnoses", updated);
  };

  const addDisease = (disease: string) => {
    if (disease && !commonDiseases.includes(disease)) {
      const updated = [...commonDiseases, disease];
      setCommonDiseases(updated);
      form.setValue("otherDiseases", updated);
    }
  };

  const removeDisease = (disease: string) => {
    const updated = commonDiseases.filter(d => d !== disease);
    setCommonDiseases(updated);
    form.setValue("otherDiseases", updated);
  };

  const addFoodItem = (item: string, type: 'dislikes' | 'favorites' | 'allergies') => {
    if (!item) return;
    
    if (type === 'dislikes') {
      const updated = [...foodDislikes, item];
      setFoodDislikes(updated);
      form.setValue("foodDislikes", updated);
    } else if (type === 'favorites') {
      const updated = [...foodFavorites, item];
      setFoodFavorites(updated);
      form.setValue("foodFavorites", updated);
    } else if (type === 'allergies') {
      const updated = [...foodAllergies, item];
      setFoodAllergies(updated);
      form.setValue("foodAllergies", updated);
    }
  };

  const removeFoodItem = (item: string, type: 'dislikes' | 'favorites' | 'allergies') => {
    if (type === 'dislikes') {
      const updated = foodDislikes.filter(f => f !== item);
      setFoodDislikes(updated);
      form.setValue("foodDislikes", updated);
    } else if (type === 'favorites') {
      const updated = foodFavorites.filter(f => f !== item);
      setFoodFavorites(updated);
      form.setValue("foodFavorites", updated);
    } else if (type === 'allergies') {
      const updated = foodAllergies.filter(a => a !== item);
      setFoodAllergies(updated);
      form.setValue("foodAllergies", updated);
    }
  };

  const addMedication = (medication: string) => {
    if (!medication) return;
    const updated = [...currentMedications, medication];
    setCurrentMedications(updated);
    form.setValue("currentMedications", updated);
  };

  const removeMedication = (medication: string) => {
    const updated = currentMedications.filter(m => m !== medication);
    setCurrentMedications(updated);
    form.setValue("currentMedications", updated);
  };

  const addBirthday = (relationship: string, name: string, dateOfBirth: string) => {
    if (!relationship || !name || !dateOfBirth) return;
    const newBirthday = {
      id: Date.now().toString(),
      relationship,
      name,
      dateOfBirth
    };
    const updated = [...importantBirthdays, newBirthday];
    setImportantBirthdays(updated);
    form.setValue("importantBirthdays", JSON.stringify(updated));
  };

  const removeBirthday = (id: string) => {
    const updated = importantBirthdays.filter(b => b.id !== id);
    setImportantBirthdays(updated);
    form.setValue("importantBirthdays", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Fiber Friends</h1>
          <p className="text-slate-600">Let's set up your health profile so Luna can provide personalized support</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.id ? 'bg-primary border-primary text-white' : 'border-slate-300 text-slate-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2 text-slate-600">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input {...form.register("firstName")} />
                      {form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input {...form.register("lastName")} />
                      {form.formState.errors.lastName && (
                        <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input 
                        type="number" 
                        {...form.register("age", { valueAsNumber: true })} 
                      />
                      {form.formState.errors.age && (
                        <p className="text-red-500 text-sm">{form.formState.errors.age.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="height">Height</Label>
                      <Input 
                        placeholder="e.g., 5'8&quot;" 
                        {...form.register("height")} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input 
                        placeholder="e.g., 150 lbs" 
                        {...form.register("weight")} 
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <RadioGroup 
                      value={form.watch("gender")} 
                      onValueChange={(value) => form.setValue("gender", value as any)}
                      className="flex flex-wrap gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non-binary" id="non-binary" />
                        <Label htmlFor="non-binary">Non-binary</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                        <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Health */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location (City, State)</Label>
                    <Input 
                      placeholder="e.g., Austin, TX" 
                      {...form.register("location")} 
                    />
                    {form.formState.errors.location && (
                      <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Diagnosis Status</Label>
                    <RadioGroup 
                      value={form.watch("diagnosisStatus")} 
                      onValueChange={(value) => form.setValue("diagnosisStatus", value as any)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="diagnosed" id="diagnosed" />
                        <Label htmlFor="diagnosed">Officially diagnosed with Morgellons</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="suspected" id="suspected" />
                        <Label htmlFor="suspected">Suspected Morgellons (self-diagnosed)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="diagnosisTimeline">Diagnosis Timeline (Optional)</Label>
                    <Textarea 
                      placeholder="Tell us about your journey to diagnosis..."
                      {...form.register("diagnosisTimeline")}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hasFibers"
                      checked={form.watch("hasFibers")}
                      onCheckedChange={(checked) => form.setValue("hasFibers", checked as boolean)}
                    />
                    <Label htmlFor="hasFibers">I have experienced fiber-like symptoms</Label>
                  </div>
                </div>
              )}

              {/* Step 3: Medical History */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Previous Misdiagnoses (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">Add any conditions you were previously diagnosed with before Morgellons</p>
                    <div className="flex gap-2 mb-2">
                      <Input 
                        placeholder="Enter a previous diagnosis..." 
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addMisdiagnosis((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addMisdiagnosis(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {commonMisdiagnoses.map((diagnosis) => (
                        <span 
                          key={diagnosis}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {diagnosis}
                          <button 
                            type="button"
                            onClick={() => removeMisdiagnosis(diagnosis)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Other Health Conditions (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">Any other health conditions you currently have</p>
                    <div className="flex gap-2 mb-2">
                      <Input 
                        placeholder="Enter a health condition..." 
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addDisease((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addDisease(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {commonDiseases.map((disease) => (
                        <span 
                          key={disease}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {disease}
                          <button 
                            type="button"
                            onClick={() => removeDisease(disease)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Food & Lifestyle */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label>Food Dislikes (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">Foods you avoid or dislike</p>
                    <div className="flex gap-2 mb-2">
                      <Input 
                        placeholder="Enter a food you dislike..." 
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFoodItem((e.target as HTMLInputElement).value, 'dislikes');
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addFoodItem(input.value, 'dislikes');
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {foodDislikes.map((food) => (
                        <span 
                          key={food}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {food}
                          <button 
                            type="button"
                            onClick={() => removeFoodItem(food, 'dislikes')}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Food Favorites (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">Foods you enjoy or find helpful</p>
                    <div className="flex gap-2 mb-2">
                      <Input 
                        placeholder="Enter a food you love..." 
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFoodItem((e.target as HTMLInputElement).value, 'favorites');
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addFoodItem(input.value, 'favorites');
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {foodFavorites.map((food) => (
                        <span 
                          key={food}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {food}
                          <button 
                            type="button"
                            onClick={() => removeFoodItem(food, 'favorites')}
                            className="text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Food Allergies - Critical for meal planning */}
                  <div>
                    <Label>Food Allergies (Critical for Luna's meal planning)</Label>
                    <p className="text-sm text-red-600 mb-2">Important: List any foods that cause allergic reactions</p>
                    <div className="flex gap-2 mb-2">
                      <Input 
                        placeholder="Enter a food allergy..." 
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFoodItem((e.target as HTMLInputElement).value, 'allergies');
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addFoodItem(input.value, 'allergies');
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {foodAllergies.map((food) => (
                        <span 
                          key={food}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {food}
                          <button 
                            type="button"
                            onClick={() => removeFoodItem(food, 'allergies')}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Current Medications - Critical for meal planning interactions */}
                  <div>
                    <Label>Current Medications (Critical for meal planning)</Label>
                    <p className="text-sm text-blue-600 mb-2">Include all medications, supplements, and vitamins - Luna will consider drug-food interactions</p>
                    <div className="flex gap-2 mb-2">
                      <Input 
                        placeholder="Enter medication name..." 
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addMedication((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addMedication(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentMedications.map((medication) => (
                        <span 
                          key={medication}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {medication}
                          <button 
                            type="button"
                            onClick={() => removeMedication(medication)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="smokingHabit"
                        checked={form.watch("smokingHabit")}
                        onCheckedChange={(checked) => form.setValue("smokingHabit", checked as boolean)}
                      />
                      <Label htmlFor="smokingHabit">I smoke or use tobacco</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="alcoholHabit"
                        checked={form.watch("alcoholHabit")}
                        onCheckedChange={(checked) => form.setValue("alcoholHabit", checked as boolean)}
                      />
                      <Label htmlFor="alcoholHabit">I drink alcohol regularly</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Exercise Frequency</Label>
                    <Select 
                      value={form.watch("exerciseFrequency")} 
                      onValueChange={(value) => form.setValue("exerciseFrequency", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How often do you exercise?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Several times a week</SelectItem>
                        <SelectItem value="monthly">A few times a month</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 5: Personal & Family Information */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {/* Enhanced Smoking Questions */}
                  {form.watch("smokingHabit") && (
                    <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-900">Smoking Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smokingDuration">How long have you been smoking?</Label>
                          <Select onValueChange={(value) => form.setValue("smokingDuration", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="less-than-1-year">Less than 1 year</SelectItem>
                              <SelectItem value="1-5-years">1-5 years</SelectItem>
                              <SelectItem value="5-10-years">5-10 years</SelectItem>
                              <SelectItem value="10-20-years">10-20 years</SelectItem>
                              <SelectItem value="20-plus-years">20+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="smokingFrequency">How often do you smoke?</Label>
                          <Select onValueChange={(value) => form.setValue("smokingFrequency", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-daily">Multiple times daily</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Several times a week</SelectItem>
                              <SelectItem value="occasionally">Occasionally</SelectItem>
                              <SelectItem value="rarely">Rarely</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Alcohol Questions */}
                  {form.watch("alcoholHabit") && (
                    <div className="space-y-4 bg-amber-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-amber-900">Alcohol Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="alcoholDuration">How long have you been drinking alcohol?</Label>
                          <Select onValueChange={(value) => form.setValue("alcoholDuration", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="less-than-1-year">Less than 1 year</SelectItem>
                              <SelectItem value="1-5-years">1-5 years</SelectItem>
                              <SelectItem value="5-10-years">5-10 years</SelectItem>
                              <SelectItem value="10-20-years">10-20 years</SelectItem>
                              <SelectItem value="20-plus-years">20+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="alcoholFrequency">How often do you drink alcohol?</Label>
                          <Select onValueChange={(value) => form.setValue("alcoholFrequency", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Several times a week</SelectItem>
                              <SelectItem value="weekends">Weekends only</SelectItem>
                              <SelectItem value="monthly">A few times a month</SelectItem>
                              <SelectItem value="occasionally">Occasionally</SelectItem>
                              <SelectItem value="rarely">Rarely</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Relationship Status */}
                  <div>
                    <Label htmlFor="relationshipStatus">Relationship Status (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">Helps Luna understand your support network</p>
                    <Select onValueChange={(value) => form.setValue("relationshipStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your relationship status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="in-relationship">In a relationship</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Children Information */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hasChildren" 
                        checked={form.watch("hasChildren")}
                        onCheckedChange={(checked) => form.setValue("hasChildren", checked as boolean)}
                      />
                      <Label htmlFor="hasChildren">I have children</Label>
                    </div>
                    
                    {form.watch("hasChildren") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div>
                          <Label htmlFor="childrenCount">How many children?</Label>
                          <Input 
                            type="number" 
                            placeholder="Number of children"
                            onChange={(e) => form.setValue("childrenCount", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="childrenAges">Children's ages (Optional)</Label>
                          <Input 
                            placeholder="e.g., 5, 12, 18"
                            {...form.register("childrenAges")}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Siblings Information */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hasSiblings" 
                        checked={form.watch("hasSiblings")}
                        onCheckedChange={(checked) => form.setValue("hasSiblings", checked as boolean)}
                      />
                      <Label htmlFor="hasSiblings">I have siblings</Label>
                    </div>
                    
                    {form.watch("hasSiblings") && (
                      <div className="ml-6">
                        <Label htmlFor="siblingsCount">How many siblings?</Label>
                        <Input 
                          type="number" 
                          placeholder="Number of siblings"
                          onChange={(e) => form.setValue("siblingsCount", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    )}
                  </div>



                  {/* Interactive Birthday Management */}
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">Family & Friends Birthdays</h3>
                        <p className="text-sm text-blue-800">Add important people in your life for birthday reminders</p>
                      </div>
                      <BirthdayAddButton onAdd={addBirthday} />
                    </div>
                    
                    {importantBirthdays.length > 0 && (
                      <div className="space-y-2">
                        {importantBirthdays.map((birthday) => (
                          <div key={birthday.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                {birthday.relationship}
                              </span>
                              <span className="font-medium text-gray-900">{birthday.name}</span>
                              <span className="text-gray-600">{birthday.dateOfBirth}</span>
                            </div>
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeBirthday(birthday.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {importantBirthdays.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600">Click the + button above to add important birthdays</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 6: Hobbies & Interests */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hobbies">Hobbies & Interests (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">Tell Luna about your interests so she can have more personalized conversations with you</p>
                    <Textarea 
                      placeholder="e.g., reading, gardening, cooking, art, music, sports..."
                      {...form.register("hobbies")}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="socialPreferences">Social Preferences (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">How do you prefer to socialize and connect with others?</p>
                    <Textarea 
                      placeholder="e.g., small groups, one-on-one conversations, online communities, outdoor activities..."
                      {...form.register("socialPreferences")}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="importantDates">Other Important Dates (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">Anniversaries, holidays, or special occasions you'd like reminders for</p>
                    <Textarea 
                      placeholder="e.g., Wedding anniversary: 2020-06-15, Mother's Day, Christmas shopping reminders..."
                      {...form.register("importantDates")}
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">You're all set!</h3>
                    <p className="text-blue-800 text-sm">
                      Luna will use this comprehensive information to provide personalized health insights, 
                      nutrition recommendations, birthday reminders, gift suggestions, and supportive conversations 
                      tailored specifically to your journey with Morgellons.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                {currentStep < steps.length ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={onboardingMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {onboardingMutation.isPending ? "Completing..." : "Complete Profile"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}