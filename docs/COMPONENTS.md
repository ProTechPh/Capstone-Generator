# Component Documentation

This document provides comprehensive documentation for all React components in the AI Capstone Generator application.

## Overview

The application is built using a component-based architecture with reusable UI components from Shadcn UI and custom business logic components. All components are built with TypeScript for type safety and follow React best practices.

## Component Architecture

```
components/
├── ui/                    # Reusable UI components (Shadcn UI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── textarea.tsx
│   └── toast.tsx
├── capstone-form.tsx      # Main form component
├── error-boundary.tsx     # Error handling component
└── stream-view.tsx        # Streaming results display
```

## UI Components (Shadcn UI)

These components are based on Shadcn UI and provide the foundational UI elements for the application.

### Button

A versatile button component with multiple variants and sizes.

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

#### Usage

```tsx
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click me</Button>

// With variant and size
<Button variant="outline" size="lg">
  Large Outline Button
</Button>

// With icon
<Button variant="destructive">
  <TrashIcon className="h-4 w-4 mr-2" />
  Delete
</Button>
```

### Card

A container component for grouping related content.

#### Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
```

#### Usage

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

### Input

A form input component with consistent styling.

#### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

#### Usage

```tsx
import { Input } from '@/components/ui/input';

<Input 
  type="text" 
  placeholder="Enter your text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Select

A dropdown select component built on Radix UI.

#### Props

```typescript
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}
```

#### Usage

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Textarea

A multi-line text input component.

#### Props

```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
```

#### Usage

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea 
  placeholder="Enter your message"
  rows={4}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Separator

A visual separator component.

#### Props

```typescript
interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}
```

#### Usage

```tsx
import { Separator } from '@/components/ui/separator';

<Separator className="my-4" />
```

### Toast

A notification system for displaying messages to users.

#### Props

```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

#### Usage

```tsx
import { useToastNotifications } from '@/components/ui/toast';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToastNotifications();

  const handleSuccess = () => {
    showSuccess('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    showError('Error!', 'Something went wrong');
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
    </div>
  );
}
```

## Business Logic Components

### CapstoneForm

The main form component for collecting user input for capstone project generation.

#### Props

```typescript
interface CapstoneFormProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}
```

#### Features

- **URL State Management**: Form data persists in URL using nuqs
- **Real-time Validation**: Input validation with immediate feedback
- **Input Sanitization**: XSS protection and input cleaning
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

#### Form Fields

1. **Project Topic** (Required)
   - Type: Text input
   - Validation: 5-200 characters, no script tags
   - Purpose: Brief description of the capstone project

2. **Academic Discipline** (Required)
   - Type: Select dropdown
   - Options: Predefined list of academic disciplines
   - Purpose: Tailors the generated plan to field conventions

3. **Project Duration** (Required)
   - Type: Select dropdown
   - Options: Various time periods (8 weeks to 2 semesters)
   - Purpose: Creates realistic timelines and milestones

4. **Constraints & Requirements** (Optional)
   - Type: Textarea
   - Validation: Max 1000 characters, no script tags
   - Purpose: Specific limitations, technologies, or requirements

5. **Preferred Deliverables** (Optional)
   - Type: Select dropdown
   - Options: Various deliverable combinations
   - Purpose: Influences plan structure and focus

#### Usage

```tsx
import { CapstoneForm } from '@/components/capstone-form';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (prompt: string) => {
    setIsGenerating(true);
    // Handle generation logic
  };

  return (
    <CapstoneForm 
      onGenerate={handleGenerate}
      isGenerating={isGenerating}
    />
  );
}
```

#### Validation Logic

```typescript
// Topic validation
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
  if (/<script|javascript:|data:/i.test(topic)) {
    return 'Invalid characters detected in topic';
  }
  return undefined;
};

// Constraints validation
const validateConstraints = (constraints: string): string | undefined => {
  if (constraints && constraints.length > 1000) {
    return 'Constraints must be less than 1000 characters';
  }
  if (constraints && /<script|javascript:|data:/i.test(constraints)) {
    return 'Invalid characters detected in constraints';
  }
  return undefined;
};
```

### StreamView

Component for displaying streaming AI-generated content with export functionality.

#### Props

```typescript
interface StreamViewProps {
  prompt: string;
  onComplete?: () => void;
}
```

#### Features

- **Real-time Streaming**: Displays content as it's generated
- **Export Functionality**: Copy to clipboard, download as Markdown or PDF
- **Error Handling**: Retry mechanism with exponential backoff
- **Markdown Formatting**: Converts markdown to styled HTML
- **Responsive Design**: Works on all screen sizes

#### State Management

```typescript
interface StreamViewState {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  isGeneratingPDF: boolean;
  error: StreamError | null;
  retryCount: number;
  isRetrying: boolean;
}

interface StreamError {
  code: string;
  message: string;
  retryable: boolean;
}
```

#### Usage

```tsx
import { StreamView } from '@/components/stream-view';

function ResultsPage() {
  const [prompt, setPrompt] = useState('');

  const handleComplete = () => {
    console.log('Generation completed');
  };

  return (
    <StreamView 
      prompt={prompt}
      onComplete={handleComplete}
    />
  );
}
```

#### Export Functions

```typescript
// Copy to clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(content);
    showSuccess('Copied to clipboard', 'Content has been copied');
  } catch (error) {
    showError('Copy failed', 'Failed to copy content');
  }
};

