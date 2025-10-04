# Utility Functions and Libraries

This document provides comprehensive documentation for all utility functions and libraries used in the AI Capstone Generator application.

## Overview

The application includes several utility modules that provide common functionality across components. These utilities handle prompt building, Server-Sent Events parsing, and general helper functions.

## Library Structure

```
lib/
├── prompt.ts          # AI prompt building logic
├── sse.ts            # Server-Sent Events parser
└── utils.ts          # General utility functions
```

## Prompt Building (`lib/prompt.ts`)

The prompt building module handles the construction of AI prompts from user form data.

### Interfaces

```typescript
export interface CapstoneFormData {
  topic: string;
  discipline: string;
  constraints: string;
  duration: string;
  deliverables: string;
}
```

### Constants

#### System Prompt

The system prompt defines the AI's role and the expected output format:

```typescript
export const SYSTEM_PROMPT = `You are an expert academic capstone project planner. Your role is to help students create comprehensive, well-structured capstone project plans.

IMPORTANT FORMATTING REQUIREMENTS:
- Use proper markdown syntax with clear hierarchy
- Use # for main headings, ## for subheadings, ### for sub-subheadings
- Use proper bullet points with - for lists
- Use **bold** for emphasis on key terms
- Use --- for horizontal separators between major sections
- Ensure consistent spacing and formatting
- Do NOT use inline --- separators within sentences
- Use numbered lists (1., 2., 3.) for sequential items
- Use bullet points (-) for non-sequential items

For each request, provide a detailed response with the following sections in this exact order:

# Capstone Project Plan

## 1. Project Overview
- **Project Title:** [Clear, descriptive title]
- **Academic Discipline:** [Discipline name]
- **Duration:** [Project duration]
- **Brief Description:** [2-3 sentences describing the project]
- **Key Learning Outcomes:** [What the student will learn]

---

## 2. Project Objectives
### Core Objectives
- [Primary objective 1]
- [Primary objective 2]
- [Primary objective 3]

### Technical Objectives
- [Technical goal 1]
- [Technical goal 2]
- [Technical goal 3]

### Functional Objectives
- [Functional requirement 1]
- [Functional requirement 2]
- [Functional requirement 3]

---

## 3. Deliverables
### Primary Deliverables
- [Main deliverable 1]
- [Main deliverable 2]
- [Main deliverable 3]

### Documentation
- [Documentation requirement 1]
- [Documentation requirement 2]
- [Documentation requirement 3]

### Presentation Materials
- [Presentation item 1]
- [Presentation item 2]

---

## 4. Project Timeline
### Phase 1: Planning & Research (Weeks 1-3)
- [Week 1 tasks]
- [Week 2 tasks]
- [Week 3 tasks]

### Phase 2: Design & Development (Weeks 4-10)
- [Week 4-6 tasks]
- [Week 7-9 tasks]
- [Week 10 tasks]

### Phase 3: Testing & Refinement (Weeks 11-13)
- [Week 11 tasks]
- [Week 12 tasks]
- [Week 13 tasks]

### Phase 4: Final Presentation (Weeks 14-16)
- [Week 14-15 tasks]
- [Week 16 tasks]

---

## 5. Technical Requirements
### Software & Tools
- [Required software 1]
- [Required software 2]
- [Required software 3]

### Hardware & Equipment
- [Hardware requirement 1]
- [Hardware requirement 2]

### Development Environment
- [Environment setup 1]
- [Environment setup 2]

---

## 6. Resources & References
### Academic Sources
- [Academic reference 1]
- [Academic reference 2]
- [Academic reference 3]

### Industry Resources
- [Industry resource 1]
- [Industry resource 2]

### Online Resources
- [Online resource 1]
- [Online resource 2]

---

## 7. Risk Assessment & Mitigation
### Technical Risks
- **Risk:** [Technical risk description]
  - **Mitigation:** [How to address this risk]

### Timeline Risks
- **Risk:** [Timeline risk description]
  - **Mitigation:** [How to address this risk]

### Resource Constraints
- **Risk:** [Resource constraint description]
  - **Mitigation:** [How to address this risk]

