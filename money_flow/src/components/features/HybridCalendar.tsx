'use client';
import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays, X } from 'lucide-react';

const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const TH_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

interface HybridCalendarProps {
  currentDate: string; 
  onChangeDate: (date: string) => void;
}

export default function HybridCalendar({ currentDate, onChangeDate }: HybridCalendarProps) {
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // วันที่หลักของหน้า Dashboard
  const dateObj = dayjs(currentDate);
  const today = dayjs();

  // State สำหรับจัดการหน้าปฏิทิน Modal (ซ้อนหน้าต่าง)
  const [internalDate, setInternalDate] = useState(dayjs(currentDate));
  const [modalView, setModalView] = useState<'days' | 'months' | 'years'>('days');

  // ซิงค์ internalDate หาก props currentDate เปลี่ยนจากภายนอก
  useEffect(() => {
    setInternalDate(dayjs(currentDate));
  }, [currentDate]);

  const daysInMonth = dateObj.daysInMonth();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => dateObj.date(i + 1));

  // โฟกัสวันที่ในแถบเลื่อนอัตโนมัติ
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('.active-day') as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentDate]);

  // เมื่อกดเปิดปฏิทิน ให้เซ็ตค่าเริ่มต้นเป็นเดือนปัจจุบัน
  const handleOpenModal = () => {
    setInternalDate(dayjs(currentDate));
    setModalView('days');
    setShowModal(true);
  };

  // ฟังก์ชันเลื่อนปฏิทินใน Modal
  const handleModalPrev = () => {
    if (modalView === 'days') setInternalDate(internalDate.subtract(1, 'month'));
    if (modalView === 'months') setInternalDate(internalDate.subtract(1, 'year'));
    if (modalView === 'years') setInternalDate(internalDate.subtract(12, 'year'));
  };

  const handleModalNext = () => {
    if (modalView === 'days') setInternalDate(internalDate.add(1, 'month'));
    if (modalView === 'months') setInternalDate(internalDate.add(1, 'year'));
    if (modalView === 'years') setInternalDate(internalDate.add(12, 'year'));
  };

  // ส่วนแสดงผลเนื้อหาใน Modal สลับโหมด วัน / เดือน / ปี
  const renderModalContent = () => {
    // โหมดเลือกเดือน
    if (modalView === 'months') {
      return (
        <div className="grid grid-cols-3 gap-2">
          {TH_MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => {
                setInternalDate(internalDate.month(i));
                setModalView('days'); // เลือกเสร็จกลับไปหน้าเลือกวัน
              }}
              className={`py-4 rounded-2xl text-sm font-medium transition-all 
                ${internalDate.month() === i ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
              `}
            >
              {m}
            </button>
          ))}
        </div>
      );
    }

    // โหมดเลือกปี (โชว์ทีละ 12 ปี)
    if (modalView === 'years') {
      const startYear = Math.floor(internalDate.year() / 12) * 12;
      const years = Array.from({ length: 12 }, (_, i) => startYear + i);
      
      return (
        <div className="grid grid-cols-3 gap-2">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => {
                setInternalDate(internalDate.year(y));
                setModalView('months'); // เลือกเสร็จกลับไปหน้าเลือกเดือน
              }}
              className={`py-4 rounded-2xl text-sm font-medium transition-all 
                ${internalDate.year() === y ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
              `}
            >
              {y}
            </button>
          ))}
        </div>
      );
    }

    // ค่าเริ่มต้น: โหมดเลือกวัน (ตารางปฏิทิน)
    const startOfMonth = internalDate.startOf('month');
    const startDayOfWeek = startOfMonth.day();
    const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);
    const internalDaysInMonth = internalDate.daysInMonth();
    const internalMonthDays = Array.from({ length: internalDaysInMonth }, (_, i) => internalDate.date(i + 1));

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 mb-2">
          {TH_DAYS_SHORT.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map(b => <div key={`blank-${b}`} className="p-2"></div>)}
          {internalMonthDays.map(d => {
            const isSelected = d.isSame(dateObj, 'day'); // เช็คจากวันที่ใช้จริง
            const isToday = d.isSame(today, 'day');
            return (
              <button
                key={d.format('DD')}
                onClick={() => {
                  onChangeDate(d.toISOString()); // อัปเดตของจริงที่นี่
                  setShowModal(false); // เลือกเสร็จปิดหน้าต่าง
                }}
                className={`p-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center
                  ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 
                    isToday ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                {d.date()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm mb-6">
      
      {/* 1. แถบหัวปฏิทินหลัก (ด้านนอก) */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={() => onChangeDate(dateObj.subtract(1, 'month').toISOString())} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
          {TH_MONTHS[dateObj.month()]} {dateObj.year()}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleOpenModal} className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <CalendarDays size={20} />
          </button>
          <button onClick={() => onChangeDate(dateObj.add(1, 'month').toISOString())} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* 2. แถบเลื่อนวันที่แนวนอน (ด้านนอก) */}
      <div ref={scrollRef} className="flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar">
        {monthDays.map(d => {
          const isSelected = d.isSame(dateObj, 'day');
          return (
            <button
              key={d.format('DD')}
              onClick={() => onChangeDate(d.toISOString())}
              className={`snap-center flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border-2 transition-all
                ${isSelected ? 'border-blue-500 bg-blue-600 text-white active-day shadow-md shadow-blue-200' : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'}
              `}
            >
              <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>{d.date()}</span>
              <span className="text-xs">{TH_DAYS_SHORT[d.day()]}</span>
            </button>
          );
        })}
      </div>
      
      {!dateObj.isSame(today, 'day') && (
        <div className="mt-3 flex justify-center">
          <button onClick={() => onChangeDate(today.toISOString())} className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-100 transition-colors">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> กลับมาวันนี้
          </button>
        </div>
      )}

      {/* 3. Modal ปฏิทินสุดล้ำ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            
            {/* หัว Modal ดีไซน์ใหม่ - คลีนและอยู่บรรทัดเดียว */}
            <div className="relative flex justify-center items-center mb-6 min-h-[40px]">
              
              {/* กลุ่มตรงกลาง: < เดือน ปี > */}
              <div className="flex items-center gap-2">
                <button onClick={handleModalPrev} className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronLeft size={20}/>
                </button>

                <div className="flex items-center gap-1 font-bold text-gray-800 text-lg">
                  {modalView === 'days' && (
                    <>
                      <span onClick={() => setModalView('months')} className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1">
                        {TH_MONTHS[internalDate.month()]} <ChevronDown size={14} className="opacity-50" />
                      </span>
                      <span onClick={() => setModalView('years')} className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1">
                        {internalDate.year()} <ChevronDown size={14} className="opacity-50" />
                      </span>
                    </>
                  )}
                  {modalView === 'months' && (
                    <span onClick={() => setModalView('years')} className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 text-blue-600">
                      ปี {internalDate.year()} <ChevronDown size={14} className="opacity-50" />
                    </span>
                  )}
                  {modalView === 'years' && (
                    <span className="px-2 py-1 text-blue-600">
                      {Math.floor(internalDate.year() / 12) * 12} - {Math.floor(internalDate.year() / 12) * 12 + 11}
                    </span>
                  )}
                </div>

                <button onClick={handleModalNext} className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronRight size={20}/>
                </button>
              </div>

              {/* ปุ่มปิด X ย้ายไปชิดขวาสุด */}
              <button onClick={() => setShowModal(false)} className="absolute right-0 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* แสดงเนื้อหา (วัน/เดือน/ปี) - (ไม่ต้องแก้ไขส่วน renderModalContent ด้านล่าง) */}
            {renderModalContent()}

          </div>
        </div>
      )}
    </div>
  );
}