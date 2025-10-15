"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validate = async () => {
      // First, try a client-side cookie check. If a readable token cookie exists,
      // assume the user is logged in and allow access immediately. If not, fall
      // back to server validation which can check HttpOnly cookies or session state.
      try {
        const cookie = typeof document !== 'undefined' ? document.cookie : '';
        const tokenCookieNames = ['token', 'jwt', 'access_token', 'auth_token'];
        const hasToken = tokenCookieNames.some((name) =>
          cookie.split(';').some((c) => c.trim().startsWith(`${name}=`))
        );

        if (hasToken) {
          setIsLoading(false);
          return;
        }

        // fallback: server-side validation (handles HttpOnly cookies or missing client cookie)
        const res = await fetch(`/api/auth/validate?pathname=${encodeURIComponent(pathname)}&t=${Date.now()}`);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const redirect = data?.redirect || (res.status === 401 ? '/auth/auth1/login' : '/unauthorized');
          router.replace(redirect);
          return;
        }

        const data = await res.json();
        if (data?.ok) {
          setIsLoading(false);
          return;
        }

        // fallback redirect if server says not ok
        const redirect = data?.redirect || '/unauthorized';
        router.replace(redirect);
      } catch (err) {
        // network/error fallback: go to login
        router.replace('/auth/auth1/login');
      }
    };

    validate();
  }, [pathname, router]);

  if (isLoading) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
