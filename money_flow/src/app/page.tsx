'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTransactionStore } from '@/store/useTransactionStore';
import CategorySelector from '@/components/features/CategorySelector';
import QuickAmount from '@/components/features/QuickAmount';
import { Pencil, TrendingDown, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function Home() {
  const { amount, type, categoryId, note, setAmount, setType, setNote, reset } = useTransactionStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || amount === '0' || Number(amount) <= 0) {
      toast.error('กรุณาระบุจำนวนเงิน');
      return;
    }
    if (!categoryId) {
      toast.error('กรุณาเลือกหมวดหมู่');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('กรุณาเข้าสู่ระบบใหม่');

      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        amount: Number(amount),
        type,
        category_id: categoryId,
        note: note.trim()
      }]);

      if (error) throw error;

      toast.success('บันทึกรายการสำเร็จ!');
      reset(); 

    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto min-h-screen flex flex-col">
      
      {/* 🌟 1. ส่วนหัวหน้าเว็บ + สวิตช์เลือก รายรับ/รายจ่าย (รวบไว้บรรทัดเดียวกัน) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จดบันทึก</h1>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setType('expense')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
              ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            <TrendingDown size={16} /> รายจ่าย
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
              ${type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            <TrendingUp size={16} /> รายรับ
          </button>
        </div>
      </div>

      {/* 🔹 2. ส่วนจำนวนเงิน (เป็น input เพื่อให้จิ้มพิมพ์เองได้) */}
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm font-medium mb-1">จำนวนเงิน</p>
        <div className="flex items-center justify-center h-14">
          <span className={`text-4xl font-bold mr-1 ${type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
            ฿
          </span>
          <input
            type="number"
            value={amount === '0' ? '' : amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={`text-5xl font-bold bg-transparent border-none outline-none w-full text-center p-0 placeholder-gray-300
              ${type === 'expense' ? 'text-red-500' : 'text-emerald-500'}
            `}
            style={{ maxWidth: '200px' }}
          />
        </div>
      </div>

      {/* 🔹 3. แผงปุ่มบวกเงินด่วน (เรียกใช้งาน Component ที่แยกไว้) */}
      <QuickAmount />

      {/* 🔹 4. ส่วนเลือกหมวดหมู่ */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-500 mb-2 px-1">เลือกหมวดหมู่</h3>
        <CategorySelector />
      </div>

      {/* 🔹 5. ส่วนโน้ตย่อ + ปุ่มบันทึก (ดันให้อยู่ล่างสุดเสมอ) */}
      <div className="mt-auto space-y-4">
        <div className="bg-white rounded-2xl flex items-center px-4 py-3.5 border border-gray-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
          <Pencil size={18} className="text-gray-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เพิ่มโน้ตช่วยจำ (ไม่บังคับ)..."
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>

        <Button 
          onClick={handleSave} 
          isLoading={isSaving} 
          loadingText="กำลังบันทึก..."
          className="w-full py-4 text-lg rounded-2xl shadow-lg shadow-blue-200"
        >
          บันทึกรายการ
        </Button>
      </div>

    </div>
  );
}