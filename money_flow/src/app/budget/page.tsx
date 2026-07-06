'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { Coffee, Utensils, Bus, ShoppingBag, Briefcase, PiggyBank, CircleHelp, Plus, X, Trash2, Edit2, Check } from 'lucide-react';
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Utensils');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 

  const [hideTarget, setHideTarget] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchBudgetData();
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('add') === 'true') {
        setShowAddForm(true);
      }
    }
  }, []);

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
        };
      });

      setCategories(calculatedCategories);
    } catch (error: any) {
      console.error('Error fetching budget data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลงบประมาณ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('กรุณาเข้าสู่ระบบ');

      const { error } = await supabase.from('categories').insert([{
        user_id: user.id,
        name: newCatName,
        type: 'expense',
        monthly_budget: 0, 
        icon_name: newCatIcon
      }]);

      if (error) throw error;

      toast.success('สร้างซองเงินสำเร็จ!');
      setShowAddForm(false);
      setNewCatName('');
      setNewCatIcon('Utensils');
      fetchBudgetData();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
    } finally {
      setIsSaving(false);
    }
  };

  const executeHide = async () => {
    if (!hideTarget) return;
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', hideTarget.id);

      if (error) throw error;
      
      toast.success(`ซ่อนซอง "${hideTarget.name}" แล้ว`);
      fetchBudgetData(); 
    } catch (error) {
      console.error('Error hiding category:', error);
      toast.error('เกิดข้อผิดพลาดในการซ่อนหมวดหมู่');
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
        isOpen={!!hideTarget}
        title={`ซ่อน "${hideTarget?.name}"?`}
        message="ประวัติการใช้จ่ายในอดีตจะยังคงอยู่ครบถ้วน\nแต่หมวดหมู่นี้จะไม่แสดงในหน้าจอสำหรับจดบันทึกอีกต่อไป"
        onConfirm={executeHide}
        onCancel={() => setHideTarget(null)}
        confirmText="ซ่อนหมวดหมู่"
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดสรรเงินเดือนนี้</h1>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center
              ${isEditMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
            `}
          >
            {isEditMode ? <Check size={24} /> : <Edit2 size={24} />}
          </button>

          {!isEditMode && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-lg mb-6 relative">
          <button 
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-800 mb-4">สร้างหมวดหมู่ใหม่</h2>
          
          <form onSubmit={handleAddCategory} className="space-y-4">
            <Input
              label="ชื่อหมวดหมู่"
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="เช่น ค่าอาหาร, เงินเก็บ, เที่ยว"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เลือกไอคอน</label>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setNewCatIcon(icon.name)}
                    className={`p-3 rounded-xl border-2 flex-shrink-0 transition-all
                      ${newCatIcon === icon.name ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-gray-50 text-gray-500'}
                    `}
                  >
                    {icon.component}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <Button type="submit" isLoading={isSaving} loadingText="กำลังสร้าง...">
                สร้างหมวดหมู่
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {categories.map((category) => {
          const percentUsed = category.allocated_amount > 0 
            ? Math.min((category.spent_amount / category.allocated_amount) * 100, 100)
            : (category.spent_amount > 0 ? 100 : 0);
            
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
                    <button 
                      onClick={() => setHideTarget({ id: category.id, name: category.name })}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={24} />
                    </button>
                  ) : (
                    <div className="p-2 bg-gray-50 text-gray-600 rounded-xl">
                      {getIcon(category.icon_name)}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-xs text-gray-400">
                      ใช้ไป ฿{category.spent_amount.toLocaleString()} 
                      {hasBudget && ` / ฿${category.allocated_amount.toLocaleString()}`}
                    </p>
                  </div>
                </div>
                
                {!isEditMode && (
                  <div className="text-right">
                    {hasBudget || isOverBudget ? (
                       <p className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-gray-800'}`}>
                         {isOverBudget ? 'เงินช็อต' : `เหลือ ฿${remaining.toLocaleString()}`}
                       </p>
                    ) : (
                      <p className="font-medium text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">ซองเงินว่างเปล่า</p>
                    )}
                  </div>
                )}
              </div>

              {(hasBudget || category.spent_amount > 0) && (
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${barColor}`} 
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
        {categories.length === 0 && !showAddForm && (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">คุณยังไม่มีซองเงินสำหรับจัดสรรงบ</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg"
            >
              สร้างซองเงินแรกของคุณ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}