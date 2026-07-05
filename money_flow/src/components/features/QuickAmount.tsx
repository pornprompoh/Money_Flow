'use client';
import { useTransactionStore } from '@/store/useTransactionStore';

// จำลองค่าเงินตามเหรียญและธนบัตร
const AMOUNTS = [
  { label: '+1', value: 1 },
  { label: '+2', value: 2 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
  { label: '+20', value: 20 },
  { label: '+50', value: 50 },
  { label: '+100', value: 100 },
  { label: '+500', value: 500 },
  { label: '+1000', value: 1000 },
];

export default function QuickAmount() {
  const { addAmount, clearAmount } = useTransactionStore();

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-3">
        {AMOUNTS.map((item) => (
          <button
            key={item.value}
            onClick={() => addAmount(item.value)}
            className="h-14 bg-gray-100 rounded-2xl text-lg font-medium active:bg-blue-100 active:scale-95 transition-all touch-manipulation text-gray-800 shadow-sm"
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        onClick={clearAmount}
        className="w-full h-12 mt-4 bg-red-50 text-red-500 rounded-2xl font-medium active:bg-red-100 active:scale-95 transition-all touch-manipulation"
      >
        ล้างตัวเลข (Clear)
      </button>
    </div>
  );
}