---

## 8. Success Metrics
### Technical Metrics
- [Technical success criteria 1]
- [Technical success criteria 2]
- [Technical success criteria 3]

### Academic Metrics
- [Academic success criteria 1]
- [Academic success criteria 2]

### Impact Metrics
- [Impact measurement 1]
- [Impact measurement 2]

---

## 9. Next Steps
1. [Immediate action 1]
2. [Immediate action 2]
3. [Immediate action 3]
4. [Immediate action 4]

---

**Note:** This plan should be reviewed and adjusted based on your specific requirements and available resources.`;
```

### Functions

#### `buildUserPrompt(formData: CapstoneFormData): string`

Constructs a user prompt from form data that will be sent to the AI model.

**Parameters:**
- `formData`: Object containing user input from the form

**Returns:**
- `string`: Formatted prompt ready for AI processing

**Example:**

```typescript
import { buildUserPrompt } from '@/lib/prompt';

const formData = {
  topic: "Machine Learning for Healthcare",
  discipline: "Computer Science",
  constraints: "Must use Python, budget under $500",
  duration: "16 weeks",
  deliverables: "Software application + documentation"
};

const prompt = buildUserPrompt(formData);
console.log(prompt);
// Output: "Please create a comprehensive capstone project plan with the following requirements:
//
// **Topic Focus:** Machine Learning for Healthcare
//
// **Academic Discipline:** Computer Science
//
// **Project Duration:** 16 weeks
//
// **Key Constraints:** Must use Python, budget under $500
//
// **Preferred Deliverables:** Software application + documentation
//
// FORMATTING REQUIREMENTS:
// - Follow the exact markdown structure provided in the system prompt
// - Use proper markdown syntax with clear hierarchy (# ## ###)
// - Use --- for horizontal separators between major sections ONLY
// - Do NOT use inline --- separators within sentences or paragraphs
// - Use consistent bullet points (-) and numbered lists (1. 2. 3.)
// - Use **bold** for emphasis on key terms and labels
// - Ensure proper spacing between sections
// - Make the content clean, professional, and well-organized
//
// Please provide a detailed plan following the structured format with all sections. Make sure the timeline is realistic for the given duration and the deliverables are appropriate for the discipline and constraints mentioned."
```

**Implementation:**

```typescript
export function buildUserPrompt(formData: CapstoneFormData): string {
  const { topic, discipline, constraints, duration, deliverables } = formData;
  
  return `Please create a comprehensive capstone project plan with the following requirements:

**Topic Focus:** ${topic}

**Academic Discipline:** ${discipline}

**Project Duration:** ${duration}

**Key Constraints:** ${constraints}

**Preferred Deliverables:** ${deliverables}

