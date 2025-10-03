'use client';

import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { buildUserPrompt, type CapstoneFormData } from '@/lib/prompt';
import { 
  BookOpen, 
  Clock, 
  Target, 
  FileText, 
  Lightbulb, 
  Sparkles,
  GraduationCap,
  Calendar,
  CheckCircle
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

export function CapstoneForm({ onGenerate, isGenerating }: CapstoneFormProps) {
  // URL state management with nuqs
  const [topic, setTopic] = useQueryState('topic', { defaultValue: '' });
  const [discipline, setDiscipline] = useQueryState('discipline', { defaultValue: '' });
  const [constraints, setConstraints] = useQueryState('constraints', { defaultValue: '' });
  const [duration, setDuration] = useQueryState('duration', { defaultValue: '' });
  const [deliverables, setDeliverables] = useQueryState('deliverables', { defaultValue: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic || !discipline || !duration) {
      alert('Please fill in the required fields: Topic, Discipline, and Duration');
      return;
    }

    const formData: CapstoneFormData = {
      topic,
      discipline,
      constraints: constraints || 'No specific constraints',
      duration,
      deliverables: deliverables || 'Standard capstone deliverables'
    };

    const prompt = buildUserPrompt(formData);
    onGenerate(prompt);
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
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Machine Learning for Healthcare, E-commerce Platform, IoT Security"
                  className="h-12 text-base border-2 focus:border-blue-500 transition-colors"
                  required
                />
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
                <Select value={discipline} onValueChange={setDiscipline} required>
                  <SelectTrigger className="h-12 text-base border-2 focus:border-purple-500 transition-colors">
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
                <Select value={duration} onValueChange={setDuration} required>
                  <SelectTrigger className="h-12 text-base border-2 focus:border-green-500 transition-colors">
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
                <Select value={deliverables} onValueChange={setDeliverables}>
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
                <Textarea
                  id="constraints"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g., Must use specific technologies, budget limitations, team size, accessibility requirements"
                  rows={4}
                  className="text-base border-2 focus:border-red-500 transition-colors resize-none"
                />
              </div>
            </div>

            <Separator className="my-8" />

            <div className="text-center">
              <Button 
                type="submit" 
                className="w-full md:w-auto px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                size="lg"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating Your Plan...
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
