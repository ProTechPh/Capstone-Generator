# API Documentation

This document provides comprehensive documentation for the AI Capstone Generator API endpoints.

## Overview

The API is built using Next.js App Router and provides a single endpoint for generating capstone project plans using AI. The API acts as a proxy to the OpenRouter service, handling authentication, error management, and streaming responses.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

The API uses OpenRouter API keys for authentication. The key must be configured as an environment variable:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Endpoints

### POST /api/generate

Generates a comprehensive capstone project plan using AI.

#### Request

**URL**: `/api/generate`  
**Method**: `POST`  
**Content-Type**: `application/json`

#### Request Body

```typescript
{
  prompt: string; // Required. User's project requirements and details
}
```

#### Request Body Schema

| Field | Type | Required | Description | Max Length |
|-------|------|----------|-------------|------------|
| `prompt` | string | Yes | The user's project requirements formatted as a prompt | 10,000 characters |

#### Example Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Please create a comprehensive capstone project plan with the following requirements:\n\n**Topic Focus:** Machine Learning for Healthcare\n\n**Academic Discipline:** Computer Science\n\n**Project Duration:** 16 weeks\n\n**Key Constraints:** Must use Python, budget under $500\n\n**Preferred Deliverables:** Software application + documentation"
  }'
```

#### Response

**Content-Type**: `text/plain; charset=utf-8`  
**Transfer-Encoding**: `chunked`

The response is a streaming text response containing the generated capstone plan in markdown format.

#### Response Headers

```
Content-Type: text/plain; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive
X-Content-Type-Options: nosniff
```

#### Example Response

```
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

## Error Responses

The API returns structured error responses with appropriate HTTP status codes.

### Error Response Format

```typescript
{
  "error": {
    "code": string;        // Error code for programmatic handling
    "message": string;     // Human-readable error message
    "details"?: unknown;   // Additional error details (development only)
  }
}
```

### Error Codes

#### 400 Bad Request

| Code | Description | Cause |
|------|-------------|-------|
| `INVALID_JSON` | Invalid JSON in request body | Malformed JSON syntax |
| `INVALID_PROMPT` | Prompt validation failed | Missing, empty, or too long prompt |

**Example**:
```json
{
  "error": {
    "code": "INVALID_PROMPT",
    "message": "Prompt is required"
  }
}
```

#### 401 Unauthorized

| Code | Description | Cause |
|------|-------------|-------|
| `AUTH_ERROR` | Authentication failed | Invalid or missing OpenRouter API key |

**Example**:
```json
{
  "error": {
    "code": "AUTH_ERROR",
    "message": "Authentication failed with AI service"
  }
}
```

#### 408 Request Timeout

| Code | Description | Cause |
|------|-------------|-------|
| `REQUEST_TIMEOUT` | Request timed out | Network timeout or slow response |

**Example**:
```json
{
  "error": {
    "code": "REQUEST_TIMEOUT",
    "message": "Request timed out. Please try again."
  }
}
```

#### 429 Too Many Requests

| Code | Description | Cause |
|------|-------------|-------|
| `RATE_LIMIT` | Rate limit exceeded | Too many requests to OpenRouter API |

**Example**:
```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Rate limit exceeded. Please try again later."
  }
}
```

#### 500 Internal Server Error

| Code | Description | Cause |
|------|-------------|-------|
| `CONFIGURATION_ERROR` | Service configuration error | Missing environment variables |
| `INTERNAL_ERROR` | Unexpected server error | Unhandled exception |

**Example**:
```json
{
  "error": {
    "code": "CONFIGURATION_ERROR",
    "message": "Service configuration error. Please contact support."
  }
}
```

#### 502 Bad Gateway

| Code | Description | Cause |
|------|-------------|-------|
| `UPSTREAM_ERROR` | Upstream service error | OpenRouter API error |
| `UPSTREAM_SERVER_ERROR` | Upstream server error | OpenRouter server issues |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | OpenRouter service down |
| `NO_RESPONSE_BODY` | No response from upstream | Empty response from OpenRouter |

**Example**:
```json
{
  "error": {
    "code": "UPSTREAM_ERROR",
    "message": "Failed to generate content",
    "details": {
      "upstreamStatus": 500,
      "upstreamStatusText": "Internal Server Error"
    }
  }
}
```

#### 503 Service Unavailable

| Code | Description | Cause |
|------|-------------|-------|
| `NETWORK_ERROR` | Network connection failed | Network connectivity issues |

**Example**:
```json
{
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Network error occurred. Please check your connection and try again."
  }
}
```

## Rate Limiting

The API implements rate limiting through the OpenRouter service. Current limits depend on your OpenRouter plan:

- **Free Tier**: Limited requests per day
- **Paid Tiers**: Higher rate limits

When rate limits are exceeded, the API returns a `429 Too Many Requests` response.

## Request/Response Examples

### Complete Example

#### Request
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Please create a comprehensive capstone project plan with the following requirements:\n\n**Topic Focus:** E-commerce Platform Development\n\n**Academic Discipline:** Software Engineering\n\n**Project Duration:** 20 weeks\n\n**Key Constraints:** Must use React and Node.js, team of 3 people\n\n**Preferred Deliverables:** Software application + documentation"
  }'
