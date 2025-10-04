# Architecture Documentation

This document provides a comprehensive overview of the AI Capstone Generator's architecture, design decisions, and system components.

## Overview

The AI Capstone Generator is a modern web application built with Next.js 14, TypeScript, and React. It follows a component-based architecture with clear separation of concerns, providing a scalable and maintainable codebase.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │  External APIs  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   React     │ │◄──►│ │  Next.js    │ │◄──►│ │ OpenRouter  │ │
│ │ Components  │ │    │ │ API Routes  │ │    │ │    API      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │   State     │ │    │ │   SSE       │ │    │                 │
│ │ Management  │ │    │ │ Streaming   │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Page     │  │  Capstone   │  │   Stream    │         │
│  │ Components  │  │    Form     │  │    View     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Component Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    UI       │  │   Error     │  │   Toast     │         │
│  │ Components  │  │ Boundary    │  │  System     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Prompt    │  │     SSE     │  │   Utils     │         │
│  │  Builder    │  │   Parser    │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Design Decisions

### 1. Framework Choice: Next.js 14 with App Router

**Decision**: Use Next.js 14 with App Router instead of other frameworks.

**Rationale**:
- **Server-Side Rendering**: Better SEO and initial page load performance
- **API Routes**: Built-in API functionality without separate backend
- **File-based Routing**: Intuitive routing system
- **TypeScript Support**: Excellent TypeScript integration
- **Performance**: Automatic code splitting and optimization
- **Developer Experience**: Hot reloading, built-in linting, and debugging tools

**Benefits**:
- Faster initial page loads
- Better search engine optimization
- Simplified deployment
- Reduced complexity (no separate backend needed)

**Trade-offs**:
- Vendor lock-in to Vercel ecosystem (though deployable elsewhere)
- Learning curve for App Router (newer than Pages Router)

### 2. State Management: URL-based with nuqs

**Decision**: Use URL-based state management instead of Redux, Zustand, or Context API.

**Rationale**:
- **Shareability**: Users can share URLs with form data
- **Persistence**: Form data survives page refreshes
- **Simplicity**: No complex state management setup
- **SEO Benefits**: Search engines can index different states
- **User Experience**: Browser back/forward buttons work naturally

**Benefits**:
- Easy sharing and bookmarking
- No data loss on refresh
- Simplified state management
- Better user experience

**Trade-offs**:
- URL length limitations
- Sensitive data exposure in URLs
- Limited complex state management capabilities

### 3. Streaming Architecture: Server-Sent Events (SSE)

**Decision**: Use SSE for real-time content streaming instead of WebSockets or polling.

**Rationale**:
- **Simplicity**: Easier to implement than WebSockets
- **HTTP-based**: Works through firewalls and proxies
- **One-way Communication**: Perfect for AI content streaming
- **Automatic Reconnection**: Browser handles reconnection
- **Lower Overhead**: Less resource intensive than WebSockets

**Benefits**:
- Real-time user feedback
- Better perceived performance
- Simpler implementation
- Automatic error handling

**Trade-offs**:
- One-way communication only
- Limited browser support (though widely supported)
- Connection limits per domain

### 4. UI Framework: Shadcn UI + Radix UI

**Decision**: Use Shadcn UI components built on Radix UI instead of Material-UI, Ant Design, or custom components.

**Rationale**:
- **Accessibility**: Radix UI provides excellent accessibility out of the box
- **Customization**: Easy to customize with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Modern Design**: Clean, modern aesthetic
- **Copy-paste Approach**: Components can be customized per project

**Benefits**:
- Excellent accessibility compliance
- Highly customizable
- Modern, clean design
- Type-safe components

**Trade-offs**:
- Less comprehensive than larger UI libraries
- Requires more setup and configuration
- Smaller community compared to Material-UI

### 5. PDF Generation: Client-side with html2pdf.js

**Decision**: Generate PDFs on the client side instead of server-side solutions.

