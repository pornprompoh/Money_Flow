'use client';
import { useEffect, useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Coffee, Utensils, Bus, ShoppingBag, Briefcase, PiggyBank, Plus, CircleHelp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon_name: string;
}

const getIcon = (iconName: string) => {
  const icons: any = {
    Utensils: <Utensils size={24} />,
    Coffee: <Coffee size={24} />,
    Bus: <Bus size={24} />,
    ShoppingBag: <ShoppingBag size={24} />,
    Briefcase: <Briefcase size={24} />,
    PiggyBank: <PiggyBank size={24} />,
  };
  return icons[iconName] || <CircleHelp size={24} />;
};

export default function CategorySelector() {
  const { type, categoryId, setCategory } = useTransactionStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter(); // เพิ่ม useRouter สำหรับนำทาง

  useEffect(() => {
    const fetchCategories = async () => {
      // ดึงหมวดหมู่ทั้งหมดของ User มาแสดง (ไม่แยก type แล้ว)
      const { data, error } = await supabase.from('categories').select('*');
      if (data && !error) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-full mt-6">
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 transition-all snap-start
              ${categoryId === cat.id
                ? (type === 'expense' 
                    ? 'border-red-500 bg-red-50 text-red-600' 
                    : 'border-emerald-500 bg-emerald-50 text-emerald-600')
                : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
              }
            `}
          >
            <div className="mb-1">{getIcon(cat.icon_name)}</div>
            <span className="text-xs font-medium">{cat.name}</span>
          </button>
        ))}
        
        {/* ปุ่มเพิ่ม กดแล้ววิ่งไปหน้า Budget */}
        <button 
          onClick={() => router.push('/budget?add=true')}
          className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 active:bg-gray-50 transition-all snap-start"
        >
           <Plus size={24} className="mb-1" />
           <span className="text-xs font-medium">เพิ่ม</span>
        </button>
      </div>
    </div>
  );
}