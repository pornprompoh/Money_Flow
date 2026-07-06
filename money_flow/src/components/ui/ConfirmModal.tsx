import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export default function ConfirmModal({ 
  isOpen, title, message, onConfirm, onCancel, confirmText = 'ยืนยัน' 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-red-100 text-red-500 rounded-2xl">
            <AlertTriangle size={28} />
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed whitespace-pre-line">{message}</p>
        
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}