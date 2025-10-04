# Usage Examples and Best Practices

This document provides comprehensive examples and best practices for using the AI Capstone Generator application.

## Table of Contents

- [Basic Usage Examples](#basic-usage-examples)
- [Advanced Usage Patterns](#advanced-usage-patterns)
- [Integration Examples](#integration-examples)
- [Best Practices](#best-practices)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting Examples](#troubleshooting-examples)

## Basic Usage Examples

### 1. Simple Capstone Plan Generation

**Scenario**: A Computer Science student needs a plan for a machine learning project.

```typescript
// Form data
const formData = {
  topic: "Machine Learning for Healthcare Diagnosis",
  discipline: "Computer Science",
  duration: "16 weeks",
  constraints: "Must use Python, budget under $500, team of 2 people",
  deliverables: "Software application + documentation"
};

// Generated prompt
const prompt = buildUserPrompt(formData);
console.log(prompt);
```

**Expected Output Structure**:
```markdown
# Capstone Project Plan

## 1. Project Overview
- **Project Title:** AI-Powered Healthcare Diagnosis System
- **Academic Discipline:** Computer Science
- **Duration:** 16 weeks
- **Brief Description:** A machine learning system that assists healthcare professionals in diagnosing medical conditions using patient data and medical imaging.
- **Key Learning Outcomes:** Advanced machine learning techniques, healthcare data analysis, system integration, and medical AI ethics.

---

## 2. Project Objectives
### Core Objectives
- Develop a machine learning model for medical diagnosis
- Create a user-friendly interface for healthcare professionals
- Implement data privacy and security measures
- Validate the system's accuracy and reliability

### Technical Objectives
- Build a robust ML pipeline using Python
- Integrate with existing healthcare systems
- Implement real-time data processing
- Create comprehensive documentation

### Functional Objectives
- Support multiple medical imaging formats
- Provide confidence scores for diagnoses
- Enable batch processing of patient data
- Generate detailed reports for medical professionals

---
...
```

### 2. Engineering Project Example

**Scenario**: An Engineering student working on an IoT project.

```typescript
const engineeringFormData = {
  topic: "Smart Home Energy Management System",
  discipline: "Engineering",
  duration: "20 weeks",
  constraints: "Must use Arduino/Raspberry Pi, integrate with existing home systems, budget under $300",
  deliverables: "Prototype + technical report"
};

const prompt = buildUserPrompt(engineeringFormData);
```

**Key Features of Generated Plan**:
- Hardware requirements and specifications
- Sensor integration details
- Energy efficiency calculations
- Safety considerations
- Prototype development timeline

### 3. Business Administration Project

**Scenario**: A Business student creating a market analysis project.

```typescript
const businessFormData = {
  topic: "Market Analysis for Sustainable Fashion",
  discipline: "Business Administration",
  duration: "12 weeks",
  constraints: "Focus on European market, include competitor analysis, team of 3 people",
  deliverables: "Research paper + presentation"
};

const prompt = buildUserPrompt(businessFormData);
```

**Generated Plan Includes**:
- Market research methodology
- Data collection strategies
- Financial analysis frameworks
- Presentation structure
- Stakeholder engagement plan

## Advanced Usage Patterns

### 1. Custom Prompt Engineering

**Scenario**: You want to customize the AI prompt for specific requirements.

```typescript
// Custom prompt building function
function buildCustomPrompt(formData: CapstoneFormData, customInstructions: string): string {
  const basePrompt = buildUserPrompt(formData);
  
  return `${basePrompt}

ADDITIONAL REQUIREMENTS:
${customInstructions}

Please ensure the plan addresses these specific requirements and includes detailed implementation strategies.`;
}

// Usage
const customInstructions = `
- Include specific technology stack recommendations
- Provide detailed cost breakdown
- Include risk mitigation strategies for each phase
- Add timeline with specific milestones
- Include quality assurance procedures
`;

const customPrompt = buildCustomPrompt(formData, customInstructions);
```

### 2. Streaming Response Handling

**Scenario**: Implementing custom streaming response processing.

```typescript
import { SSEParser } from '@/lib/sse';

class CustomStreamProcessor {
  private parser: SSEParser;
  private onToken: (token: string) => void;
  private onComplete: () => void;
  private onError: (error: Error) => void;

  constructor(
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) {
    this.parser = new SSEParser();
    this.onToken = onToken;
    this.onComplete = onComplete;
    this.onError = onError;
  }

  async processStream(response: Response): Promise<void> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    try {
      while (true) {
        const { value, done } = await reader.read();
        
        if (done) {
          // Process any remaining data
          const finalTokens = this.parser.flush();
          finalTokens.forEach(token => this.onToken(token));
          this.onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const tokens = this.parser.parseChunk(chunk);
        
        tokens.forEach(token => this.onToken(token));
      }
    } catch (error) {
      this.onError(error as Error);
    }
  }
}

// Usage
const processor = new CustomStreamProcessor(
  (token) => console.log('Token:', token),
  () => console.log('Stream complete'),
  (error) => console.error('Stream error:', error)
);

fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: userPrompt })
})
.then(response => processor.processStream(response));
```

### 3. Error Handling with Retry Logic

**Scenario**: Implementing robust error handling with exponential backoff.

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

class RetryableAPI {
  private config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = config;
  }

  async generateWithRetry(prompt: string): Promise<string> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.error.message}`);
        }

        // Process streaming response
        return await this.processStreamingResponse(response);
        
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.maxRetries) {
          const delay = Math.min(
            this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt),
            this.config.maxDelay
          );
          
          console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }

  private async processStreamingResponse(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const parser = new SSEParser();
    let content = '';

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        const finalTokens = parser.flush();
        finalTokens.forEach(token => content += token);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const tokens = parser.parseChunk(chunk);
      tokens.forEach(token => content += token);
    }

    return content;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const retryableAPI = new RetryableAPI({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
});

try {
  const content = await retryableAPI.generateWithRetry(prompt);
  console.log('Generated content:', content);
} catch (error) {
  console.error('Failed after all retries:', error);
}
```

## Integration Examples

### 1. React Hook for Capstone Generation

**Scenario**: Creating a reusable React hook for capstone generation.

```typescript
import { useState, useCallback } from 'react';
import { buildUserPrompt, CapstoneFormData } from '@/lib/prompt';

interface UseCapstoneGenerationReturn {
  generatePlan: (formData: CapstoneFormData) => Promise<void>;
  content: string;
  isGenerating: boolean;
  error: string | null;
  retry: () => void;
}

export function useCapstoneGeneration(): UseCapstoneGenerationReturn {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<CapstoneFormData | null>(null);

  const generatePlan = useCallback(async (formData: CapstoneFormData) => {
    setIsGenerating(true);
    setError(null);
    setContent('');
    setLastFormData(formData);

    try {
      const prompt = buildUserPrompt(formData);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const parser = new SSEParser();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) {
          const finalTokens = parser.flush();
          finalTokens.forEach(token => setContent(prev => prev + token));
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const tokens = parser.parseChunk(chunk);
        tokens.forEach(token => setContent(prev => prev + token));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (lastFormData) {
      generatePlan(lastFormData);
    }
  }, [lastFormData, generatePlan]);

  return {
    generatePlan,
    content,
    isGenerating,
    error,
    retry
  };
}

// Usage in component
function CapstoneGenerator() {
  const { generatePlan, content, isGenerating, error, retry } = useCapstoneGeneration();

  const handleSubmit = (formData: CapstoneFormData) => {
    generatePlan(formData);
  };

  return (
    <div>
      <CapstoneForm onSubmit={handleSubmit} disabled={isGenerating} />
      
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
      
      {content && <StreamView content={content} />}
    </div>
  );
}
```

### 2. Custom Export Functionality

**Scenario**: Adding custom export formats beyond the built-in options.

```typescript
interface ExportOptions {
  format: 'markdown' | 'html' | 'json' | 'docx';
  includeMetadata: boolean;
  customTemplate?: string;
}

class CustomExporter {
  async exportContent(content: string, options: ExportOptions): Promise<void> {
    switch (options.format) {
      case 'markdown':
        this.exportMarkdown(content, options);
        break;
      case 'html':
        this.exportHTML(content, options);
        break;
      case 'json':
        this.exportJSON(content, options);
        break;
      case 'docx':
        await this.exportDocx(content, options);
        break;
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private exportMarkdown(content: string, options: ExportOptions): void {
    let exportContent = content;
    
    if (options.includeMetadata) {
      const metadata = this.generateMetadata();
      exportContent = `${metadata}\n\n${content}`;
    }

    const blob = new Blob([exportContent], { type: 'text/markdown' });
    this.downloadBlob(blob, 'capstone-plan.md');
  }

  private exportHTML(content: string, options: ExportOptions): void {
    const htmlContent = this.markdownToHTML(content);
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Capstone Project Plan</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
            h2 { color: #1e40af; }
            h3 { color: #1e3a8a; }
            code { background: #f3f4f6; padding: 2px 4px; border-radius: 3px; }
            pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; }
            ul, ol { margin: 16px 0; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          ${options.includeMetadata ? this.generateMetadataHTML() : ''}
          ${htmlContent}
        </body>
      </html>
    `;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    this.downloadBlob(blob, 'capstone-plan.html');
  }

  private exportJSON(content: string, options: ExportOptions): void {
    const jsonData = {
      metadata: options.includeMetadata ? this.generateMetadata() : null,
      content: content,
      sections: this.parseSections(content),
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    this.downloadBlob(blob, 'capstone-plan.json');
  }

  private async exportDocx(content: string, options: ExportOptions): Promise<void> {
    // This would require a library like docx or mammoth
    // For now, we'll export as HTML and let the user convert
    console.warn('DOCX export not implemented, falling back to HTML');
    this.exportHTML(content, options);
  }

  private markdownToHTML(markdown: string): string {
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  private parseSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = line.replace('## ', '');
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  }

  private generateMetadata(): string {
    return `---
title: Capstone Project Plan
generated: ${new Date().toISOString()}
version: 1.0.0
---`;
  }

  private generateMetadataHTML(): string {
    return `
      <div class="metadata">
        <h1>Capstone Project Plan</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Version:</strong> 1.0.0</p>
      </div>
    `;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Usage
const exporter = new CustomExporter();

exporter.exportContent(content, {
  format: 'html',
  includeMetadata: true
});
```

### 3. Integration with External Services

**Scenario**: Integrating with project management tools or learning management systems.

```typescript
interface ProjectManagementIntegration {
  exportToTrello(content: string): Promise<void>;
  exportToAsana(content: string): Promise<void>;
  exportToNotion(content: string): Promise<void>;
}

class ProjectManagementExporter implements ProjectManagementIntegration {
  async exportToTrello(content: string): Promise<void> {
    const sections = this.parseSections(content);
    
    // Create Trello board structure
    const boardData = {
      name: 'Capstone Project Plan',
      lists: [
        {
          name: 'Planning & Research',
          cards: this.createCardsFromSection(sections['Project Timeline']?.split('Phase 1')[1])
        },
        {
          name: 'Development',
          cards: this.createCardsFromSection(sections['Project Timeline']?.split('Phase 2')[1])
        },
        {
          name: 'Testing & Refinement',
          cards: this.createCardsFromSection(sections['Project Timeline']?.split('Phase 3')[1])
        },
        {
          name: 'Final Presentation',
          cards: this.createCardsFromSection(sections['Project Timeline']?.split('Phase 4')[1])
        }
      ]
    };

    // This would integrate with Trello API
    console.log('Exporting to Trello:', boardData);
  }

  async exportToAsana(content: string): Promise<void> {
    const sections = this.parseSections(content);
    
    // Create Asana project structure
    const projectData = {
      name: 'Capstone Project Plan',
      tasks: this.createTasksFromSections(sections)
    };

    // This would integrate with Asana API
    console.log('Exporting to Asana:', projectData);
  }

  async exportToNotion(content: string): Promise<void> {
    const sections = this.parseSections(content);
    
    // Create Notion page structure
    const notionData = {
      title: 'Capstone Project Plan',
      blocks: this.createNotionBlocks(sections)
    };

    // This would integrate with Notion API
    console.log('Exporting to Notion:', notionData);
  }

  private parseSections(content: string): Record<string, string> {
    // Implementation similar to previous example
    return {};
  }

  private createCardsFromSection(sectionContent?: string): any[] {
    if (!sectionContent) return [];
    
    // Parse section content and create Trello cards
    return sectionContent
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => ({
        name: line.replace('- ', '').trim(),
        desc: 'Generated from capstone plan'
      }));
  }

  private createTasksFromSections(sections: Record<string, string>): any[] {
    // Convert sections to Asana tasks
    return Object.entries(sections).map(([title, content]) => ({
      name: title,
      notes: content,
      completed: false
    }));
  }

  private createNotionBlocks(sections: Record<string, string>): any[] {
    // Convert sections to Notion blocks
    return Object.entries(sections).map(([title, content]) => ({
      type: 'heading_2',
      heading_2: {
        text: [{ type: 'text', text: { content: title } }]
      }
    }));
  }
}
```

## Best Practices

### 1. Form Validation

```typescript
// Comprehensive form validation
class FormValidator {
  private static readonly VALIDATION_RULES = {
    topic: {
      required: true,
      minLength: 5,
      maxLength: 200,
      pattern: /^[^<>]*$/,
      message: 'Topic must be 5-200 characters without HTML tags'
    },
    constraints: {
      required: false,
      maxLength: 1000,
      pattern: /^[^<>]*$/,
      message: 'Constraints must be under 1000 characters without HTML tags'
    }
  };

  static validateForm(formData: CapstoneFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validate topic
    const topicRule = this.VALIDATION_RULES.topic;
    if (topicRule.required && !formData.topic.trim()) {
      errors.topic = 'Project topic is required';
    } else if (formData.topic.length < topicRule.minLength) {
      errors.topic = `Topic must be at least ${topicRule.minLength} characters`;
    } else if (formData.topic.length > topicRule.maxLength) {
      errors.topic = `Topic must be less than ${topicRule.maxLength} characters`;
    } else if (!topicRule.pattern.test(formData.topic)) {
      errors.topic = topicRule.message;
    }

    // Validate constraints
    const constraintsRule = this.VALIDATION_RULES.constraints;
    if (formData.constraints && formData.constraints.length > constraintsRule.maxLength) {
      errors.constraints = `Constraints must be less than ${constraintsRule.maxLength} characters`;
    } else if (formData.constraints && !constraintsRule.pattern.test(formData.constraints)) {
      errors.constraints = constraintsRule.message;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
```

### 2. Error Handling

```typescript
// Centralized error handling
class ErrorHandler {
  static handle(error: unknown, context: string): void {
    const errorInfo = this.categorizeError(error);
    
    // Log error
    console.error(`Error in ${context}:`, errorInfo);
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorInfo, context);
    }
    
    // Show user-friendly message
    this.showUserMessage(errorInfo);
  }

  private static categorizeError(error: unknown): ErrorInfo {
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return {
          type: 'NETWORK_ERROR',
          message: 'Network connection failed. Please check your internet connection.',
          retryable: true
        };
      }
      
      if (error.message.includes('API Error')) {
        return {
          type: 'API_ERROR',
          message: 'Service temporarily unavailable. Please try again later.',
          retryable: true
        };
      }
      
      return {
        type: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        retryable: false
      };
    }
    
    return {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      retryable: false
    };
  }

  private static reportError(errorInfo: ErrorInfo, context: string): void {
    // Send to error tracking service
    // errorTrackingService.captureException(error, { extra: { context, errorInfo } });
  }

  private static showUserMessage(errorInfo: ErrorInfo): void {
    // Show toast notification or error message
    // toast.error(errorInfo.message);
  }
}

interface ErrorInfo {
  type: string;
  message: string;
  retryable: boolean;
}
```

### 3. Performance Optimization

```typescript
// Performance monitoring and optimization
class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer ${name} was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    console.log(`${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    return fn().finally(() => this.endTimer(name));
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      return fn();
    } finally {
      this.endTimer(name);
    }
  }
}

// Usage
const result = await PerformanceMonitor.measureAsync('capstone-generation', async () => {
  return await generateCapstonePlan(formData);
});
```

### 4. Accessibility Best Practices

```typescript
// Accessibility utilities
class AccessibilityHelper {
  static announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  static focusElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

// Usage in components
function MyComponent() {
  const handleGenerationComplete = () => {
    AccessibilityHelper.announceToScreenReader('Capstone plan generation completed');
    AccessibilityHelper.focusElement('[data-testid="generated-content"]');
  };

  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

## Common Use Cases

### 1. Academic Project Planning

**Scenario**: A student needs to plan a semester-long research project.

```typescript
const researchProjectData = {
  topic: "Impact of Social Media on Mental Health in College Students",
  discipline: "Psychology",
  duration: "1 semester",
  constraints: "Must include IRB approval, survey of 100+ students, statistical analysis",
  deliverables: "Research paper + presentation"
};

// The generated plan will include:
// - Literature review methodology
// - Research design and methodology
// - Data collection procedures
// - Statistical analysis plan
// - IRB application timeline
// - Presentation preparation
```

### 2. Software Development Project

**Scenario**: A Computer Science student building a web application.

```typescript
const softwareProjectData = {
  topic: "E-commerce Platform with AI Recommendations",
  discipline: "Software Engineering",
  duration: "20 weeks",
  constraints: "Must use React/Node.js, implement payment processing, deploy to cloud",
  deliverables: "Software application + documentation"
};

// Generated plan includes:
// - Technology stack selection
// - Database design
// - API development timeline
// - Frontend development phases
// - Testing strategies
// - Deployment procedures
```

### 3. Engineering Design Project

**Scenario**: An Engineering student designing a sustainable energy system.

```typescript
const engineeringProjectData = {
  topic: "Solar-Powered Water Purification System",
  discipline: "Engineering",
  duration: "24 weeks",
  constraints: "Must be portable, cost under $200, serve 10+ people, use sustainable materials",
  deliverables: "Prototype + technical report"
};

// Plan includes:
// - System requirements analysis
// - Component selection and sourcing
// - Design iterations and testing
// - Cost analysis and optimization
// - Environmental impact assessment
// - Prototype construction timeline
```

## Troubleshooting Examples

### 1. Common API Errors

```typescript
// Error handling for common API issues
class APIErrorHandler {
  static async handleAPIError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));
    
    switch (response.status) {
      case 400:
        throw new Error(`Invalid request: ${errorData.error?.message || 'Bad request'}`);
      
      case 401:
        throw new Error('Authentication failed. Please check your API key.');
      
      case 429:
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      
      case 500:
        throw new Error('Server error. Please try again later.');
      
      case 503:
        throw new Error('Service temporarily unavailable. Please try again later.');
      
      default:
        throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
    }
  }
}