// Download as Markdown
const downloadMarkdown = () => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `capstone-plan-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Generate PDF
const downloadPDF = async () => {
  const html2pdf = (await import('html2pdf.js')).default;
  const element = contentRef.current;
  
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `capstone-plan-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  await html2pdf().set(opt).from(element).save();
};
```

#### Markdown Formatting

```typescript
const formatContent = (text: string) => {
  let formatted = text
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mt-6 mb-3">$1</h3>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-2 list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-2 list-decimal">$1</li>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded">$1</code>');

  return formatted;
};
```

### ErrorBoundary

React error boundary for catching and handling errors gracefully.

#### Props

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

#### Features

- **Automatic Error Catching**: Catches JavaScript errors in component tree
- **Retry Mechanism**: Allows users to retry failed operations
- **Development Details**: Shows detailed error information in development
- **Production Safety**: Hides sensitive information in production
- **Custom Fallback**: Supports custom error UI

#### Usage

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

function App() {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  };

  return (
    <ErrorBoundary onError={handleError}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

#### Error Boundary Hook

```tsx
import { useErrorHandler } from '@/components/error-boundary';

function MyComponent() {
  const { handleError, resetError } = useErrorHandler();

  const riskyOperation = async () => {
    try {
      // Risky operation
    } catch (error) {
      handleError(error as Error);
    }
  };

  return (
    <div>
      <Button onClick={riskyOperation}>Risky Operation</Button>
      <Button onClick={resetError}>Reset Error</Button>
    </div>
  );
}
```

#### Higher-Order Component

```tsx
import { withErrorBoundary } from '@/components/error-boundary';

const MyComponent = () => {
  return <div>My Component</div>;
};

const MyComponentWithErrorBoundary = withErrorBoundary(MyComponent, {
  onError: (error, errorInfo) => {
    console.error('Error in MyComponent:', error, errorInfo);
  }
});
```

## Component Best Practices

### 1. TypeScript Usage

- Always define proper interfaces for props
- Use generic types where appropriate
- Leverage TypeScript's strict mode

```tsx
interface ComponentProps {
  title: string;
  count?: number;
  onAction: (id: string) => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, count = 0, onAction }) => {
  // Component implementation
};
```

### 2. Error Handling

- Implement proper error boundaries
- Handle async operations gracefully
- Provide meaningful error messages

```tsx
const [error, setError] = useState<string | null>(null);

const handleAsyncOperation = async () => {
  try {
    setError(null);
    await riskyOperation();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  }
};
```

### 3. Accessibility

- Use semantic HTML elements
- Provide ARIA labels and descriptions
- Ensure keyboard navigation works
- Test with screen readers

```tsx
<button
  aria-label="Generate capstone plan"
  aria-describedby="generate-description"
  onClick={handleGenerate}
>
  Generate Plan
</button>
<div id="generate-description">
  Click to generate your personalized capstone project plan
</div>
```

### 4. Performance

- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Avoid unnecessary re-renders

```tsx
const ExpensiveComponent = React.memo(({ data }: { data: ComplexData }) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);

  return <div>{processedData}</div>;
});
```

### 5. State Management

- Use appropriate state management patterns
- Keep state as local as possible
- Use URL state for shareable data

```tsx
// Local state for UI
const [isLoading, setIsLoading] = useState(false);

// URL state for shareable data
const [topic, setTopic] = useQueryState('topic', { defaultValue: '' });
```

## Testing Components

### Unit Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CapstoneForm } from '@/components/capstone-form';

test('renders form fields', () => {
  render(<CapstoneForm onGenerate={jest.fn()} isGenerating={false} />);
  
  expect(screen.getByLabelText(/project topic/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/academic discipline/i)).toBeInTheDocument();
});

test('validates required fields', () => {
  const onGenerate = jest.fn();
  render(<CapstoneForm onGenerate={onGenerate} isGenerating={false} />);
  
  fireEvent.click(screen.getByText(/generate capstone plan/i));
  
  expect(screen.getByText(/project topic is required/i)).toBeInTheDocument();
  expect(onGenerate).not.toHaveBeenCalled();
});
```

### Integration Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { StreamView } from '@/components/stream-view';

test('displays streaming content', async () => {
  // Mock fetch for streaming response
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ value: new TextEncoder().encode('Hello'), done: false })
            .mockResolvedValueOnce({ value: new TextEncoder().encode(' World'), done: false })
            .mockResolvedValueOnce({ value: undefined, done: true })
        })
      }
    })
  );

  render(<StreamView prompt="Test prompt" />);
  
  await waitFor(() => {
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## Component Library Integration

The application uses Shadcn UI components which are built on top of Radix UI primitives. This provides:

- **Accessibility**: Built-in ARIA support and keyboard navigation
- **Customization**: Easy theming with CSS variables
- **Consistency**: Unified design system across components
- **Type Safety**: Full TypeScript support

### Adding New Components

1. **Install from Shadcn UI**:
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

2. **Create Custom Component**:
   ```tsx
   // components/ui/custom-component.tsx
   import { cn } from '@/lib/utils';
   
   interface CustomComponentProps {
     className?: string;
     children: React.ReactNode;
   }
   
   export function CustomComponent({ className, children }: CustomComponentProps) {
     return (
       <div className={cn('custom-styles', className)}>
         {children}
       </div>
     );
   }
   ```

3. **Export from Index**:
   ```tsx
   // components/ui/index.ts
   export { CustomComponent } from './custom-component';
   ```

This documentation provides comprehensive coverage of all components in the application, including their props, usage examples, and best practices for development and testing.
