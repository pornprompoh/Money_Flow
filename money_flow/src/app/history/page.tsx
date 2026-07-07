'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { Coffee, Utensils, Bus, ShoppingBag, Briefcase, PiggyBank, CircleHelp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface TransactionHistory {
  id: string; amount: number; type: 'income' | 'expense'; created_at: string; note: string; // <-- เติมตรงนี้
  categories: { name: string; icon_name: string; } | null;
}

const getIcon = (iconName?: string) => {
  const icons: any = { Utensils: <Utensils size={20} />, Coffee: <Coffee size={20} />, Bus: <Bus size={20} />, ShoppingBag: <ShoppingBag size={20} />, Briefcase: <Briefcase size={20} />, PiggyBank: <PiggyBank size={20} /> };
  return iconName && icons[iconName] ? icons[iconName] : <CircleHelp size={20} />;
};

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`id, amount, type, created_at, note, categories ( name, icon_name )`) // <-- เติม note,
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTransactions(data as any);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการโหลดประวัติ');
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', deleteTarget);
      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== deleteTarget));
      toast.success('ลบรายการสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบรายการ');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) return <div className="p-6 flex justify-center items-center h-screen text-gray-500">กำลังโหลดประวัติ...</div>;

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <ConfirmModal isOpen={!!deleteTarget} title="ลบรายการ" message="คุณแน่ใจหรือไม่ที่จะลบรายการนี้?" onConfirm={executeDelete} onCancel={() => setDeleteTarget(null)} confirmText="ลบทิ้ง" />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ประวัติทั้งหมด</h1>
      <div className="space-y-4">
{transactions.map((t) => (
          <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex justify-between items-center group">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`p-3 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${t.type === 'expense' ? 'bg-red-400' : 'bg-emerald-400'}`}>
                {getIcon(t.categories?.icon_name)}
              </div>
              <div className="truncate pr-2">
                <h3 className="font-semibold text-gray-800 truncate">{t.categories?.name || 'ไม่ระบุหมวดหมู่'}</h3>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {dayjs(t.created_at).format('DD/MM/YYYY • HH:mm')}
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
        {transactions.length === 0 && <div className="text-center text-gray-400 py-10">ยังไม่มีประวัติการทำรายการ</div>}
      </div>
    </div>
  );
}