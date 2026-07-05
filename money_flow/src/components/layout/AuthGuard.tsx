'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // ถ้าไม่มี Session และไม่ได้อยู่หน้า login -> เด้งไปหน้า login
      if (!session && pathname !== '/login') {
        router.replace('/login');
      } 
      // ถ้ามี Session แล้ว แต่พยายามเข้าหน้า login -> เด้งกลับไปหน้าแรก
      else if (session && pathname === '/login') {
        router.replace('/');
      } 
      else {
        setIsChecking(false);
      }
    };

    checkSession();

    // คอยดักจับเหตุการณ์ Login / Logout แบบเรียลไทม์
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">กำลังตรวจสอบสิทธิ์...</div>;
  }

  return <>{children}</>;
}