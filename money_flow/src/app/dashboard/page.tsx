'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { Coffee, Utensils, Bus, ShoppingBag, Briefcase, PiggyBank, CircleHelp, Trash2, TrendingUp, TrendingDown, Wallet, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import HybridCalendar from '@/components/features/HybridCalendar';

interface TransactionHistory {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  created_at: string;
  note: string;
  categories: { name: string; icon_name: string; } | null;
}

const getIcon = (iconName?: string) => {
  const icons: any = {
    Utensils: <Utensils size={20} />, Coffee: <Coffee size={20} />, Bus: <Bus size={20} />,
    ShoppingBag: <ShoppingBag size={20} />, Briefcase: <Briefcase size={20} />, PiggyBank: <PiggyBank size={20} />,
  };
  return iconName && icons[iconName] ? icons[iconName] : <CircleHelp size={20} />;
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  
  const [currentDate, setCurrentDate] = useState<string>(dayjs().toISOString());
  const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });

  useEffect(() => {
    fetchDailyData();
  }, [currentDate]);

  const fetchDailyData = async () => {
    setIsLoading(true);
    try {
      const dateObj = dayjs(currentDate);
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`id, amount, type, created_at, note, categories ( name, icon_name )`)
        .gte('created_at', dateObj.startOf('day').toISOString())
        .lte('created_at', dateObj.endOf('day').toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setTransactions(data as any);
        let inc = 0, exp = 0;
        data.forEach(t => {
          if (t.type === 'income') inc += Number(t.amount);
          if (t.type === 'expense') exp += Number(t.amount);
        });
        setSummary({ income: inc, expense: exp, total: inc - exp });
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('โหลดข้อมูลผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', deleteTarget);
      if (error) throw error;
      toast.success('ลบรายการสำเร็จ');
      fetchDailyData(); 
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบรายการ');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto bg-gray-50 min-h-screen">
      <ConfirmModal 
        isOpen={!!deleteTarget} title="ลบรายการ"
        message="คุณแน่ใจหรือไม่ที่จะลบประวัติการทำรายการนี้?"
        onConfirm={executeDelete} onCancel={() => setDeleteTarget(null)} confirmText="ลบทิ้ง"
      />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">แดชบอร์ด</h1>

      <HybridCalendar currentDate={currentDate} onChangeDate={setCurrentDate} />

      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
          <div className="flex items-center gap-2 text-gray-500">
            <Wallet size={20} />
            <span className="font-medium text-sm">ยอดรวมประจำวัน</span>
          </div>
          <span className={`text-xl font-bold ${summary.total >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {summary.total >= 0 ? '+' : ''}฿{summary.total.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between gap-4">
          <div className="flex-1 bg-emerald-50 rounded-2xl p-3 flex flex-col justify-center">
             <div className="flex items-center gap-1 text-emerald-600 mb-1">
               <TrendingUp size={16} /> <span className="text-xs font-bold">รายรับ</span>
             </div>
             <span className="text-emerald-600 font-bold text-lg">฿{summary.income.toLocaleString()}</span>
          </div>
          
          <div className="flex-1 bg-red-50 rounded-2xl p-3 flex flex-col justify-center">
             <div className="flex items-center gap-1 text-red-500 mb-1">
               <TrendingDown size={16} /> <span className="text-xs font-bold">รายจ่าย</span>
             </div>
             <span className="text-red-500 font-bold text-lg">฿{summary.expense.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">รายการของวันนี้</h3>
      
      {isLoading ? (
        <div className="text-center text-gray-400 py-10 animate-pulse">กำลังโหลดข้อมูล...</div>
      ) : (
        <div className="space-y-3">
{transactions.map((t) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex justify-between items-center group">
              {/* เพิ่ม min-w-0 เพื่อบังคับให้คำสั่งตัดคำ (truncate) ทำงานถูกต้อง */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`p-3 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${t.type === 'expense' ? 'bg-red-400' : 'bg-emerald-400'}`}>
                  {getIcon(t.categories?.icon_name)}
                </div>
                <div className="truncate pr-2">
                  <h3 className="font-semibold text-gray-800 truncate">{t.categories?.name || 'ไม่ระบุหมวดหมู่'}</h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {dayjs(t.created_at).format('HH:mm')}
                    {/* 🌟 แสดงโน้ตต่อท้ายเวลาแบบเนียนๆ */}
                    {t.note && (
                      <span className="text-gray-500 font-medium ml-1.5">
                        | {t.note}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className={`font-bold text-lg whitespace-nowrap ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {t.type === 'expense' ? '-' : '+'}฿{Number(t.amount).toLocaleString()}
                </p>
                <button onClick={() => setDeleteTarget(t.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center bg-white border border-gray-100 rounded-2xl py-10 shadow-sm flex flex-col items-center justify-center">
              <CalendarDays size={40} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm font-medium">ไม่มีรายการในวันนี้</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}