FORMATTING REQUIREMENTS:
- Follow the exact markdown structure provided in the system prompt
- Use proper markdown syntax with clear hierarchy (# ## ###)
- Use --- for horizontal separators between major sections ONLY
- Do NOT use inline --- separators within sentences or paragraphs
- Use consistent bullet points (-) and numbered lists (1. 2. 3.)
- Use **bold** for emphasis on key terms and labels
- Ensure proper spacing between sections
- Make the content clean, professional, and well-organized

Please provide a detailed plan following the structured format with all sections. Make sure the timeline is realistic for the given duration and the deliverables are appropriate for the discipline and constraints mentioned.`;
}
```

## Server-Sent Events Parser (`lib/sse.ts`)

The SSE parser handles the parsing of streaming responses from the OpenRouter API.

### Classes

#### `SSEParser`

A class for parsing Server-Sent Events streams from OpenRouter API.

**Constructor:**
```typescript
const parser = new SSEParser();
```

**Properties:**
- `buffer: string` - Internal buffer for incomplete data
- `errorCount: number` - Number of parsing errors encountered
- `maxErrors: number` - Maximum allowed errors before stopping (default: 10)

**Methods:**

##### `parseChunk(chunk: string): string[]`

Parses a chunk of SSE data and extracts content tokens.

**Parameters:**
- `chunk: string` - Raw SSE data chunk

**Returns:**
- `string[]` - Array of extracted content tokens

**Example:**

```typescript
import { SSEParser } from '@/lib/sse';

const parser = new SSEParser();

// Simulate streaming data
const chunks = [
  'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
  'data: {"choices":[{"delta":{"content":" World"}}]}\n\n',
  'data: [DONE]\n\n'
];

for (const chunk of chunks) {
  const tokens = parser.parseChunk(chunk);
  console.log(tokens); // ['Hello'], [' World'], []
}
```

**Implementation Details:**

```typescript
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
```

##### `flush(): string[]`

Processes any remaining data in the buffer.

**Returns:**
- `string[]` - Array of remaining tokens

**Example:**

```typescript
const parser = new SSEParser();

// Add some data
parser.parseChunk('data: {"choices":[{"delta":{"content":"Hello"}}]}\n');

// Flush remaining data
const remainingTokens = parser.flush();
console.log(remainingTokens); // ['Hello']
```

##### `reset(): void`

Resets the parser state.

**Example:**

```typescript
const parser = new SSEParser();

// Use parser...
parser.parseChunk('some data');

// Reset for reuse
parser.reset();
```

##### `getErrorCount(): number`

Returns the current error count.

**Returns:**
- `number` - Current number of parsing errors

**Example:**

```typescript
const parser = new SSEParser();

// Check error count
const errors = parser.getErrorCount();
console.log(`Parser has ${errors} errors`);
```

### Legacy Function

#### `parseOpenRouterSSE(chunk: string): string[]`

Legacy function for backward compatibility. Creates a new parser instance and parses a single chunk.

**Parameters:**
- `chunk: string` - SSE data chunk to parse

**Returns:**
- `string[]` - Array of extracted tokens

**Example:**

```typescript
import { parseOpenRouterSSE } from '@/lib/sse';

const tokens = parseOpenRouterSSE('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n');
console.log(tokens); // ['Hello']
```

## General Utilities (`lib/utils.ts`)

The utils module provides common helper functions used throughout the application.

### Functions

#### `cn(...inputs: ClassValue[]): string`

Combines class names using clsx and tailwind-merge for conditional styling.

**Parameters:**
- `...inputs: ClassValue[]` - Class names or conditional class objects

**Returns:**
- `string` - Combined and deduplicated class string

**Example:**

```typescript
import { cn } from '@/lib/utils';

// Basic usage
const className = cn('base-class', 'additional-class');
console.log(className); // 'base-class additional-class'

// Conditional classes
const conditionalClass = cn(
  'base-class',
  {
    'active-class': isActive,
    'disabled-class': isDisabled
  }
);

// With Tailwind classes (conflict resolution)
const tailwindClass = cn('px-4 py-2', 'px-6'); // 'py-2 px-6' (px-6 overrides px-4)
```

**Implementation:**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Usage Examples

### Complete Prompt Building Workflow

```typescript
import { buildUserPrompt, SYSTEM_PROMPT } from '@/lib/prompt';

// 1. Collect form data
const formData = {
  topic: "IoT Security System",
  discipline: "Cybersecurity",
  constraints: "Must use Raspberry Pi, budget under $300",
  duration: "12 weeks",
  deliverables: "Prototype + technical report"
};

// 2. Build user prompt
const userPrompt = buildUserPrompt(formData);

// 3. Combine with system prompt for AI request
const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

// 4. Send to API
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: fullPrompt })
});
```

### Streaming Response Processing

```typescript
import { SSEParser } from '@/lib/sse';

async function processStreamingResponse(response: Response) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  const parser = new SSEParser();
  
  if (!reader) {
    throw new Error('No response body');
  }
  
  try {
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        // Process any remaining data
        const finalTokens = parser.flush();
        for (const token of finalTokens) {
          console.log('Final token:', token);
        }
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      const tokens = parser.parseChunk(chunk);
      
      for (const token of tokens) {
        console.log('Received token:', token);
        // Update UI with new content
      }
    }
  } catch (error) {
    console.error('Stream processing error:', error);
  }
}
```

### Error Handling with SSE Parser

```typescript
import { SSEParser } from '@/lib/sse';

function processWithErrorHandling(chunks: string[]) {
  const parser = new SSEParser();
  
  for (const chunk of chunks) {
    try {
      const tokens = parser.parseChunk(chunk);
      
      // Check for too many errors
      if (parser.getErrorCount() >= 5) {
        console.warn('Too many parsing errors, resetting parser');
        parser.reset();
        continue;
      }
      
      // Process tokens
      tokens.forEach(token => {
        console.log('Token:', token);
      });
      
    } catch (error) {
      console.error('Parser error:', error);
      
      // Reset parser on critical errors
      if (error.message.includes('too many errors')) {
        parser.reset();
      }
    }
  }
}
```

### Conditional Styling with cn Utility

```typescript
import { cn } from '@/lib/utils';

function Button({ variant, size, disabled, children }: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // Variant styles
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
        },
        
        // Size styles
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3': size === 'sm',
          'h-11 rounded-md px-8': size === 'lg',
        },
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

## Testing Utilities

### Testing SSE Parser

```typescript
import { SSEParser } from '@/lib/sse';

describe('SSEParser', () => {
  let parser: SSEParser;

  beforeEach(() => {
    parser = new SSEParser();
  });

  test('parses valid SSE data', () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n';
    const tokens = parser.parseChunk(chunk);
    
    expect(tokens).toEqual(['Hello']);
  });

  test('handles multiple chunks', () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" World"}}]}\n\n'
    ];
    
    const allTokens: string[] = [];
    chunks.forEach(chunk => {
      allTokens.push(...parser.parseChunk(chunk));
    });
    
    expect(allTokens).toEqual(['Hello', ' World']);
  });

  test('skips [DONE] marker', () => {
    const chunk = 'data: [DONE]\n\n';
    const tokens = parser.parseChunk(chunk);
    
    expect(tokens).toEqual([]);
  });

  test('handles malformed JSON gracefully', () => {
    const chunk = 'data: {"invalid": json}\n\n';
    const tokens = parser.parseChunk(chunk);
    
    expect(tokens).toEqual([]);
    expect(parser.getErrorCount()).toBe(1);
  });
});
```

### Testing Prompt Building

```typescript
import { buildUserPrompt } from '@/lib/prompt';