```

#### Response (Streaming)
```
# Capstone Project Plan

## 1. Project Overview
- **Project Title:** Full-Stack E-commerce Platform
- **Academic Discipline:** Software Engineering
- **Duration:** 20 weeks
- **Brief Description:** A comprehensive e-commerce platform built with React frontend and Node.js backend, featuring user authentication, product management, shopping cart, and payment processing.
- **Key Learning Outcomes:** Full-stack development, team collaboration, database design, payment integration, and deployment strategies.

---

## 2. Project Objectives
### Core Objectives
- Develop a scalable e-commerce platform
- Implement secure user authentication and authorization
- Create an intuitive user interface
- Integrate payment processing capabilities

### Technical Objectives
- Build responsive React frontend
- Develop RESTful API with Node.js
- Implement secure database design
- Deploy application to cloud platform

### Functional Objectives
- User registration and login system
- Product catalog with search and filtering
- Shopping cart and checkout process
- Order management and tracking
- Admin dashboard for inventory management

---
...
```

## SDK Examples

### JavaScript/TypeScript

```typescript
interface GenerateRequest {
  prompt: string;
}

interface GenerateResponse {
  stream: ReadableStream<Uint8Array>;
}

class CapstoneGeneratorAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async generatePlan(prompt: string): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error.message}`);
    }

    return response.body!;
  }

  async generatePlanWithCallback(
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const stream = await this.generatePlan(prompt);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
    } catch (error) {
      onError(error as Error);
    }
  }
}

// Usage
const api = new CapstoneGeneratorAPI();

api.generatePlanWithCallback(
  "Create a capstone plan for a React application...",
  (chunk) => console.log(chunk),
  () => console.log('Generation complete'),
  (error) => console.error('Error:', error)
);
```

### Python

```python
import requests
import json
from typing import Iterator

class CapstoneGeneratorAPI:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
    
    def generate_plan(self, prompt: str) -> Iterator[str]:
        """Generate a capstone plan and yield chunks as they arrive."""
        response = requests.post(
            f"{self.base_url}/api/generate",
            json={"prompt": prompt},
            stream=True,
            headers={"Content-Type": "application/json"}
        )
        
        if not response.ok:
            error_data = response.json()
            raise Exception(f"API Error: {error_data['error']['message']}")
        
        for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
            if chunk:
                yield chunk
    
    def generate_plan_complete(self, prompt: str) -> str:
        """Generate a complete capstone plan and return as string."""
        return ''.join(self.generate_plan(prompt))

# Usage
api = CapstoneGeneratorAPI()

try:
    for chunk in api.generate_plan("Create a capstone plan for a Python web app..."):
        print(chunk, end='')
except Exception as e:
    print(f"Error: {e}")
```

## Testing

### Manual Testing

You can test the API using various tools:

#### cURL
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test prompt"}' \
  --no-buffer
```

#### Postman
1. Create a new POST request
2. Set URL to `http://localhost:3000/api/generate`
3. Set headers: `Content-Type: application/json`
4. Set body to raw JSON: `{"prompt": "Test prompt"}`
5. Send request

#### JavaScript Fetch
```javascript
fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Test prompt'
  })
})
.then(response => {
  if (!response.ok) {
    return response.json().then(err => Promise.reject(err));
  }
  return response.body.getReader();
})
.then(reader => {
  const decoder = new TextDecoder();
  
  function readChunk() {
    return reader.read().then(({ value, done }) => {
      if (done) return;
      
      const chunk = decoder.decode(value, { stream: true });
      console.log(chunk);
      
      return readChunk();
    });
  }
  
  return readChunk();
})
.catch(error => console.error('Error:', error));
```

## Best Practices

### Request Optimization

1. **Prompt Length**: Keep prompts concise but descriptive (under 10,000 characters)
2. **Specific Requirements**: Include specific constraints and requirements
3. **Clear Formatting**: Use clear formatting in prompts for better AI understanding

### Error Handling

1. **Always Check Response Status**: Handle both success and error responses
2. **Implement Retry Logic**: For transient errors (5xx status codes)
3. **Graceful Degradation**: Provide fallback options for users

### Streaming

1. **Handle Chunks Properly**: Process streaming data incrementally
2. **Buffer Management**: Don't accumulate too much data in memory
3. **Connection Management**: Handle connection drops gracefully

## Monitoring and Logging

The API includes comprehensive logging for:

- Request/response times
- Error rates and types
- Upstream API performance
- Rate limiting events

In production, consider integrating with monitoring services like:
- Vercel Analytics
- Sentry for error tracking
- DataDog for performance monitoring

## Security Considerations

1. **API Key Protection**: Never expose OpenRouter API keys in client-side code
2. **Input Validation**: All inputs are validated and sanitized
3. **Rate Limiting**: Implemented to prevent abuse
4. **Error Information**: Sensitive information is not exposed in error responses
5. **CORS**: Configure CORS appropriately for your domain

## Changelog

### Version 1.0.0
- Initial API implementation
- Streaming response support
- Comprehensive error handling
- OpenRouter integration
