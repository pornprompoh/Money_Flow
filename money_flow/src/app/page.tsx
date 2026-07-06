'use client';
import { useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import QuickAmount from '@/components/features/QuickAmount';
import CategorySelector from '@/components/features/CategorySelector';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Home() {
  const { amount, type, categoryId, setType, clearAmount, setAmount } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const isReadyToSave = amount > 0 && categoryId !== null;

  const handleSave = async () => {
    if (!isReadyToSave) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');

      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: amount,
          type: type,
          category_id: categoryId,
          note: '', 
        }]);

      if (error) throw error;

      toast.success(`บันทึก${type === 'expense' ? 'รายจ่าย' : 'รายรับ'} ${amount} บาท เรียบร้อย!`);
      clearAmount();

    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto bg-white p-6 pb-24 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-800">Money Flow</h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setType('expense')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            รายจ่าย
          </button>
          <button
            onClick={() => setType('income')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            รายรับ
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center mb-8 w-full">
        <span className="text-gray-400 text-sm mb-2">จำนวนเงิน</span>
        <div className="flex items-center justify-center text-6xl font-bold tracking-tight text-gray-900 w-full px-4">
          <span className="text-3xl mr-2 text-gray-400">฿</span>
          <input
            type="text" 
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount === 0 ? '' : amount.toLocaleString()} 
            onChange={(e) => {
              const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
              setAmount(isNaN(val) ? 0 : val);
            }}
            placeholder="0"
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-center w-full max-w-[250px] text-gray-900 p-0 m-0 placeholder-gray-300"
          />
        </div>
      </div>

      <div className="mt-auto">
        <QuickAmount />
        <CategorySelector />
        
        <div className="mt-6">
          <Button 
            onClick={handleSave} 
            disabled={!isReadyToSave} 
            isLoading={isLoading}
            variant={type === 'expense' ? 'expense' : 'income'}
            loadingText="กำลังบันทึก..."
          >
            บันทึก{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}
          </Button>
        </div>
      </div>
    </main>
  );
}