import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Credenciales inválidas' },
        { status: res.status }
      );
    }

    const response = NextResponse.json({ success: true, user: data.user });
    response.cookies.set('accessToken', data.accessToken, {
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    });
    response.cookies.set('refreshToken', data.refreshToken, {
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Error de conexión' }, { status: 500 });
  }
}
