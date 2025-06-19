'use client';

import React, { useState } from "react";
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
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]).default("prefer-not-to-say"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  location: z.string().min(1, "Location is required"),
  
  supportCircle: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
  })).optional(),

  importantDates: z.string().optional(),

  aiCompanionPersonality: z.string().optional(),
  aiCompanionName: z.string().optional(),

  // Employment Information
  isEmployed: z.boolean().default(false),
  workHours: z.string().optional(), // e.g., "9am-5pm", "Night shift", "Part-time"
  incomeLevel: z.enum(["low", "middle", "high", "prefer-not-to-say"]).optional(),
  
  // Medical History
  diagnosisStatus: z.enum(["diagnosed", "suspected"]).default("suspected"),
  misdiagnoses: z.array(z.string()).optional(),
  diagnosisTimeline: z.string().optional(),
  hasFibers: z.boolean().default(false),
  otherDiseases: z.array(z.string()).optional(),
  
  // Enhanced Food Preferences
  foodDislikes: z.array(z.string()).optional(),
  customFoodDislikes: z.string().optional(), // Custom text field
  foodFavorites: z.array(z.string()).optional(),
  customFoodFavorites: z.string().optional(), // Custom text field
  foodAllergies: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  
  // Lifestyle Habits
  smokingHabit: z.boolean().default(false),
  smokingDuration: z.string().optional(),
  smokingFrequency: z.string().optional(),
  alcoholHabit: z.boolean().default(false),
  alcoholDuration: z.string().optional(),
  alcoholFrequency: z.string().optional(),
  exerciseFrequency: z.enum(["daily", "weekly", "monthly", "rarely", "never"]).default("rarely"),
  
  // Personal & Family Information
  relationshipStatus: z.string().optional(),
  hasChildren: z.boolean().optional().default(false),
  childrenCount: z.number().optional(),
  childrenAges: z.string().optional(),
  hasSiblings: z.boolean().optional().default(false),
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
  "Fish", "Chicken", "Turkey", "Legumes", "Quinoa", "Sweet potatoes", "Avocados",
  "Berries", "Olive oil", "Green tea", "Herbal teas", "Fermented foods", "Yogurt",
  "Dark chocolate", "Coconut", "Ginger", "Turmeric", "Garlic", "Spinach"
];

const FOOD_ALLERGIES_OPTIONS = [
  "Peanuts", "Tree nuts", "Shellfish", "Fish", "Eggs", "Milk", "Soy", "Wheat",
  "Sesame", "Corn", "Sulfites", "MSG", "Food dyes", "Preservatives"
];

const MEDICATIONS_OPTIONS = [
  "Pain relievers", "Anti-inflammatory", "Antibiotics", "Antihistamines", 
  "Antidepressants", "Anti-anxiety", "Sleep aids", "Blood pressure", 
  "Diabetes medication", "Thyroid medication", "Vitamins", "Supplements"
];

const MISDIAGNOSES_OPTIONS = [
  "Delusional parasitosis", "Eczema", "Scabies", "Dermatitis", "Psoriasis",
  "Anxiety disorder", "Depression", "OCD", "Fibromyalgia", "Chronic fatigue syndrome",
  "Lyme disease", "Autoimmune disorder", "Allergic reaction", "Stress-related condition"
];

const OTHER_DISEASES_OPTIONS = [
  "Diabetes", "Hypertension", "Heart disease", "Arthritis", "Asthma", "COPD",
  "Thyroid disorder", "Autoimmune disease", "Cancer", "Kidney disease",
  "Liver disease", "Mental health condition", "Neurological disorder"
];

