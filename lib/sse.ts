/**
 * Parse OpenRouter SSE (Server-Sent Events) stream and extract content tokens
 */
export class SSEParser {
  private buffer = '';
  private errorCount = 0;
  private readonly maxErrors = 10;

  parseChunk(chunk: string): string[] {
    const tokens: string[] = [];
    
    // Validate input
    if (typeof chunk !== 'string') {
      console.warn('SSE parser received non-string chunk:', typeof chunk);
      return tokens;
    }
    
    // Add chunk to buffer
    this.buffer += chunk;
    
    // Prevent buffer from growing too large (circuit breaker)
    if (this.buffer.length > 100000) {
      console.warn('SSE buffer too large, resetting');
      this.buffer = '';
      this.errorCount++;
      return tokens;
    }
    
    // Split by lines and process each line
    const lines = this.buffer.split('\n');
    
    // Keep the last line in buffer as it might be incomplete
    this.buffer = lines.pop() || '';
    
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.startsWith(':')) {
        continue;
      }
      
      // Look for data lines
      if (line.startsWith('data: ')) {
        const data = line.slice(6); // Remove 'data: ' prefix
        
        // Skip [DONE] marker
        if (data === '[DONE]') {
          continue;
        }
        
        try {
          const parsed = JSON.parse(data);
          
          // Validate parsed structure
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid JSON structure');
          }
          
          // Extract content from OpenRouter response format
          if (parsed.choices && Array.isArray(parsed.choices) && parsed.choices[0]) {
            const choice = parsed.choices[0];
            if (choice.delta && typeof choice.delta === 'object') {
              const content = choice.delta.content;
              if (content && typeof content === 'string') {
                tokens.push(content);
              }
            }
          }
          
          // Reset error count on successful parse
          this.errorCount = 0;
        } catch (error) {
          this.errorCount++;
          
          // Only log errors for complete lines that should be valid JSON
          // Skip logging for obviously truncated data
          if (data.length > 50 && !data.includes('"finish_reason":null') && data.endsWith('}')) {
            console.warn('Failed to parse SSE data:', data.substring(0, 100) + '...');
          }
          
          // Circuit breaker: stop processing if too many errors
          if (this.errorCount >= this.maxErrors) {
            console.error('Too many SSE parsing errors, stopping processing');
            throw new Error('SSE parsing failed due to too many errors');
          }
        }
      }
    }
    
    return tokens;
  }

  flush(): string[] {
    // Process any remaining data in buffer
    if (this.buffer.trim()) {
      try {
        return this.parseChunk('\n');
      } catch (error) {
        console.warn('Error during SSE flush:', error);
        return [];
      }
    }
    return [];
  }

  // Reset parser state
  reset(): void {
    this.buffer = '';
    this.errorCount = 0;
  }

  // Get current error count
  getErrorCount(): number {
    return this.errorCount;
  }
}

// Legacy function for backward compatibility
export function parseOpenRouterSSE(chunk: string): string[] {
  const parser = new SSEParser();
  return parser.parseChunk(chunk);
}
