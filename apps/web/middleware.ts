import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (!pathname.startsWith('/dashboard') && pathname !== '/') {
    const response = NextResponse.next();
    return response;
  }

  // Check for token in cookies
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token with backend
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Token invalid, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    const user = await res.json();
    if (!user) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    // Token valid, allow access
    const response = NextResponse.next();
    // Add user to headers (optional)
    response.headers.set('x-user-email', user.email || '');
    return response;
  } catch (error) {
    console.error('Middleware auth error:', error);
    // If backend is down, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/',
  ],
};
