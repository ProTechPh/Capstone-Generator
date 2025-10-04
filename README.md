# AI Capstone Generator

A Next.js application that generates comprehensive capstone project plans using AI assistance via OpenRouter API. This tool helps students create structured, detailed project plans with timelines, resources, and deliverables tailored to their academic discipline.

## Overview

### What This Application Does

The AI Capstone Generator is a web application that assists students in creating comprehensive capstone project plans. It uses AI to generate structured project outlines, timelines, resource lists, and deliverables based on user input about their project topic, academic discipline, duration, and constraints.

### Key Features

- **🤖 AI-Powered Planning**: Generates comprehensive project plans using advanced AI models
- **📊 Structured Output**: Creates well-organized plans with clear sections and formatting
- **⚡ Real-time Streaming**: Live token streaming for immediate feedback and better UX
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **💾 Multiple Export Options**: Download plans as Markdown or PDF files
- **🔗 URL State Management**: Form data persists in URL for easy sharing and bookmarking
- **🎨 Modern UI**: Beautiful interface built with Shadcn UI and Tailwind CSS
- **🛡️ Error Handling**: Comprehensive error handling with retry mechanisms
- **♿ Accessibility**: Built with accessibility best practices

### Why It Exists

Capstone projects are often the culminating experience in academic programs, requiring students to demonstrate mastery of their field through independent research or development work. However, many students struggle with:

- **Planning Complexity**: Breaking down large projects into manageable phases
- **Timeline Management**: Creating realistic schedules and milestones
- **Resource Identification**: Finding appropriate tools, references, and materials
- **Deliverable Definition**: Understanding what outputs are expected
- **Risk Assessment**: Anticipating potential challenges and mitigation strategies

This tool addresses these challenges by providing AI-generated, structured guidance that students can customize and build upon.

## Tech Stack

### Core Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: Shadcn UI + Radix UI for accessible components
- **State Management**: nuqs for URL-based state management
- **AI Integration**: OpenRouter API for AI model access
- **PDF Generation**: html2pdf.js for client-side PDF creation

### Development Tools

- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript with strict configuration
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenRouter API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd capstone-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create `.env.local` in the root directory:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_SITE_URL=http://localhost:3000
   OPENROUTER_APP_TITLE=Capstone Generator
   OPENROUTER_MODEL=alibaba/tongyi-deepresearch-30b-a3b:free
   ```

4. **Get OpenRouter API Key**:
   - Visit [OpenRouter](https://openrouter.ai/)
   - Sign up for an account
   - Generate an API key
   - Add it to your `.env.local` file

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Basic Workflow

1. **Fill Out the Form**:
   - Enter your project topic (e.g., "Machine Learning for Healthcare")
   - Select your academic discipline
   - Choose project duration
   - Add any constraints or requirements
   - Select preferred deliverables

2. **Generate Your Plan**:
   - Click "Generate Capstone Plan"
   - Watch as the AI creates your plan in real-time
   - The streaming interface shows progress as content is generated

3. **Review and Export**:
   - Review the generated plan
   - Copy to clipboard for quick sharing
   - Download as Markdown for editing
   - Export as PDF for submission

### Form Fields Explained

#### Project Topic
- **Required**: Yes
- **Description**: Brief description of your capstone project
- **Examples**: "IoT Security System", "E-commerce Platform", "Data Analysis Tool"
- **Validation**: 5-200 characters, no script tags

#### Academic Discipline
- **Required**: Yes
- **Options**: Computer Science, Engineering, Business Administration, Data Science, Cybersecurity, Software Engineering, Information Systems, Digital Marketing, Project Management, Other
- **Purpose**: Tailors the generated plan to your field's conventions and requirements

#### Project Duration
- **Required**: Yes
- **Options**: 8 weeks, 12 weeks, 16 weeks, 20 weeks, 24 weeks, 1 semester, 2 semesters
- **Purpose**: Creates realistic timelines and milestones based on available time

#### Constraints & Requirements
- **Required**: No
- **Description**: Any specific limitations, technologies, or requirements
- **Examples**: "Must use React", "Budget under $500", "Team of 3 people"
- **Validation**: Max 1000 characters

#### Preferred Deliverables
- **Required**: No
- **Options**: Software application + documentation, Research paper + presentation, Prototype + technical report, Case study + analysis, System design + implementation, Portfolio + reflection, Other
- **Purpose**: Influences the structure and focus of the generated plan

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # API endpoint for AI generation
│   ├── globals.css               # Global styles and CSS variables
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main page component
├── components/                   # React components
│   ├── ui/                       # Reusable UI components (Shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── toast.tsx
│   ├── capstone-form.tsx         # Main form component
│   ├── error-boundary.tsx        # Error handling component
│   └── stream-view.tsx           # Streaming results display
├── lib/                          # Utility libraries
│   ├── prompt.ts                 # AI prompt building logic
│   ├── sse.ts                    # Server-Sent Events parser
│   └── utils.ts                  # General utility functions
├── types/                        # TypeScript type definitions
│   └── html2pdf.d.ts            # PDF generation types
├── ERROR_HANDLING.md            # Error handling documentation
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── next.config.js               # Next.js configuration
```

## API Documentation

### POST /api/generate

Generates a capstone project plan using AI.

#### Request

```typescript
{
  prompt: string; // User's project requirements and details
}
```

#### Response

Returns a streaming text response with the generated plan.