**Rationale**:
- **No Server Dependencies**: Reduces server complexity
- **Privacy**: Content never leaves the user's browser
- **Performance**: No server processing required
- **Cost**: No additional server resources needed
- **Offline Capability**: Works without internet connection

**Benefits**:
- Better privacy and security
- Reduced server load
- Lower infrastructure costs
- Works offline

**Trade-offs**:
- Limited formatting control
- Browser compatibility issues
- Larger client bundle size
- No server-side validation

## Data Flow

### 1. User Input Flow

```
User Input → Form Validation → URL State → Prompt Building → API Request
     ↓              ↓              ↓            ↓              ↓
Form Fields → Real-time → nuqs State → buildUserPrompt → /api/generate
Validation    Feedback    Management    Function        Endpoint
```

### 2. AI Generation Flow

```
API Request → OpenRouter → SSE Stream → Parser → UI Update
     ↓           ↓           ↓          ↓         ↓
/api/generate → AI Model → Chunked → SSEParser → StreamView
Endpoint       Response    Data      Class      Component
```

### 3. Error Handling Flow

```
Error Occurrence → Error Classification → User Notification → Recovery Action
       ↓                  ↓                    ↓                  ↓
Network/API/UI → Error Boundary/Toast → User Feedback → Retry/Reset
    Errors         Components          System         Mechanism
```

## Component Architecture

### Component Hierarchy

```
App (Root)
├── ToastProvider
├── ErrorBoundary
└── Main
    ├── Hero Section
    ├── CapstoneForm
    │   ├── Form Fields
    │   ├── Validation
    │   └── Submit Button
    └── StreamView
        ├── Content Display
        ├── Export Controls
        └── Error Handling
```

### Component Responsibilities

#### Page Components
- **`app/page.tsx`**: Main application page with routing logic
- **`app/layout.tsx`**: Root layout with global providers

#### Business Logic Components
- **`CapstoneForm`**: Form handling, validation, and submission
- **`StreamView`**: Content display, streaming, and export functionality
- **`ErrorBoundary`**: Error catching and recovery

#### UI Components
- **Shadcn UI Components**: Reusable UI primitives
- **Custom Components**: Application-specific UI elements

## API Architecture

### API Route Structure

```
app/api/
└── generate/
    └── route.ts
```

### Request/Response Flow

```
Client Request → Next.js API Route → OpenRouter API → SSE Response → Client
     ↓                ↓                   ↓              ↓           ↓
POST /api/generate → Validation → AI Generation → Streaming → Real-time UI
```

### Error Handling Strategy

```typescript
// API Error Types
interface APIError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

// Error Classification
const errorTypes = {
  CLIENT_ERRORS: ['INVALID_JSON', 'INVALID_PROMPT'],
  AUTH_ERRORS: ['AUTH_ERROR'],
  RATE_LIMIT: ['RATE_LIMIT'],
  SERVER_ERRORS: ['CONFIGURATION_ERROR', 'INTERNAL_ERROR'],
  UPSTREAM_ERRORS: ['UPSTREAM_ERROR', 'SERVICE_UNAVAILABLE']
};
```

## Security Architecture

### Input Validation

```typescript
// Client-side validation
const validateTopic = (topic: string): string | undefined => {
  if (!topic.trim()) return 'Project topic is required';
  if (topic.length > 200) return 'Topic too long';
  if (/<script|javascript:|data:/i.test(topic)) return 'Invalid characters';
  return undefined;
};

// Server-side validation
function validatePrompt(prompt: unknown): { isValid: boolean; error?: string } {
  if (!prompt || typeof prompt !== 'string') {
    return { isValid: false, error: 'Prompt is required' };
  }
  if (prompt.length > 10000) {
    return { isValid: false, error: 'Prompt too long' };
  }
  return { isValid: true };
}
```

### API Security

- **Environment Variables**: Sensitive data stored in environment variables
- **Input Sanitization**: All inputs validated and sanitized
- **Rate Limiting**: Implemented through OpenRouter service
- **Error Information**: Sensitive details not exposed in production

### Client Security

