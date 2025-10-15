import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Import the same sidebar definitions used on the client so server can check allowed paths
import { SidebarContentRole1, SidebarContentRole2, SidebarContentRole3 } from '@/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems';

function extractAllowedPaths(sidebarContent: Array<any>): string[] {
  const paths: string[] = [];
  sidebarContent.forEach((menu: any) => {
    menu.items?.forEach((item: any) => {
      item.children?.forEach((child: any) => {
        if (child.url) paths.push(child.url);
      });
    });
  });
  return paths;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathname = url.searchParams.get('pathname') || '/';

    // Read token and user details from cookies (server-side)
    const token = req.cookies.get('access_token')?.value || '';
    const userDetailsRaw = req.cookies.get('user_details')?.value || '';

    if (!token) {
      return NextResponse.json({ ok: false, reason: 'no_token', redirect: '/auth/auth1/login' }, { status: 401 });
    }

    let roleId = 0;
    if (userDetailsRaw) {
      try {
        const userDetails = JSON.parse(decodeURIComponent(userDetailsRaw));
        roleId = userDetails?.role_id ?? 0;
      } catch (e) {
        roleId = 0;
      }
    }

    if (pathname === '/' || pathname === '/profile') {
      return NextResponse.json({ ok: true });
    }

    const allowedPathsForId1 = extractAllowedPaths(SidebarContentRole1);
    const allowedPathsForId2 = extractAllowedPaths(SidebarContentRole2);
    const allowedPathsForId3 = extractAllowedPaths(SidebarContentRole3);

    const isAllowedForId1 = allowedPathsForId1.some((path) => pathname.startsWith(path));
    const isAllowedForId2 = allowedPathsForId2.some((path) => pathname.startsWith(path));
    const isAllowedForId3 = allowedPathsForId3.some((path) => pathname.startsWith(path));

    if ((isAllowedForId1 && roleId === 1) || (isAllowedForId2 && roleId === 2) || (isAllowedForId3 && roleId === 3)) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, reason: 'unauthorized', redirect: '/unauthorized' }, { status: 403 });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: 'error', message: (err as Error).message }, { status: 500 });
  }
}