#### Example Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a capstone plan for a Machine Learning project in Computer Science..."}'
```

#### Error Responses

```typescript
// 400 Bad Request
{
  "error": {
    "code": "INVALID_PROMPT",
    "message": "Prompt is required"
  }
}

// 500 Internal Server Error
{
  "error": {
    "code": "CONFIGURATION_ERROR",
    "message": "Service configuration error. Please contact support."
  }
}
```

## Component Documentation

### CapstoneForm

Main form component for collecting user input.

#### Props

```typescript
interface CapstoneFormProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}
```

#### Features

- URL state management with nuqs
- Real-time form validation
- Input sanitization
- Responsive design
- Accessibility support

#### Usage

```tsx
<CapstoneForm 
  onGenerate={handleGenerate}
  isGenerating={isGenerating}
/>
```

### StreamView

Component for displaying streaming AI-generated content.

#### Props

```typescript
interface StreamViewProps {
  prompt: string;
  onComplete?: () => void;
}
```

#### Features

- Real-time content streaming
- Export functionality (Markdown, PDF)
- Error handling with retry
- Markdown formatting
- Copy to clipboard

#### Usage

```tsx
<StreamView 
  prompt={userPrompt}
  onComplete={handleComplete}
/>
```

### ErrorBoundary

React error boundary for catching and handling errors gracefully.

#### Props

```typescript
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

#### Features

- Automatic error catching
- Retry mechanism
- Development error details
- Production-safe error handling
- Custom fallback support

## Architecture Overview

### Design Decisions

#### 1. Next.js App Router
- **Choice**: Next.js 14 with App Router
- **Rationale**: Provides server-side rendering, API routes, and modern React features
- **Benefits**: Better performance, SEO, and developer experience

#### 2. URL State Management
- **Choice**: nuqs library
- **Rationale**: Enables sharing and bookmarking of form states
- **Benefits**: Better UX, no data loss on refresh, easy sharing

#### 3. Streaming Responses
- **Choice**: Server-Sent Events (SSE)
- **Rationale**: Provides real-time feedback during AI generation
- **Benefits**: Better perceived performance, immediate feedback

#### 4. Client-Side PDF Generation
- **Choice**: html2pdf.js
- **Rationale**: No server-side dependencies, works offline
- **Benefits**: Reduced server load, better privacy, simpler deployment

### Data Flow

1. **User Input**: Form data collected and validated
2. **Prompt Building**: User data transformed into AI prompt
3. **API Request**: Prompt sent to OpenRouter via Next.js API route
4. **Streaming Response**: AI response streamed back to client
5. **Content Display**: Streamed content formatted and displayed
6. **Export Options**: Users can export content in various formats

### Error Handling Strategy

#### Client-Side
- Form validation with real-time feedback
- Network error handling with retry logic
- Graceful degradation for unsupported features

#### Server-Side
- Input validation and sanitization
- API error handling with proper HTTP status codes
- Retry logic for upstream API calls
- Comprehensive error logging

## Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI access | - |
| `OPENROUTER_SITE_URL` | No | Site URL for OpenRouter tracking | `http://localhost:3000` |
| `OPENROUTER_APP_TITLE` | No | App title for OpenRouter tracking | `Capstone Generator` |
| `OPENROUTER_MODEL` | No | AI model to use | `alibaba/tongyi-deepresearch-30b-a3b:free` |

### Customization

#### Styling
- Modify `tailwind.config.js` for theme customization
- Update `app/globals.css` for global styles
- Customize component styles in individual files

#### AI Model
- Change `OPENROUTER_MODEL` environment variable
- Update model-specific parsing in `lib/sse.ts` if needed

#### Form Fields
- Modify `DISCIPLINES`, `DURATIONS`, and `DELIVERABLES_OPTIONS` in `capstone-form.tsx`
- Update validation logic as needed

## Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   - Import project to Vercel
   - Connect your Git repository

2. **Configure Environment Variables**:
   - Add all required environment variables in Vercel dashboard
   - Ensure `OPENROUTER_API_KEY` is set

3. **Deploy**:
   - Vercel will automatically deploy on push to main branch
   - Custom domains can be configured in project settings

### Other Platforms

#### Netlify
```bash
# Build command
npm run build

# Publish directory
.next
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

### Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/capstone-generator.git
   cd capstone-generator
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes**:
   - Follow TypeScript and ESLint rules
   - Add tests for new functionality
   - Update documentation as needed

5. **Test Changes**:
   ```bash
   npm run lint
   npm run build
   npm run dev
   ```

6. **Submit Pull Request**:
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Ensure all tests pass

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

### Testing

- Test form validation thoroughly
- Verify error handling scenarios
- Test on multiple devices and browsers
- Validate accessibility compliance

## Troubleshooting

### Common Issues

#### 1. API Key Not Working
- **Symptom**: "Authentication failed" error
- **Solution**: Verify `OPENROUTER_API_KEY` is correct and has sufficient credits

#### 2. Streaming Not Working
- **Symptom**: Content appears all at once instead of streaming
- **Solution**: Check network connection and browser compatibility

#### 3. PDF Generation Fails
- **Symptom**: PDF download doesn't work
- **Solution**: Ensure browser supports required APIs, try different browser

#### 4. Form Validation Errors
- **Symptom**: Form won't submit despite valid input
- **Solution**: Check browser console for JavaScript errors, clear browser cache

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed error information in the browser console.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review error messages in browser console
