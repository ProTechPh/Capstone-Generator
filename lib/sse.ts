/**
 * Parse OpenRouter SSE (Server-Sent Events) stream and extract content tokens
 */
export class SSEParser {
  private buffer = '';

  parseChunk(chunk: string): string[] {
    const tokens: string[] = [];
    
    // Add chunk to buffer
    this.buffer += chunk;
    
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
          
          // Extract content from OpenRouter response format
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
            const content = parsed.choices[0].delta.content;
            if (content) {
              tokens.push(content);
            }
          }
        } catch (error) {
          // Only log errors for complete lines that should be valid JSON
          // Skip logging for obviously truncated data
          if (data.length > 50 && !data.includes('"finish_reason":null') && data.endsWith('}')) {
            console.warn('Failed to parse SSE data:', data.substring(0, 100) + '...');
          }
        }
      }
    }
    
    return tokens;
  }

  flush(): string[] {
    // Process any remaining data in buffer
    if (this.buffer.trim()) {
      return this.parseChunk('\n');
    }
    return [];
  }
}

// Legacy function for backward compatibility
export function parseOpenRouterSSE(chunk: string): string[] {
  const parser = new SSEParser();
  return parser.parseChunk(chunk);
}
