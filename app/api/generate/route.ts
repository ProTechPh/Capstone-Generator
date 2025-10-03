import { NextRequest } from 'next/server';
import { SSEParser } from '@/lib/sse';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response('Prompt is required', { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response('OpenRouter API key not configured', { status: 500 });
    }

    // Make request to OpenRouter
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_APP_TITLE || 'Capstone Generator',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'alibaba/tongyi-deepresearch-30b-a3b:free',
        stream: true,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!upstream.ok) {
      console.error('OpenRouter API error:', upstream.status, upstream.statusText);
      return new Response('Failed to generate content', { status: 500 });
    }

    if (!upstream.body) {
      return new Response('No response body from OpenRouter', { status: 500 });
    }

    // Create a readable stream that processes the upstream response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const sseParser = new SSEParser();

        try {
          while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
              // Process any remaining buffered data
              const finalTokens = sseParser.flush();
              for (const token of finalTokens) {
                controller.enqueue(new TextEncoder().encode(token));
              }
              break;
            }

            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });
            
            // Parse SSE and extract tokens using buffered parser
            const tokens = sseParser.parseChunk(chunk);
            
            // Send each token as a separate chunk
            for (const token of tokens) {
              controller.enqueue(new TextEncoder().encode(token));
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
