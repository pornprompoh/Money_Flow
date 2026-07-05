import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import AuthGuard from '@/components/layout/AuthGuard'; // <- Import เพิ่ม

const inter = Inter({ subsets: ['latin', 'thai'] });

export const metadata: Metadata = {
  title: 'Money Flow',
  description: 'Fastest way to track your expenses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50`} suppressHydrationWarning>
        <div className="max-w-md mx-auto min-h-screen bg-white relative">
          {/* ครอบเนื้อหาทั้งหมดด้วย AuthGuard */}
          <AuthGuard>
            {children}
            <BottomNav />
          </AuthGuard>
        </div>
      </body>
    </html>
  );
}