describe('buildUserPrompt', () => {
  test('builds prompt from form data', () => {
    const formData = {
      topic: 'Test Project',
      discipline: 'Computer Science',
      constraints: 'No constraints',
      duration: '8 weeks',
      deliverables: 'Software + docs'
    };

    const prompt = buildUserPrompt(formData);
    
    expect(prompt).toContain('Test Project');
    expect(prompt).toContain('Computer Science');
    expect(prompt).toContain('8 weeks');
    expect(prompt).toContain('No constraints');
    expect(prompt).toContain('Software + docs');
  });

  test('includes formatting requirements', () => {
    const formData = {
      topic: 'Test',
      discipline: 'Test',
      constraints: 'Test',
      duration: 'Test',
      deliverables: 'Test'
    };

    const prompt = buildUserPrompt(formData);
    
    expect(prompt).toContain('FORMATTING REQUIREMENTS');
    expect(prompt).toContain('markdown syntax');
    expect(prompt).toContain('horizontal separators');
  });
});
```

## Best Practices

### 1. Error Handling

- Always handle parsing errors gracefully
- Implement circuit breakers for repeated failures
- Provide meaningful error messages
- Log errors for debugging

### 2. Performance

- Use streaming for large responses
- Implement proper buffering strategies
- Avoid blocking operations in parsing loops
- Monitor memory usage with large buffers

### 3. Type Safety

- Use TypeScript interfaces for all data structures
- Validate input data before processing
- Handle edge cases and null values
- Use proper error types

### 4. Testing

- Test all utility functions thoroughly
- Mock external dependencies
- Test error conditions and edge cases
- Use integration tests for complex workflows

This documentation provides comprehensive coverage of all utility functions and libraries in the application, including their usage, implementation details, and best practices for development and testing.
