import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'expense' | 'income';
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  loadingText = 'กำลังประมวลผล...',
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  
  const baseStyle = "w-full py-3.5 rounded-xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed shadow-md";
  
  // รองรับหลายสีเพื่อให้ใช้ได้ทั้งแอปรวมถึงหน้าแรก (แดง/เขียว)
  const variants = {
    primary: "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-none",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 shadow-none",
    expense: "bg-red-500 text-white shadow-red-200 hover:bg-red-600",
    income: "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="animate-pulse">{loadingText}</span> : children}
    </button>
  );
}