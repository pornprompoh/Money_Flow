import { create } from 'zustand';

interface TransactionState {
  amount: number;
  type: 'expense' | 'income';
  categoryId: string | null;
  setType: (type: 'expense' | 'income') => void;
  addAmount: (value: number) => void;
  setAmount: (value: number) => void; // <--- 1. เพิ่มบรรทัดนี้
  clearAmount: () => void;
  setCategory: (id: string) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  amount: 0,
  type: 'expense',
  categoryId: null,
  setType: (type) => set({ type, categoryId: null }),
  addAmount: (value) => set((state) => ({ amount: state.amount + value })),
  setAmount: (value) => set({ amount: value }), // <--- 2. เพิ่มบรรทัดนี้
  clearAmount: () => set({ amount: 0, categoryId: null }),
  setCategory: (id) => set({ categoryId: id }),
}));