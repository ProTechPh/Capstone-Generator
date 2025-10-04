'use client';

import { useState, useCallback } from 'react';
import { useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { buildUserPrompt, type CapstoneFormData } from '@/lib/prompt';
import { useToastNotifications } from '@/components/ui/toast';
import { 
  AlertCircle,
  BookOpen, 
  Calendar,
  Clock, 
  FileText, 
  GraduationCap,
  Lightbulb, 
  Sparkles,
  Target
} from 'lucide-react';

interface CapstoneFormProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const DISCIPLINES = [
  'Computer Science',
  'Engineering',
  'Business Administration',
  'Data Science',
  'Cybersecurity',
  'Software Engineering',
  'Information Systems',
  'Digital Marketing',
  'Project Management',
  'Other'
];

const DURATIONS = [
  '8 weeks',
  '12 weeks',
  '16 weeks',
  '20 weeks',
  '24 weeks',
  '1 semester',
  '2 semesters'
];

const DELIVERABLES_OPTIONS = [
  'Software application + documentation',
  'Research paper + presentation',
  'Prototype + technical report',
  'Case study + analysis',
  'System design + implementation',
  'Portfolio + reflection',
  'Other'
];

// Form validation types
interface FormErrors {
  topic?: string;
  discipline?: string;
  duration?: string;
  constraints?: string;
  deliverables?: string;
}

// Input validation functions
const validateTopic = (topic: string): string | undefined => {
  if (!topic.trim()) {
    return 'Project topic is required';
  }
  if (topic.trim().length < 5) {
    return 'Project topic must be at least 5 characters long';
  }
  if (topic.length > 200) {
    return 'Project topic must be less than 200 characters';
  }
  // Check for potentially harmful content
  if (/<script|javascript:|data:/i.test(topic)) {
    return 'Invalid characters detected in topic';
  }
  return undefined;
};

const validateConstraints = (constraints: string): string | undefined => {
  if (constraints && constraints.length > 1000) {
    return 'Constraints must be less than 1000 characters';
  }
  if (constraints && /<script|javascript:|data:/i.test(constraints)) {
    return 'Invalid characters detected in constraints';
  }
  return undefined;
};

export function CapstoneForm({ onGenerate, isGenerating }: CapstoneFormProps) {
  // URL state management with nuqs
  const [topic, setTopic] = useQueryState('topic', { defaultValue: '' });
  const [discipline, setDiscipline] = useQueryState('discipline', { defaultValue: '' });
  const [constraints, setConstraints] = useQueryState('constraints', { defaultValue: '' });
  const [duration, setDuration] = useQueryState('duration', { defaultValue: '' });
  const [deliverables, setDeliverables] = useQueryState('deliverables', { defaultValue: '' });

  // Form state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useToastNotifications();

  // Validate form fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    const topicError = validateTopic(topic);
    if (topicError) newErrors.topic = topicError;

    if (!discipline) {
      newErrors.discipline = 'Academic discipline is required';
    }

    if (!duration) {
      newErrors.duration = 'Project duration is required';
    }

    // Validate optional fields
    const constraintsError = validateConstraints(constraints);
    if (constraintsError) newErrors.constraints = constraintsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [topic, discipline, duration, constraints]);

  // Handle field changes with validation
  const handleTopicChange = useCallback((value: string) => {
    setTopic(value);
    if (errors.topic) {
      const error = validateTopic(value);
      setErrors(prev => ({ ...prev, topic: error }));
    }
  }, [setTopic, errors.topic]);

  const handleConstraintsChange = useCallback((value: string) => {
    setConstraints(value);
    if (errors.constraints) {
      const error = validateConstraints(value);
      setErrors(prev => ({ ...prev, constraints: error }));
    }
  }, [setConstraints, errors.constraints]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validate form
    if (!validateForm()) {
      showError('Please fix the errors below', 'Some required fields are missing or invalid');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: CapstoneFormData = {
        topic: topic.trim(),
        discipline,
        constraints: constraints.trim() || 'No specific constraints',
        duration,
        deliverables: deliverables || 'Standard capstone deliverables'
      };

      const prompt = buildUserPrompt(formData);
      onGenerate(prompt);
      showSuccess('Form submitted successfully', 'Your capstone plan is being generated');
    } catch (error) {
      console.error('Form submission error:', error);
      showError('Submission failed', 'An error occurred while processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Your Capstone Plan
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fill out the details below and let AI generate a comprehensive, personalized capstone project plan for you
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Topic */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <label htmlFor="topic" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Project Topic *
                  </label>
                </div>
                <div className="space-y-2">
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    placeholder="e.g., Machine Learning for Healthcare, E-commerce Platform, IoT Security"
                    className={`h-12 text-base border-2 transition-colors ${
                      errors.topic 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    required
                  />
                  {errors.topic && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.topic}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Discipline */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <label htmlFor="discipline" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Academic Discipline *
                  </label>
                </div>
                <div className="space-y-2">
                  <Select 
                    value={discipline} 
                    onValueChange={setDiscipline} 
                    required
                  >
                    <SelectTrigger className={`h-12 text-base border-2 transition-colors ${
                      errors.discipline 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-purple-500'
                    }`}>
                      <SelectValue placeholder="Select your discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCIPLINES.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.discipline && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.discipline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Duration */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <label htmlFor="duration" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Project Duration *
                  </label>
                </div>
                <div className="space-y-2">
                  <Select 
                    value={duration} 
                    onValueChange={setDuration} 
                    required
                  >
                    <SelectTrigger className={`h-12 text-base border-2 transition-colors ${
                      errors.duration 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-green-500'
                    }`}>
                      <SelectValue placeholder="Select project duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.duration && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Deliverables */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <label htmlFor="deliverables" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Preferred Deliverables
                  </label>
                </div>
                <Select 
                  value={deliverables} 
                  onValueChange={setDeliverables}
                >
                  <SelectTrigger className="h-12 text-base border-2 focus:border-orange-500 transition-colors">
                    <SelectValue placeholder="Select preferred deliverables" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERABLES_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Constraints & Requirements */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <label htmlFor="constraints" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Constraints & Requirements
                  </label>
                </div>
                <div className="space-y-2">
                  <Textarea
                    id="constraints"
                    value={constraints}
                    onChange={(e) => handleConstraintsChange(e.target.value)}
                    placeholder="e.g., Must use specific technologies, budget limitations, team size, accessibility requirements"
                    rows={4}
                    className={`text-base border-2 transition-colors resize-none ${
                      errors.constraints 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-red-500'
                    }`}
                  />
                  {errors.constraints && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.constraints}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="text-center">
              <Button 
                type="submit" 
                className="w-full md:w-auto px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                size="lg"
                disabled={isGenerating || isSubmitting}
              >
                {(isGenerating || isSubmitting) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {isSubmitting ? 'Submitting...' : 'Generating Your Plan...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-3" />
                    Generate Capstone Plan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
