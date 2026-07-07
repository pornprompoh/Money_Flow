'use client';
import { useTransactionStore } from '@/store/useTransactionStore';

export default function QuickAmount() {
  const { amount, setAmount } = useTransactionStore();

  const handleAddAmount = (value: number) => {
    const currentVal = Number(amount) || 0;
    setAmount((currentVal + value).toString());
  };

  const handleClear = () => {
    setAmount('0');
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {[1, 2, 5, 10, 20, 50, 100, 500, 1000].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleAddAmount(num)}
            className="bg-gray-50 py-3.5 rounded-xl text-lg font-bold text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-100 active:bg-blue-50 active:text-blue-600 active:scale-95 transition-all"
          >
            +{num}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="w-full bg-red-50/50 py-3 rounded-xl text-red-500 font-bold shadow-sm border border-red-50 hover:bg-red-50 active:bg-red-100 active:scale-[0.98] transition-all mb-6"
      >
        ล้างตัวเลข (Clear)
      </button>
    </div>
  );
}