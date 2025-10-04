'use client';

import { useState } from 'react';
import { CapstoneForm } from '@/components/capstone-form';
import { StreamView } from '@/components/stream-view';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';
import { ArrowLeft, BookOpen, Clock, Sparkles, Target } from 'lucide-react';

export default function Home() {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = (prompt: string) => {
    setCurrentPrompt(prompt);
    setShowResults(true);
  };

  const handleComplete = () => {
    // Optional: Add any completion logic here
  };

  return (
    <ToastProvider>
      <ErrorBoundary>
        <main className="min-h-screen">
          {!showResults ? (
            <>
              {/* Hero Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative">
                  <div className="container mx-auto px-4 py-16 lg:py-24">
                    <div className="text-center space-y-8 max-w-4xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Capstone Planning
                      </div>
                      
                      <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                        AI Capstone Generator
                      </h1>
                      
                      <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Transform your academic journey with comprehensive capstone project plans. 
                        Get structured ideas, timelines, resources, and deliverables tailored to your discipline.
                      </p>

                      {/* Feature Cards */}
                      <div className="grid md:grid-cols-3 gap-6 mt-12">
                        <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto float">
                            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Comprehensive Planning</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Detailed project structure with milestones and deliverables</p>
                        </div>
                        
                        <div 
                          className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2" 
                          style={{ animationDelay: '0.5s' }}
                        >
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto float">
                            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Discipline-Specific</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Tailored recommendations for your academic field</p>
                        </div>
                        
                        <div 
                          className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2" 
                          style={{ animationDelay: '1s' }}
                        >
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto float">
                            <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Time-Optimized</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Realistic timelines and resource allocation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="container mx-auto px-4 py-16">
                <CapstoneForm 
                  onGenerate={handleGenerate}
                  isGenerating={false}
                />
              </div>
            </>
          ) : (
            <div className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <Button
                  onClick={() => setShowResults(false)}
                  variant="outline"
                  className="group"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to form
                </Button>
              </div>
              <StreamView 
                prompt={currentPrompt}
                onComplete={handleComplete}
              />
            </div>
          )}
        </main>
      </ErrorBoundary>
    </ToastProvider>
  );
}