- **XSS Protection**: Input validation and sanitization
- **CSRF Protection**: Same-origin policy and secure headers
- **Content Security Policy**: Restrictive CSP headers

## Performance Architecture

### Optimization Strategies

#### 1. Code Splitting
```typescript
// Dynamic imports for heavy components
const PDFGenerator = dynamic(() => import('./PDFGenerator'), {
  loading: () => <div>Loading PDF generator...</div>
});
```

#### 2. Streaming Responses
```typescript
// Server-side streaming
const stream = new ReadableStream({
  async start(controller) {
    // Stream data as it's generated
    for await (const chunk of aiResponse) {
      controller.enqueue(new TextEncoder().encode(chunk));
    }
    controller.close();
  }
});
```

#### 3. Caching Strategy
```typescript
// API response caching
return new Response(stream, {
  headers: {
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  }
});
```

#### 4. Bundle Optimization
- Tree shaking for unused code
- Dynamic imports for large dependencies
- Image optimization with Next.js
- CSS optimization with Tailwind

## Scalability Considerations

### Horizontal Scaling

- **Stateless Architecture**: No server-side session storage
- **API Gateway**: Can be deployed behind load balancers
- **CDN Integration**: Static assets served from CDN
- **Database Independence**: No database dependencies

### Vertical Scaling

- **Memory Management**: Efficient streaming and buffering
- **CPU Optimization**: Minimal server-side processing
- **Network Optimization**: Compressed responses and efficient protocols

### Monitoring and Observability

```typescript
// Error tracking
const logError = (error: Error, context: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    errorTrackingService.captureException(error, { extra: context });
  }
};

// Performance monitoring
const measurePerformance = (operation: string, fn: () => Promise<any>) => {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    console.log(`${operation} took ${duration}ms`);
  });
};
```

## Deployment Architecture

### Production Deployment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     CDN         │    │   Application   │    │   Monitoring    │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Static      │ │    │ │   Next.js   │ │    │ │   Analytics │ │
│ │ Assets      │ │    │ │   Server    │ │    │ │   & Logs    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment Configuration

```typescript
// Environment variables
const config = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
  OPENROUTER_APP_TITLE: process.env.OPENROUTER_APP_TITLE || 'Capstone Generator',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'alibaba/tongyi-deepresearch-30b-a3b:free',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
```

## Testing Architecture

### Testing Strategy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Unit Tests    │    │ Integration     │    │   E2E Tests     │
│                 │    │    Tests        │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │    │ │ API Routes  │ │    │ │ User Flows  │ │
│ │ Utilities   │ │    │ │ Data Flow   │ │    │ │ Cross-browser│ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Test Structure

```typescript
// Component testing
describe('CapstoneForm', () => {
  test('validates required fields', () => {
    // Test implementation
  });
  
  test('handles form submission', () => {
    // Test implementation
  });
});

// API testing
describe('/api/generate', () => {
  test('validates request body', () => {
    // Test implementation
  });
  
  test('handles streaming response', () => {
    // Test implementation
  });
});

// Integration testing
describe('Complete Workflow', () => {
  test('generates capstone plan end-to-end', () => {
    // Test implementation
  });
});
```

## Future Architecture Considerations

### Potential Improvements

1. **Database Integration**
   - User accounts and project history
   - Caching of generated plans
   - Analytics and usage tracking

2. **Advanced AI Features**
   - Multiple AI model support
   - Custom model fine-tuning
   - Plan iteration and refinement

3. **Collaboration Features**
   - Team project planning
   - Real-time collaboration
   - Version control for plans

4. **Enhanced Export Options**
   - Multiple export formats
   - Custom templates
   - Integration with project management tools

### Scalability Roadmap

1. **Phase 1**: Current architecture (stateless, single instance)
2. **Phase 2**: Load balancing and CDN integration
3. **Phase 3**: Microservices architecture
4. **Phase 4**: Multi-region deployment

This architecture documentation provides a comprehensive overview of the system design, helping developers understand the codebase structure, design decisions, and future considerations for the AI Capstone Generator application.
