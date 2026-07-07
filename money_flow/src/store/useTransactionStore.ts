import { create } from 'zustand';

interface TransactionState {
  amount: string;
  type: 'income' | 'expense';
  categoryId: string;
  note: string; // 👈 1. เพิ่มตัวแปร note
  setAmount: (amount: string) => void;
  setType: (type: 'income' | 'expense') => void;
  setCategory: (id: string) => void;
  setNote: (note: string) => void; // 👈 2. เพิ่มฟังก์ชัน setNote
  reset: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  amount: '0',
  type: 'expense',
  categoryId: '',
  note: '', // 👈 3. ค่าเริ่มต้นเป็นค่าว่าง
  setAmount: (amount) => set({ amount }),
  setType: (type) => set({ type, categoryId: '' }),
  setCategory: (categoryId) => set({ categoryId }),
  setNote: (note) => set({ note }), // 👈 4. ฟังก์ชันอัปเดตค่า
  reset: () => set({ amount: '0', categoryId: '', note: '' }), // 👈 5. ตอนรีเซ็ตให้ล้างค่าโน้ตด้วย
}));