import { NextRequest } from 'next/server';
import { SSEParser } from '@/lib/sse';

export const runtime = 'nodejs';

// Error types for better error handling
interface APIError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

// Input validation
function validatePrompt(prompt: unknown): { isValid: boolean; error?: string } {
  if (!prompt) {
    return { isValid: false, error: 'Prompt is required' };
  }
  
  if (typeof prompt !== 'string') {
    return { isValid: false, error: 'Prompt must be a string' };
  }
  
  if (prompt.trim().length === 0) {
    return { isValid: false, error: 'Prompt cannot be empty' };
  }
  
  if (prompt.length > 10000) {
    return { isValid: false, error: 'Prompt is too long (max 10,000 characters)' };
  }
  
  return { isValid: true };
}

// Retry logic for network calls
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      // Retry on server errors (5xx) or network issues
      if (response.ok || attempt === maxRetries) {
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Create standardized error response
function createErrorResponse(error: APIError): Response {
  const errorBody = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {})
    }
  };
  
  return new Response(JSON.stringify(errorBody), {
    status: error.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return createErrorResponse({
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
        status: 400,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    const { prompt } = requestBody;
    
    // Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      return createErrorResponse({
        code: 'INVALID_PROMPT',
        message: validation.error!,
        status: 400
      });
    }

    // Check API key configuration
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OpenRouter API key not configured');
      return createErrorResponse({
        code: 'CONFIGURATION_ERROR',
        message: 'Service configuration error. Please contact support.',
        status: 500
      });
    }

    // Make request to OpenRouter with retry logic
    const upstream = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_APP_TITLE || 'Capstone Generator',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'alibaba/tongyi-deepresearch-30b-a3b:free',
        stream: true,
        messages: [
          {
            role: 'user',
            content: prompt.trim()
          }
        ]
      })
    });

    // Handle different error scenarios
    if (!upstream.ok) {
      let errorMessage = 'Failed to generate content';
      let errorCode = 'UPSTREAM_ERROR';
      
      if (upstream.status === 401) {
        errorMessage = 'Authentication failed with AI service';
        errorCode = 'AUTH_ERROR';
      } else if (upstream.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        errorCode = 'RATE_LIMIT';
      } else if (upstream.status === 503) {
        errorMessage = 'AI service temporarily unavailable. Please try again later.';
        errorCode = 'SERVICE_UNAVAILABLE';
      } else if (upstream.status >= 500) {
        errorMessage = 'AI service error. Please try again later.';
        errorCode = 'UPSTREAM_SERVER_ERROR';
      }
      
      console.error('OpenRouter API error:', upstream.status, upstream.statusText);
      return createErrorResponse({
        code: errorCode,
        message: errorMessage,
        status: upstream.status >= 500 ? 502 : 400,
        details: { 
          upstreamStatus: upstream.status,
          upstreamStatusText: upstream.statusText 
        }
      });
    }

    if (!upstream.body) {
      return createErrorResponse({
        code: 'NO_RESPONSE_BODY',
        message: 'No response body from AI service',
        status: 502
      });
    }

    // Create a readable stream that processes the upstream response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const sseParser = new SSEParser();
        let hasError = false;

        try {
          while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
              // Process any remaining buffered data
              try {
                const finalTokens = sseParser.flush();
                for (const token of finalTokens) {
                  controller.enqueue(new TextEncoder().encode(token));
                }
              } catch (flushError) {
                console.warn('Error flushing final tokens:', flushError);
              }
              break;
            }

            try {
              // Decode the chunk with error handling
              const chunk = decoder.decode(value, { stream: true });
              
              // Parse SSE and extract tokens using buffered parser
              const tokens = sseParser.parseChunk(chunk);
              
              // Send each token as a separate chunk
              for (const token of tokens) {
                if (token && token.trim()) {
                  controller.enqueue(new TextEncoder().encode(token));
                }
              }
            } catch (chunkError) {
              console.warn('Error processing chunk:', chunkError);
              // Continue processing other chunks instead of failing completely
              continue;
            }
          }
        } catch (error) {
          hasError = true;
          console.error('Stream processing error:', error);
          
          // Send error message to client
          const errorMessage = '\n\n[Error: Content generation was interrupted. Please try again.]';
          controller.enqueue(new TextEncoder().encode(errorMessage));
        } finally {
          try {
            if (!hasError) {
              controller.close();
            } else {
              controller.error(new Error('Stream processing failed'));
            }
          } catch (closeError) {
            console.error('Error closing stream:', closeError);
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    
    // Determine error type and create appropriate response
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return createErrorResponse({
          code: 'REQUEST_TIMEOUT',
          message: 'Request timed out. Please try again.',
          status: 408
        });
      }
      
      if (error.message.includes('fetch')) {
        return createErrorResponse({
          code: 'NETWORK_ERROR',
          message: 'Network error occurred. Please check your connection and try again.',
          status: 503
        });
      }
    }
    
    return createErrorResponse({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      status: 500,
      details: { 
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : 'Unknown error' })
      }
    });
  }
}
