'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { Coffee, Utensils, Bus, ShoppingBag, Briefcase, PiggyBank, CircleHelp, Plus, X, Trash2, Edit2, Check, Sparkles, ArrowRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface CategoryProgress {
  id: string;
  name: string;
  allocated_amount: number;
  spent_amount: number;
  icon_name: string;
  is_savings_target: boolean;
}

const AVAILABLE_ICONS = [
  { name: 'Utensils', component: <Utensils size={24} /> },
  { name: 'Coffee', component: <Coffee size={24} /> },
  { name: 'Bus', component: <Bus size={24} /> },
  { name: 'ShoppingBag', component: <ShoppingBag size={24} /> },
  { name: 'PiggyBank', component: <PiggyBank size={24} /> },
];

const getIcon = (iconName: string) => {
  const icon = AVAILABLE_ICONS.find(i => i.name === iconName);
  return icon ? icon.component : <CircleHelp size={24} />;
};

export default function BudgetPage() {
  const [categories, setCategories] = useState<CategoryProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับฟอร์มเพิ่มหมวดหมู่
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Utensils');
  const [newCatIsSavings, setNewCatIsSavings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 

  const [hideTarget, setHideTarget] = useState<{id: string, name: string} | null>(null);

  // State สำหรับการตรวจจับเงินเหลือเดือนที่แล้ว
  const [leftoverAmount, setLeftoverAmount] = useState<number>(0);
  const [isRollingOver, setIsRollingOver] = useState(false);

  useEffect(() => {
    fetchBudgetData();
    checkLastMonthLeftovers();
  }, []);

  // 1. ดึงข้อมูลของเดือนปัจจุบัน
  const fetchBudgetData = async () => {
    setIsLoading(true);
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (categoryError) throw categoryError;

      const startOfMonth = dayjs().startOf('month').toISOString();
      const endOfMonth = dayjs().endOf('month').toISOString();
      
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('category_id, amount, type')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);
      if (txError) throw txError;

      const safeCategoryData = categoryData || [];
      const safeTxData = txData || [];

      const calculatedCategories = safeCategoryData.map((category) => {
        const allocated = safeTxData
          .filter((tx) => tx.category_id === category.id && tx.type === 'income')
          .reduce((sum, tx) => sum + Number(tx.amount), 0);

        const spent = safeTxData
          .filter((tx) => tx.category_id === category.id && tx.type === 'expense')
          .reduce((sum, tx) => sum + Number(tx.amount), 0);

        return {
          id: category.id,
          name: category.name,
          allocated_amount: allocated,
          spent_amount: spent,
          icon_name: category.icon_name,
          is_savings_target: category.is_savings_target || false
        };
      });

      // 🛠️ โค้ดจัดเรียง (Sort) ดันซองเงินเก็บไปไว้ล่างสุด
      calculatedCategories.sort((a, b) => {
        if (a.is_savings_target && !b.is_savings_target) return 1;
        if (!a.is_savings_target && b.is_savings_target) return -1;
        return 0;
      });

      setCategories(calculatedCategories);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลงบประมาณ');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. ตรวจสอบว่าเดือนที่แล้วมีเงินเหลือค้างซองไหม
  const checkLastMonthLeftovers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const lastMonthStart = dayjs().subtract(1, 'month').startOf('month').toISOString();
      const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month').toISOString();

      const { data: txData } = await supabase
        .from('transactions')
        .select('category_id, amount, type')
        .gte('created_at', lastMonthStart)
        .lte('created_at', lastMonthEnd)
        .eq('user_id', user.id);

      const { data: catData } = await supabase
        .from('categories')
        .select('id, is_savings_target')
        .eq('is_active', true)
        .eq('user_id', user.id);

      if (!txData || !catData) return;

      let totalLeftover = 0;

      catData.forEach(cat => {
        if (cat.is_savings_target) return;

        const allocated = txData.filter(t => t.category_id === cat.id && t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const spent = txData.filter(t => t.category_id === cat.id && t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        
        if (allocated - spent > 0) {
          totalLeftover += (allocated - spent);
        }
      });

      setLeftoverAmount(totalLeftover);
    } catch (error) {
      console.error('Error checking leftovers:', error);
    }
  };

  // 3. ฟังก์ชันการปิดยอดและโยกเงินเข้าซองเงินเก็บหลัก
  const handleMonthlyRollover = async () => {
    setIsRollingOver(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('กรุณาเข้าสู่ระบบ');

      const { data: savingsCat } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_savings_target', true)
        .eq('is_active', true)
        .limit(1);

      if (!savingsCat || savingsCat.length === 0) {
        throw new Error('ไม่พบซองเงินเก็บหลัก กรุณาสร้างหรือตั้งค่าซองเงินเก็บหลักก่อนครับ');
      }

      const targetSavingsId = savingsCat[0].id;
      const lastMonthStart = dayjs().subtract(1, 'month').startOf('month').toISOString();
      const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month').toISOString();

      const { data: txData } = await supabase.from('transactions').select('*').gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd).eq('user_id', user.id);
      const { data: catData } = await supabase.from('categories').select('*').eq('is_active', true).eq('user_id', user.id);

      if (!txData || !catData) return;

      const newTransactions: any[] = [];
      const lastDayOfLastMonth = dayjs().subtract(1, 'month').endOf('day').toISOString();
      const firstDayOfNewMonth = dayjs().startOf('month').toISOString();

      catData.forEach(cat => {
        if (cat.is_savings_target) return;

        const allocated = txData.filter(t => t.category_id === cat.id && t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const spent = txData.filter(t => t.category_id === cat.id && t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        const remaining = allocated - spent;

        if (remaining > 0) {
          newTransactions.push({
            user_id: user.id,
            category_id: cat.id,
            amount: remaining,
            type: 'expense',
            note: `ระบบยกยอดเงินเหลือไปซองเงินเก็บ`,
            created_at: lastDayOfLastMonth
          });

          newTransactions.push({
            user_id: user.id,
            category_id: targetSavingsId,
            amount: remaining,
            type: 'income',
            note: `เงินยกยอดมาจากซอง "${cat.name}"`,
            created_at: firstDayOfNewMonth
          });
        }
      });

      if (newTransactions.length > 0) {
        const { error: insertError } = await supabase.from('transactions').insert(newTransactions);
        if (insertError) throw insertError;
      }

      toast.success(`ปิดยอดสำเร็จ! ย้ายเงินเก็บเข้าซองเรียบร้อย ฿${leftoverAmount.toLocaleString()}`);
      setLeftoverAmount(0);
      fetchBudgetData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการโอนเงินเก็บ');
    } finally {
      setIsRollingOver(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('กรุณาเข้าสู่ระบบ');

      if (newCatIsSavings) {
        await supabase
          .from('categories')
          .update({ is_savings_target: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase.from('categories').insert([{
        user_id: user.id,
        name: newCatName,
        type: 'expense',
        monthly_budget: 0, 
        icon_name: newCatIcon,
        is_savings_target: newCatIsSavings
      }]);

      if (error) throw error;

      toast.success('สร้างซองเงินสำเร็จ!');
      setShowAddForm(false);
      setNewCatName('');
      setNewCatIcon('Utensils');
      setNewCatIsSavings(false);
      fetchBudgetData();
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  };

  const executeHide = async () => {
    if (!hideTarget) return;
    try {
      const { error } = await supabase.from('categories').update({ is_active: false }).eq('id', hideTarget.id);
      if (error) throw error;
      toast.success(`ซ่อนซอง "${hideTarget.name}" แล้ว`);
      fetchBudgetData(); 
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setHideTarget(null);
    }
  };

  if (isLoading) {
    return <div className="p-6 flex justify-center items-center h-screen text-gray-500">กำลังคำนวณงบประมาณ...</div>;
  }

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <ConfirmModal 
        isOpen={!!hideTarget} title={`ซ่อน "${hideTarget?.name}"?`}
        message="ประวัติเก่าจะไม่หายไป แต่จะไม่แสดงในหน้าบันทึกอีก"
        onConfirm={executeHide} onCancel={() => setHideTarget(null)} confirmText="ซ่อนหมวดหมู่"
      />

      {leftoverAmount > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-5 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex gap-3 items-start">
            <div className="p-2 bg-blue-500 text-white rounded-2xl shadow-md shadow-blue-100">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">ยินดีด้วย! เดือนที่แล้วมีเงินเหลือ</h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                มีเงินทอนสะสมค้างในซองรวมกันทั้งหมด <span className="font-bold text-blue-600">฿{leftoverAmount.toLocaleString()}</span> บาท อยากโยกเข้าซองเงินเก็บหลักเลยไหมครับ?
              </p>
              <button 
                onClick={handleMonthlyRollover}
                disabled={isRollingOver}
                className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center justify-center gap-1"
              >
                {isRollingOver ? 'กำลังโอนเงิน...' : 'เก็บเงินทอนเข้าซองเงินเก็บหล่อๆ'} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดสรรเงินเดือนนี้</h1>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center ${isEditMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            {isEditMode ? <Check size={24} /> : <Edit2 size={24} />}
          </button>
          {!isEditMode && (
            <button onClick={() => setShowAddForm(true)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-lg mb-6 relative animate-in zoom-in-95">
          <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
          <h2 className="text-lg font-bold text-gray-800 mb-4">สร้างหมวดหมู่ใหม่</h2>
          
          <form onSubmit={handleAddCategory} className="space-y-4">
            <Input
              label="ชื่อหมวดหมู่" type="text" required value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)} placeholder="เช่น ค่าอาหาร, เงินเก็บ, เที่ยว"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เลือกไอคอน</label>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon.name} type="button" onClick={() => setNewCatIcon(icon.name)}
                    className={`p-3 rounded-xl border-2 flex-shrink-0 transition-all ${newCatIcon === icon.name ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-gray-50 text-gray-500'}`}
                  >
                    {icon.component}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 bg-gray-50 p-3 rounded-2xl cursor-pointer hover:bg-gray-100/70 transition-colors select-none">
              <input 
                type="checkbox" checked={newCatIsSavings} onChange={(e) => setNewCatIsSavings(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">ตั้งเป็นซองเงินเก็บหลัก</span>
                <span className="text-xs text-gray-400 mt-0.5">ใช้ซองนี้สำหรับรองรับเงินทอน/เงินเหลือสะสมทั้งหมดตอนสิ้นเดือน</span>
              </div>
            </label>
            
            <div className="pt-2">
              <Button type="submit" isLoading={isSaving} loadingText="กำลังสร้าง...">สร้างหมวดหมู่</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {categories.map((category) => {
          const percentUsed = category.allocated_amount > 0 ? Math.min((category.spent_amount / category.allocated_amount) * 100, 100) : (category.spent_amount > 0 ? 100 : 0);
          const remaining = category.allocated_amount - category.spent_amount;
          const isOverBudget = remaining < 0;
          const hasBudget = category.allocated_amount > 0;

          let barColor = 'bg-emerald-500';
          if (percentUsed >= 80 || isOverBudget) barColor = 'bg-red-500';
          else if (percentUsed >= 60) barColor = 'bg-amber-400';

          return (
            <div key={category.id} className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${isEditMode ? 'border-red-200' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  {isEditMode ? (
                    <button onClick={() => setHideTarget({ id: category.id, name: category.name })} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={24} /></button>
                  ) : (
                    <div className={`p-2 rounded-xl ${category.is_savings_target ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-600'}`}>
                      {getIcon(category.icon_name)}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-gray-800">{category.name}</h3>
                      {category.is_savings_target && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">ซองเงินเก็บหลัก</span>}
                    </div>
                    {!category.is_savings_target && (
                      <p className="text-xs text-gray-400">ใช้ไป ฿{category.spent_amount.toLocaleString()} {hasBudget && ` / ฿${category.allocated_amount.toLocaleString()}`}</p>
                    )}
                  </div>
                </div>
                
                {!isEditMode && (
                  <div className="text-right">
                    {category.is_savings_target ? (
                       <p className="font-bold text-blue-600 text-lg">฿{remaining.toLocaleString()}</p>
                    ) : hasBudget || isOverBudget ? (
                       <p className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-gray-800'}`}>{isOverBudget ? 'เงินช็อต' : `เหลือ ฿${remaining.toLocaleString()}`}</p>
                    ) : (
                      <p className="font-medium text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">ซองว่างเปล่า</p>
                    )}
                  </div>
                )}
              </div>

              {!category.is_savings_target && (hasBudget || category.spent_amount > 0) && (
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${barColor}`} style={{ width: `${percentUsed}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}