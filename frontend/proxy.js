import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Decode JWT payload without a library (works in Edge Runtime)
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // convert to ms
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true; // treat unreadable token as expired
  // Add a 30-second buffer so we refresh slightly before actual expiry
  return Date.now() >= expiry - 30_000;
}

export async function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('logo.jpg') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // On login/signup pages: if user already has a valid token, send them home
  if (pathname === '/login' || pathname === '/signup') {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // No token at all → go to login
  if (!token && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Token is expired but we have a refresh token → try to get a new one
  if ((!token || isTokenExpired(token)) && refreshToken) {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        const SEVEN_DAYS = 7 * 24 * 60 * 60;

        // Let the request continue with new token injected into cookies
        const response = NextResponse.next();
        response.cookies.set('token', newAccessToken, {
          path: '/',
          maxAge: SEVEN_DAYS,
          sameSite: 'lax',
        });
        response.cookies.set('refreshToken', newRefreshToken, {
          path: '/',
          maxAge: SEVEN_DAYS,
          sameSite: 'lax',
        });
        return response;
      } else {
        // Refresh failed → clear cookies and redirect to login
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('token');
        response.cookies.delete('refreshToken');
        response.cookies.delete('user');
        return response;
      }
    } catch {
      // Network error during refresh → redirect to login
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      response.cookies.delete('refreshToken');
      response.cookies.delete('user');
      return response;
    }
  }

  // Token exists and is still valid
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
