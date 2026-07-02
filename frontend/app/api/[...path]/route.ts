import { NextRequest, NextResponse } from 'next/server';

function getBackendBase(): string {
  const internal = process.env.BACKEND_INTERNAL_URL;
  if (internal?.startsWith('http')) {
    return internal.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    return 'http://backend:3001/api';
  }
  return 'http://localhost:3001/api';
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');
  const url = new URL(request.url);
  const backendUrl = `${getBackendBase()}/${path}${url.search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const resp = await fetch(backendUrl, init);
    const body = await resp.text();
    return new NextResponse(body, {
      status: resp.status,
      headers: {
        'content-type': resp.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[api proxy]', backendUrl, error);
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 502 },
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
