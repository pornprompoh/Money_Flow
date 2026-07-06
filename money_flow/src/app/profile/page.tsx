'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Settings, Wallet, Bell, CircleHelp, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string>('กำลังโหลด...');
  const router = useRouter();

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? 'ผู้ใช้งานระบบ');
      }
    };
    getUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login'); 
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">โปรไฟล์</h1>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={32} />
        </div>
        <div className="overflow-hidden">
          <h2 className="text-lg font-bold text-gray-800 truncate">{userEmail}</h2>
          <p className="text-sm text-emerald-500 font-medium mt-1">ยืนยันบัญชีแล้ว</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
        <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-gray-700">
            <Wallet size={20} className="text-blue-500" />
            <span className="font-medium">จัดการหมวดหมู่งบประมาณ</span>
          </div>
        </button>

        <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-gray-700">
            <Bell size={20} className="text-amber-500" />
            <span className="font-medium">การแจ้งเตือน</span>
          </div>
        </button>

        <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-gray-700">
            <Settings size={20} className="text-gray-500" />
            <span className="font-medium">ตั้งค่าแอปพลิเคชัน</span>
          </div>
        </button>

        <button className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-gray-700">
            <CircleHelp size={20} className="text-emerald-500" />
            <span className="font-medium">ช่วยเหลือ & แจ้งปัญหา</span>
          </div>
        </button>
      </div>

      <Button variant="danger" onClick={handleLogout}>
        <LogOut size={20} className="mr-2" />
        ออกจากระบบ
      </Button>
      
      <p className="text-center text-xs text-gray-400 mt-6">Money Flow Version 1.0 (MVP)</p>
    </div>
  );
}