import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import AuthGuard from '@/components/layout/AuthGuard';
import { Toaster } from 'react-hot-toast';

const prompt = Prompt({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'], // Prompt รองรับ 'thai' แน่นอน
});

export const metadata: Metadata = {
  title: 'Money Flow',
  description: 'Fastest way to track your expenses',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // เติม suppressHydrationWarning ตรงนี้
    <html lang="th" suppressHydrationWarning> 
      {/* และเติม suppressHydrationWarning ตรงนี้ด้วยครับ */}
      <body className={`${prompt.className} bg-gray-50`} suppressHydrationWarning>
        <div className="max-w-md mx-auto min-h-screen bg-white relative shadow-sm overflow-hidden">
          <AuthGuard>
            {children}
            <BottomNav />
          </AuthGuard>
          
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '16px',
                padding: '12px 24px',
                fontWeight: '500',
              },
              success: {
                style: { background: '#10B981' }, 
              },
              error: {
                style: { background: '#EF4444' }, 
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}