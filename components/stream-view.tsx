'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToastNotifications } from '@/components/ui/toast';
import { AlertCircle, Copy, Download, FileText, Loader2, RefreshCw } from 'lucide-react';

interface StreamViewProps {
  prompt: string;
  onComplete?: () => void;
}

// Error types for better error handling
interface StreamError {
  code: string;
  message: string;
  retryable: boolean;
}

export function StreamView({ prompt, onComplete }: StreamViewProps) {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<StreamError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { showError, showSuccess, showWarning } = useToastNotifications();

  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  useEffect(() => {
    if (prompt) {
      startStreaming();
    }
  }, [prompt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const parseErrorResponse = async (response: Response): Promise<StreamError> => {
    try {
      const errorData = await response.json();
      return {
        code: errorData.error?.code || 'UNKNOWN_ERROR',
        message: errorData.error?.message || 'An unknown error occurred',
        retryable: response.status >= 500 || response.status === 429
      };
    } catch {
      return {
        code: 'PARSE_ERROR',
        message: 'Failed to parse error response',
        retryable: response.status >= 500
      };
    }
  };

  const startStreaming = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
    } else {
      setRetryCount(0);
    }

    setIsStreaming(true);
    setIsComplete(false);
    setError(null);
    
    if (!isRetry) {
      setContent('');
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const streamError = await parseErrorResponse(response);
        setError(streamError);
        
        if (streamError.retryable && retryCount < maxRetries) {
          showWarning('Connection issue', 'Retrying in a moment...');
          setTimeout(() => {
            startStreaming(true);
          }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return;
        } else {
          showError('Generation failed', streamError.message);
          setContent(prev => prev + `\n\n[Error: ${streamError.message}]`);
        }
        return;
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let hasReceivedContent = false;

      try {
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          if (chunk.trim()) {
            hasReceivedContent = true;
            setContent(prev => prev + chunk);
          }
        }

        if (!hasReceivedContent) {
          throw new Error('No content received from server');
        }

        setIsComplete(true);
        showSuccess('Plan generated successfully!', 'Your capstone plan is ready');
        onComplete?.();
      } catch (readError) {
        if (readError instanceof Error && readError.name === 'AbortError') {
          console.log('Stream aborted');
          return;
        }
        throw readError;
      }
    } catch (error) {
      console.error('Streaming error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        const streamError: StreamError = {
          code: 'NETWORK_ERROR',
          message: error.message.includes('fetch') 
            ? 'Network connection failed. Please check your internet connection.'
            : 'An error occurred while generating content.',
          retryable: true
        };
        
        setError(streamError);
        
        if (streamError.retryable && retryCount < maxRetries) {
          showWarning('Connection issue', 'Retrying in a moment...');
          setTimeout(() => {
            startStreaming(true);
          }, retryDelay * Math.pow(2, retryCount));
          return;
        } else {
          showError('Generation failed', streamError.message);
          setContent(prev => prev + `\n\n[Error: ${streamError.message}]`);
        }
      }
    } finally {
      setIsStreaming(false);
      setIsRetrying(false);
      abortControllerRef.current = null;
    }
  }, [prompt, retryCount, maxRetries, retryDelay, showError, showSuccess, showWarning, onComplete]);

  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      startStreaming(true);
    } else {
      // Reset and try again
      setRetryCount(0);
      startStreaming();
    }
  }, [startStreaming, retryCount, maxRetries]);

  const copyToClipboard = async () => {
    try {
      if (!content.trim()) {
        showError('Nothing to copy', 'No content available to copy');
        return;
      }

      await navigator.clipboard.writeText(content);
      showSuccess('Copied to clipboard', 'Content has been copied to your clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      showError('Copy failed', 'Failed to copy content to clipboard. Please try again.');
    }
  };

  const downloadMarkdown = () => {
    try {
      if (!content.trim()) {
        showError('Nothing to download', 'No content available to download');
        return;
      }

      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `capstone-plan-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Download started', 'Markdown file is being downloaded');
    } catch (error) {
      console.error('Failed to download:', error);
      showError('Download failed', 'Failed to download file. Please try again.');
    }
  };

  const downloadPDF = async () => {
    if (!content.trim()) {
      showError('Nothing to download', 'No content available to download as PDF');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = contentRef.current;
      if (!element) {
        throw new Error('Content element not found');
      }

      // Create a clean copy of the content for PDF generation
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Remove any interactive elements that might cause issues
      const buttons = clonedElement.querySelectorAll('button');
      buttons.forEach(btn => btn.remove());
      
      // Set up PDF options
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `capstone-plan-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate and save PDF
      await html2pdf().set(opt).from(clonedElement).save();
      showSuccess('PDF generated', 'PDF file has been downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      showError('PDF generation failed', 'Failed to generate PDF. Please try downloading as Markdown instead.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatContent = (text: string) => {
    // Convert markdown-like formatting to HTML
    let formatted = text
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6 text-primary border-b-2 border-primary pb-3">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4 text-primary">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mt-6 mb-3 text-gray-800">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-medium mt-4 mb-2 text-gray-700">$1</h4>')
      // Horizontal rules (---) - only for standalone lines
      .replace(/^---$/gim, '<hr class="my-8 border-t-2 border-gray-300">')
      .replace(/^---\s*$/gim, '<hr class="my-8 border-t-2 border-gray-300">')
      // Lists - improved formatting
      .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-2 list-disc">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-6 mb-2 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-2 list-decimal">$1</li>')
      // Bold and italic - improved styling
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4 border-l-4 border-blue-500"><code class="text-sm">$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Tables
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map((cell: string) => cell.trim());
        return `<tr>${cells.map((cell: string) => `<td class="border px-3 py-2">${cell}</td>`).join('')}</tr>`;
      })
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
      .replace(/\n/g, '<br>');

    // Wrap list items in ul/ol tags
    formatted = formatted.replace(/(<li class="ml-6 mb-2 list-disc">.*<\/li>)/g, (match) => {
      return `<ul class="space-y-2 my-4">${match}</ul>`;
    });
    
    formatted = formatted.replace(/(<li class="ml-6 mb-2 list-decimal">.*<\/li>)/g, (match) => {
      return `<ol class="space-y-2 my-4">${match}</ol>`;
    });

    return formatted;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  {isStreaming && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Capstone Project Plan
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {isStreaming ? 'AI is generating your personalized plan...' : isComplete ? 'Plan generated successfully!' : 'Ready to generate'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors border-yellow-300"
                >
                  {isRetrying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!content}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadMarkdown}
                disabled={!content}
                className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Markdown
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPDF}
                disabled={!content || isGeneratingPDF}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div
            ref={contentRef}
            className="prose prose-lg max-w-none"
            style={{
              minHeight: '500px',
              lineHeight: '1.7',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            {error && !content ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Generation Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {error.message}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : content ? (
              <div
                className="markdown-content animate-in fade-in-50 duration-500"
                dangerouslySetInnerHTML={{
                  __html: `<div class="space-y-6">${formatContent(content)}</div>`
                }}
              />
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {isStreaming ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    <FileText className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {isStreaming ? 'Generating your capstone plan...' : 'No content generated yet.'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {isStreaming ? 'Please wait while our AI creates a comprehensive plan for your project.' : 'Fill out the form above to generate your personalized capstone plan.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
