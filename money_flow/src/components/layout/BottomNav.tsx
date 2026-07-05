// src/components/layout/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, Wallet, Clock, User } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'บันทึก', path: '/', icon: Home },
  { name: 'สรุปผล', path: '/dashboard', icon: PieChart },
  { name: 'งบประมาณ', path: '/budget', icon: Wallet },
  { name: 'ประวัติ', path: '/history', icon: Clock },
  { name: 'โปรไฟล์', path: '/profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  // ซ่อนแถบเมนูถ้าอยู่หน้า Login
  if (pathname === '/login') return null;

  return (
    <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-between items-center px-2 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
                ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={isActive ? 'text-blue-600' : ''} 
              />
              <span className={`text-[10px] ${isActive ? 'font-semibold text-blue-600' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}