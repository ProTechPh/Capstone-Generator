# AI Capstone Generator Documentation

Welcome to the comprehensive documentation for the AI Capstone Generator application. This documentation provides detailed information about the application's architecture, components, APIs, and deployment procedures.

## 📚 Documentation Overview

The AI Capstone Generator is a Next.js application that helps students create comprehensive capstone project plans using AI assistance. This documentation covers all aspects of the application from development to deployment.

## 📖 Documentation Structure

### Core Documentation

- **[README.md](../README.md)** - Main project documentation with quick start guide
- **[API.md](./API.md)** - Complete API documentation with examples
- **[COMPONENTS.md](./COMPONENTS.md)** - React component documentation
- **[UTILITIES.md](./UTILITIES.md)** - Utility functions and libraries
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[EXAMPLES.md](./EXAMPLES.md)** - Usage examples and best practices
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment and configuration guide

### Additional Resources

- **[ERROR_HANDLING.md](../ERROR_HANDLING.md)** - Error handling strategies and patterns

## 🚀 Quick Start

### For Users
1. Visit the application at your deployed URL
2. Fill out the capstone project form
3. Generate your personalized plan
4. Export in your preferred format

### For Developers
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### For Deployment
1. Choose your deployment platform
2. Configure environment variables
3. Deploy using platform-specific instructions
4. Monitor and maintain the application

## 🏗️ Architecture Overview

The application follows a modern, component-based architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │  External APIs  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   React     │ │◄──►│ │  Next.js    │ │◄──►│ │ OpenRouter  │ │
│ │ Components  │ │    │ │ API Routes  │ │    │ │    API      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **State Management**: nuqs (URL-based)
- **AI Integration**: OpenRouter API
- **PDF Generation**: html2pdf.js

## 📋 Key Features

- **🤖 AI-Powered Planning**: Generates comprehensive project plans
- **⚡ Real-time Streaming**: Live content generation with SSE
- **📱 Responsive Design**: Mobile-first design approach
- **💾 Multiple Export Options**: Markdown, PDF, and clipboard export
- **🔗 URL State Management**: Shareable form states
- **🛡️ Error Handling**: Comprehensive error management
- **♿ Accessibility**: Built with accessibility best practices

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenRouter API key

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd capstone-generator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OpenRouter API key

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🚀 Deployment

The application can be deployed to various platforms:

- **Vercel** (Recommended) - Seamless Next.js integration
- **Netlify** - Excellent for static sites with serverless functions
- **Railway** - Simple deployment with automatic builds
- **Docker** - Containerized deployment for any platform
- **AWS** - Amplify or Lambda deployment
- **Google Cloud** - Cloud Run deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 API Reference

The application provides a single API endpoint:

### POST /api/generate
Generates a capstone project plan using AI.

**Request:**
```json
{
  "prompt": "User's project requirements and details"
}
```

**Response:**
Streaming text response with the generated plan.

See [API.md](./API.md) for complete API documentation.

## 🧩 Component Documentation

The application is built with reusable React components:

- **CapstoneForm** - Main form component for user input
- **StreamView** - Component for displaying streaming content
- **ErrorBoundary** - Error handling component
- **UI Components** - Shadcn UI components (Button, Card, Input, etc.)

See [COMPONENTS.md](./COMPONENTS.md) for detailed component documentation.

## 🔧 Utilities and Libraries

The application includes several utility modules:

- **Prompt Builder** - Constructs AI prompts from form data
- **SSE Parser** - Handles streaming responses from OpenRouter
- **General Utils** - Common helper functions

See [UTILITIES.md](./UTILITIES.md) for utility documentation.

## 📝 Examples and Best Practices

Comprehensive examples covering:

- Basic usage patterns
- Advanced integration examples
- Error handling strategies
- Performance optimization
- Accessibility best practices

See [EXAMPLES.md](./EXAMPLES.md) for detailed examples.

## 🏛️ Architecture and Design

Detailed information about:

- System architecture
- Design decisions and rationale
- Component architecture
- Data flow patterns
- Security considerations
- Performance optimization

See [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture documentation.

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify `OPENROUTER_API_KEY` is correct
   - Check API key has sufficient credits

2. **Streaming Not Working**
   - Check network connection
   - Verify browser compatibility

3. **PDF Generation Fails**
   - Ensure browser supports required APIs
   - Try different browser

4. **Form Validation Errors**
   - Check browser console for errors
   - Clear browser cache

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 🤝 Contributing

We welcome contributions! Please see the main [README.md](../README.md) for contribution guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review error messages in browser console
- Contact the development team

## 📈 Roadmap

### Planned Features
- User accounts and project history
- Multiple AI model support
- Team collaboration features
- Enhanced export options
- Integration with project management tools

### Future Improvements
- Database integration
- Advanced AI features
- Real-time collaboration
- Mobile application
- API rate limiting
- Advanced analytics

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
