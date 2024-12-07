// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
    const session = await auth();

    if (!session?.user) {
        if (request.nextUrl.pathname === '/login') {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
      {
        source: '/dashboard',
        locale: false,
        missing: [{ type: 'header', key: 'Authorization', value: 'Bearer Token' }],
      },
    ],
  }
