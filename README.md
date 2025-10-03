# AI Capstone Generator

A Next.js application that generates comprehensive capstone project plans using AI assistance via OpenRouter API.

## Features

- **Comprehensive Planning**: Generates ideas, outlines, timelines, resources, and deliverables
- **Streaming Responses**: Real-time token streaming for better UX
- **Multiple Export Formats**: Download as Markdown or PDF
- **URL State Management**: Form data persists in URL for easy sharing
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Built with Shadcn UI components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **State Management**: nuqs (URL state)
- **AI Integration**: OpenRouter API
- **PDF Generation**: html2pdf.js

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create `.env.local` with your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_SITE_URL=http://localhost:3000
   OPENROUTER_APP_TITLE=Capstone Generator
   ```

3. **Get OpenRouter API Key**:
   - Visit [OpenRouter](https://openrouter.ai/)
   - Sign up and get your API key
   - Add it to your `.env.local` file

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Fill out the form** with your capstone requirements:
   - Project topic
   - Academic discipline
   - Project duration
   - Constraints and requirements
   - Preferred deliverables

2. **Generate your plan** by clicking "Generate Capstone Plan"

3. **View streaming results** as the AI generates your comprehensive plan

4. **Export your plan**:
   - Copy to clipboard
   - Download as Markdown
   - Export as PDF

## Project Structure

```
├── app/
│   ├── api/generate/route.ts    # OpenRouter API proxy
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── ui/                      # Shadcn UI components
│   ├── capstone-form.tsx        # Form component
│   └── stream-view.tsx          # Streaming results view
├── lib/
│   ├── prompt.ts                # Prompt building logic
│   ├── sse.ts                   # SSE parsing utilities
│   └── utils.ts                 # Utility functions
└── ...
```

## API Integration

The app uses OpenRouter's API with the `alibaba/tongyi-deepresearch-30b-a3b:free` model for generating comprehensive capstone plans. The API integration includes:

- Server-side streaming proxy
- Proper error handling
- SSE (Server-Sent Events) parsing
- Rate limiting considerations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