// Usage
try {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    await APIErrorHandler.handleAPIError(response);
  }

  // Process successful response
} catch (error) {
  console.error('API Error:', error.message);
  // Show user-friendly error message
}
```

### 2. Streaming Issues

```typescript
// Debugging streaming problems
class StreamDebugger {
  static logStreamProgress(chunk: string, tokens: string[]): void {
    console.group('Stream Debug');
    console.log('Raw chunk:', chunk);
    console.log('Parsed tokens:', tokens);
    console.log('Token count:', tokens.length);
    console.groupEnd();
  }

  static validateStreamHealth(parser: SSEParser): boolean {
    const errorCount = parser.getErrorCount();
    if (errorCount > 5) {
      console.warn(`High error count: ${errorCount}`);
      return false;
    }
    return true;
  }

  static handleStreamInterruption(): void {
    console.warn('Stream interrupted, attempting recovery...');
    // Implement recovery logic
  }
}

// Usage in streaming
const parser = new SSEParser();
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  const tokens = parser.parseChunk(chunk);
  
  // Debug logging
  StreamDebugger.logStreamProgress(chunk, tokens);
  
  // Health check
  if (!StreamDebugger.validateStreamHealth(parser)) {
    StreamDebugger.handleStreamInterruption();
    break;
  }
  
  // Process tokens
  tokens.forEach(token => {
    // Update UI
  });
}
```

### 3. Form Validation Issues

```typescript
// Debugging form validation
class FormDebugger {
  static logValidationState(formData: CapstoneFormData, errors: Record<string, string>): void {
    console.group('Form Validation Debug');
    console.log('Form data:', formData);
    console.log('Validation errors:', errors);
    console.log('Form valid:', Object.keys(errors).length === 0);
    console.groupEnd();
  }

  static validateField(fieldName: string, value: string): string | null {
    const rules = {
      topic: { min: 5, max: 200, pattern: /^[^<>]*$/ },
      constraints: { max: 1000, pattern: /^[^<>]*$/ }
    };

    const rule = rules[fieldName as keyof typeof rules];
    if (!rule) return null;

    if (rule.min && value.length < rule.min) {
      return `${fieldName} must be at least ${rule.min} characters`;
    }
    
    if (rule.max && value.length > rule.max) {
      return `${fieldName} must be less than ${rule.max} characters`;
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${fieldName} contains invalid characters`;
    }

    return null;
  }
}

// Usage
const formData = { topic: 'Test', discipline: 'CS', duration: '8 weeks', constraints: '', deliverables: '' };
const errors = {};

Object.entries(formData).forEach(([field, value]) => {
  const error = FormDebugger.validateField(field, value);
  if (error) {
    errors[field] = error;
  }
});

FormDebugger.logValidationState(formData, errors);
```

This comprehensive examples document provides practical usage patterns, integration examples, and troubleshooting guidance for developers working with the AI Capstone Generator application.
