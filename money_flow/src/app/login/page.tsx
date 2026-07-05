'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Wallet size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Money Flow</h1>
          <p className="text-gray-400 text-sm mt-1">จดรายรับรายจ่ายไวที่สุด</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            label="อีเมล"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          <Input
            label="รหัสผ่าน"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {errorMsg && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{errorMsg}</p>
          )}

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} loadingText="กำลังประมวลผล...">
              {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}