// Important birthdays component
const ImportantBirthdaysManager = ({ onUpdate }: { onUpdate: (birthdays: any[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [birthdays, setBirthdays] = useState<Array<{id: string, relationship: string, name: string, dateOfBirth: string}>>([]);
  const [relationship, setRelationship] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const relationships = [
    "Spouse/Partner", "Mother", "Father", "Sister", "Brother", "Daughter", "Son",
    "Grandmother", "Grandfather", "Aunt", "Uncle", "Cousin", "Best Friend", "Close Friend", "Other"
  ];

  const handleAdd = () => {
    if (relationship && name && dateOfBirth) {
      const newBirthday = {
        id: Date.now().toString(),
        relationship,
        name,
        dateOfBirth
      };
      const updated = [...birthdays, newBirthday];
      setBirthdays(updated);
      onUpdate(updated);
      setRelationship("");
      setName("");
      setDateOfBirth("");
      setIsOpen(false);
    }
  };

  const handleRemove = (id: string) => {
    const updated = birthdays.filter(b => b.id !== id);
    setBirthdays(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Important Birthdays (Optional)</Label>
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Birthday
        </Button>
      </div>

      {birthdays.length > 0 && (
        <div className="space-y-2">
          {birthdays.map((birthday) => (
            <div key={birthday.id} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
              <div>
                <span className="font-medium">{birthday.name}</span>
                <span className="text-slate-600 ml-2">({birthday.relationship})</span>
                <span className="text-slate-500 ml-2 text-sm">{birthday.dateOfBirth}</span>
              </div>
              <Button
                type="button"
                onClick={() => handleRemove(birthday.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Important Birthday</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Relationship</Label>
                <Select value={relationship} onValueChange={setRelationship}>
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
      gender: "prefer-not-to-say",
      diagnosisStatus: "suspected",
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
        dateOfBirth: data.dateOfBirth,
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        location: data.location,
        
        // Employment Information
        isEmployed: data.isEmployed,
        workHours: data.workHours,
        incomeLevel: data.incomeLevel,
        
        diagnosisStatus: data.diagnosisStatus,
        misdiagnoses: data.misdiagnoses || [],
        diagnosisTimeline: data.diagnosisTimeline,
        hasFibers: data.hasFibers,
        otherDiseases: data.otherDiseases || [],
        
        // Enhanced Food Preferences
        foodDislikes: [...(data.foodDislikes || []), ...(data.customFoodDislikes ? [data.customFoodDislikes] : [])],
        foodFavorites: [...(data.foodFavorites || []), ...(data.customFoodFavorites ? [data.customFoodFavorites] : [])],
        foodAllergies: data.foodAllergies || [],
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

      return await apiRequest("PUT", "/api/profile/complete-onboarding", profileData);
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
    // Update form data with current state arrays
    const finalData = {
      ...data,
      misdiagnoses: commonMisdiagnoses,
      otherDiseases: commonDiseases,
      foodDislikes: foodDislikes,
      foodFavorites: foodFavorites,
      foodAllergies: foodAllergies,
      currentMedications: currentMedications,
      importantBirthdays: JSON.stringify(importantBirthdays),
    };
    
    onboardingMutation.mutate(finalData);
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

  // Helper functions for managing lists
  const addMisdiagnosis = (diagnosis: string) => {
    if (diagnosis && !commonMisdiagnoses.includes(diagnosis)) {
      setCommonMisdiagnoses([...commonMisdiagnoses, diagnosis]);
    }
  };

  const removeMisdiagnosis = (diagnosis: string) => {
    setCommonMisdiagnoses(commonMisdiagnoses.filter(d => d !== diagnosis));
  };

  const addDisease = (disease: string) => {
    if (disease && !commonDiseases.includes(disease)) {
      setCommonDiseases([...commonDiseases, disease]);
    }
  };

  const removeDisease = (disease: string) => {
    setCommonDiseases(commonDiseases.filter(d => d !== disease));
  };

  const addFoodItem = (item: string, type: 'dislikes' | 'favorites' | 'allergies') => {
    if (!item) return;
    
    if (type === 'dislikes' && !foodDislikes.includes(item)) {
      setFoodDislikes([...foodDislikes, item]);
    } else if (type === 'favorites' && !foodFavorites.includes(item)) {
      setFoodFavorites([...foodFavorites, item]);
    } else if (type === 'allergies' && !foodAllergies.includes(item)) {
      setFoodAllergies([...foodAllergies, item]);
    }
  };

  const removeFoodItem = (item: string, type: 'dislikes' | 'favorites' | 'allergies') => {
    if (type === 'dislikes') {
      setFoodDislikes(foodDislikes.filter(i => i !== item));
    } else if (type === 'favorites') {
      setFoodFavorites(foodFavorites.filter(i => i !== item));
    } else if (type === 'allergies') {
      setFoodAllergies(foodAllergies.filter(i => i !== item));
    }
  };

  const addMedication = (medication: string) => {
    if (medication && !currentMedications.includes(medication)) {
      setCurrentMedications([...currentMedications, medication]);
    }
  };

  const removeMedication = (medication: string) => {
    setCurrentMedications(currentMedications.filter(m => m !== medication));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-lg text-gray-600">Help Luna provide you with personalized support</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  index + 1 <= currentStep ? 'bg-primary border-primary text-white' : 'border-slate-300 text-slate-400'
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

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth (for birthday bonus points!)</Label>
                    <Input type="date" {...form.register("dateOfBirth")} />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-red-500 text-sm">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input type="number" {...form.register("age", { valueAsNumber: true })} />
                      {form.formState.errors.age && (
                        <p className="text-red-500 text-sm">{form.formState.errors.age.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select onValueChange={(value) => form.setValue("gender", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Height</Label>
                      <Input placeholder="e.g., 5'6&quot; or 168cm" {...form.register("height")} />
                      {form.formState.errors.height && (
                        <p className="text-red-500 text-sm">{form.formState.errors.height.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input placeholder="e.g., 150lbs or 68kg" {...form.register("weight")} />
                      {form.formState.errors.weight && (
                        <p className="text-red-500 text-sm">{form.formState.errors.weight.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Health */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location (City, State/Province)</Label>
                    <Input placeholder="e.g., Los Angeles, CA" {...form.register("location")} />
                    {form.formState.errors.location && (
                      <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                    )}
                  </div>

                  {/* Employment Information */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isEmployed"
                        checked={form.watch("isEmployed")}
                        onCheckedChange={(checked) => form.setValue("isEmployed", checked === true)}
                      />
                      <Label htmlFor="isEmployed">Currently employed</Label>
                    </div>

                    {form.watch("isEmployed") && (
                      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                        <div>
                          <Label htmlFor="workHours">Work Schedule</Label>
                          <Input 
                            placeholder="e.g., 9am-5pm, Night shift, Part-time"
                            {...form.register("workHours")} 
                          />
                        </div>

                        <div>
                          <Label>Income Level (Optional)</Label>
                          <Select onValueChange={(value) => form.setValue("incomeLevel", value as any)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select income level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low income</SelectItem>
                              <SelectItem value="middle">Middle income</SelectItem>
                              <SelectItem value="high">High income</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Medical History */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Diagnosis Status</Label>
                    <RadioGroup
                      value={form.watch("diagnosisStatus")}
                      onValueChange={(value) => form.setValue("diagnosisStatus", value as any)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="diagnosed" id="diagnosed" />
                        <Label htmlFor="diagnosed">Officially diagnosed with Morgellons Disease</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="suspected" id="suspected" />
                        <Label htmlFor="suspected">Self-diagnosed or suspected Morgellons Disease</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="diagnosisTimeline">Diagnosis Timeline (Optional)</Label>
                    <Input 
                      placeholder="e.g., Diagnosed 2 years ago, symptoms for 5 years"
                      {...form.register("diagnosisTimeline")}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasFibers"
                      checked={form.watch("hasFibers")}
                      onCheckedChange={(checked) => form.setValue("hasFibers", checked === true)}
                    />
                    <Label htmlFor="hasFibers">I have observed fibers emerging from my skin</Label>
                  </div>

                  {/* Previous Misdiagnoses */}
                  <div>
                    <Label className="text-base font-semibold">Previous Misdiagnoses (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-3">Select any conditions you were previously diagnosed with before Morgellons:</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {MISDIAGNOSES_OPTIONS.map((diagnosis) => (
                        <Button
                          key={diagnosis}
                          type="button"
                          variant={commonMisdiagnoses.includes(diagnosis) ? "default" : "outline"}
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => 
                            commonMisdiagnoses.includes(diagnosis) 
                              ? removeMisdiagnosis(diagnosis)
                              : addMisdiagnosis(diagnosis)
                          }
                        >
                          {diagnosis}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Other Diseases */}
                  <div>
                    <Label className="text-base font-semibold">Other Health Conditions (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-3">Select any other health conditions you have:</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {OTHER_DISEASES_OPTIONS.map((disease) => (
                        <Button
                          key={disease}
                          type="button"
                          variant={commonDiseases.includes(disease) ? "default" : "outline"}
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => 
                            commonDiseases.includes(disease) 
                              ? removeDisease(disease)
                              : addDisease(disease)
                          }
                        >
                          {disease}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Current Medications */}
                  <div>
                    <Label className="text-base font-semibold">Current Medications (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-3">Select medications you're currently taking:</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {MEDICATIONS_OPTIONS.map((medication) => (
                        <Button
                          key={medication}
                          type="button"
                          variant={currentMedications.includes(medication) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => 
                            currentMedications.includes(medication) 
                              ? removeMedication(medication)
                              : addMedication(medication)
                          }
                        >
                          {medication}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add custom medication" />
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
                </div>
              )}

              {/* Step 4: Food & Lifestyle */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Food Dislikes */}
                  <div>
                    <Label className="text-base font-semibold">Food Dislikes (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-3">Select foods you typically avoid or dislike:</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {FOOD_DISLIKES_OPTIONS.map((food) => (
                        <Button
                          key={food}
                          type="button"
                          variant={foodDislikes.includes(food) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => 
                            foodDislikes.includes(food) 
                              ? removeFoodItem(food, 'dislikes')
                              : addFoodItem(food, 'dislikes')
                          }
                        >
                          {food}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add custom food dislike" />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addFoodItem(input.value, 'dislikes');
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Food Favorites */}
                  <div>
                    <Label className="text-base font-semibold">Food Favorites (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-3">Select foods you enjoy eating:</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {FOOD_FAVORITES_OPTIONS.map((food) => (
                        <Button
                          key={food}
                          type="button"
                          variant={foodFavorites.includes(food) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => 
                            foodFavorites.includes(food) 
                              ? removeFoodItem(food, 'favorites')
                              : addFoodItem(food, 'favorites')
                          }
                        >
                          {food}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add custom food favorite" />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addFoodItem(input.value, 'favorites');
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Food Allergies */}
                  <div>
                    <Label className="text-base font-semibold">Food Allergies (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-3">Select any food allergies you have:</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {FOOD_ALLERGIES_OPTIONS.map((allergen) => (
                        <Button
                          key={allergen}
                          type="button"
                          variant={foodAllergies.includes(allergen) ? "destructive" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => 
                            foodAllergies.includes(allergen) 
                              ? removeFoodItem(allergen, 'allergies')
                              : addFoodItem(allergen, 'allergies')
                          }
                        >
                          {allergen}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add custom food allergy" />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addFoodItem(input.value, 'allergies');
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Lifestyle Habits */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Lifestyle Habits</h3>
                    
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
                        value={form.watch("exerciseFrequency") || "rarely"} 
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
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="occasionally">Occasionally</SelectItem>
                              <SelectItem value="socially">Socially only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Alcohol Questions */}
                  {form.watch("alcoholHabit") && (
                    <div className="space-y-4 bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900">Alcohol Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="alcoholDuration">How long have you been drinking regularly?</Label>
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
                          <Label htmlFor="alcoholFrequency">How often do you drink?</Label>
                          <Select onValueChange={(value) => form.setValue("alcoholFrequency", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="socially">Socially only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="relationshipStatus">Relationship Status (Optional)</Label>
                    <Select onValueChange={(value) => form.setValue("relationshipStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="dating">Dating</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasChildren"
                        checked={form.watch("hasChildren")}
                        onCheckedChange={(checked) => form.setValue("hasChildren", checked === true)}
                      />
                      <Label htmlFor="hasChildren">I have children</Label>
                    </div>

                    {form.watch("hasChildren") && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div>
                          <Label htmlFor="childrenCount">Number of children</Label>
                          <Input 
                            type="number"
                            {...form.register("childrenCount", { valueAsNumber: true })}
                            placeholder="e.g., 2"
                          />
                        </div>
                        <div className="mt-3">
                          <Label htmlFor="childrenAges">Ages of children (Optional)</Label>
                          <Input 
                            {...form.register("childrenAges")}
                            placeholder="e.g., 5, 8, 12"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasSiblings"
                        checked={form.watch("hasSiblings")}
                        onCheckedChange={(checked) => form.setValue("hasSiblings", checked === true)}
                      />
                      <Label htmlFor="hasSiblings">I have siblings</Label>
                    </div>

                    {form.watch("hasSiblings") && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div>
                          <Label htmlFor="siblingsCount">Number of siblings</Label>
                          <Input 
                            type="number"
                            {...form.register("siblingsCount", { valueAsNumber: true })}
                            placeholder="e.g., 2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Important Birthdays */}
                  <ImportantBirthdaysManager 
                    onUpdate={(birthdays) => setImportantBirthdays(birthdays)}
                  />

                  {/* Social Preferences */}
                  <div>
                    <Label htmlFor="socialPreferences">Social Preferences (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">How do you prefer to socialize and connect with others?</p>
                    <Textarea 
                      {...form.register("socialPreferences")}
                      placeholder="e.g., small groups, one-on-one conversations, online communities, outdoor activities..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Hobbies & Interests */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-purple-700">Tell Luna About Your Interests!</h3>
                    <p className="text-sm text-slate-600">
                      This helps Luna have more personalized conversations and provide better support
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="hobbies">Hobbies & Interests (Optional)</Label>
                    <p className="text-sm text-slate-600 mb-2">What do you enjoy doing?</p>
                    <Textarea 
                      {...form.register("hobbies")}
                      placeholder="e.g., reading, gardening, painting, hiking, cooking, photography, music, crafts, gaming..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <Button type="button" onClick={prevStep} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={onboardingMutation.isPending}
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