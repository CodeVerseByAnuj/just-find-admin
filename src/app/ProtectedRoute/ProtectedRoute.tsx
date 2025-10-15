"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch(`/api/auth/validate?pathname=${encodeURIComponent(pathname)}`);
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
