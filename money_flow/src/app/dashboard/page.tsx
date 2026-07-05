'use client';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// กำหนด Type ให้กับข้อมูล Transaction ที่จะดึงมา
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  note: string;
  created_at: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับเก็บยอดสรุป
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // หาจุดเริ่มต้นและสิ้นสุดของเดือนปัจจุบัน
      const startOfMonth = dayjs().startOf('month').toISOString();
      const endOfMonth = dayjs().endOf('month').toISOString();

      // ใช้ Query นี้ตัวเดียว: ดึงเฉพาะข้อมูลของเดือนปัจจุบัน เรียงจากใหม่ไปเก่า
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startOfMonth) // ดึงตั้งแต่วันแรกของเดือน
        .lte('created_at', endOfMonth)   // จนถึงวันสุดท้ายของเดือน
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data);
        
        // คำนวณยอดรวมต่างๆ
        const totalIncome = data
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        const totalExpense = data
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        setSummary({
          income: totalIncome,
          expense: totalExpense,
          balance: totalIncome - totalExpense,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 flex justify-center items-center h-screen">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">สรุปยอดรวม (เดือนนี้)</h1>

      {/* บล็อกแสดงยอดเงินคงเหลือ */}
      <div className="bg-blue-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
        <p className="text-blue-100 text-sm mb-1">เงินคงเหลือ</p>
        <h2 className="text-4xl font-bold tracking-tight">
          ฿ {summary.balance.toLocaleString()}
        </h2>
      </div>

      {/* บล็อกแสดงรายรับ - รายจ่าย */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-emerald-600 text-sm mb-1">รายรับ</p>
          <p className="text-emerald-700 text-xl font-semibold">
            + ฿ {summary.income.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <p className="text-red-600 text-sm mb-1">รายจ่าย</p>
          <p className="text-red-700 text-xl font-semibold">
            - ฿ {summary.expense.toLocaleString()}
          </p>
        </div>
      </div>

      {/* รายการล่าสุด (โชว์แค่ 5 รายการ) */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">รายการล่าสุด</h3>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${t.type === 'expense' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {t.note || (t.type === 'expense' ? 'รายจ่าย' : 'รายรับ')}
                </span>
              </div>
              <span className={`font-semibold ${t.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                {t.type === 'expense' ? '-' : '+'} ฿ {Number(t.amount).toLocaleString()}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-400 py-4">ยังไม่มีรายการบันทึก</p>
          )}
        </div>
      </div>
    </div>
  );
}