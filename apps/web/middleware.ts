import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://amd-erp-api:3001';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proxy /api/* requests to backend
  if (pathname.startsWith('/api/')) {
    const apiUrl = `${API_URL}${pathname}`;
    
    try {
      const headers = new Headers(request.headers);
      headers.set('host', new URL(API_URL).host);
      
      // Extract token from cookies and add Authorization header
      const token = request.cookies.get('accessToken')?.value;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      const res = await fetch(apiUrl, {
        method: request.method,
        headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
      });

      const data = await res.json().catch(() => ({}));
      
      return NextResponse.json(data, {
        status: res.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (error) {
      return NextResponse.json(
        { message: 'Error de conexión con el servidor' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
