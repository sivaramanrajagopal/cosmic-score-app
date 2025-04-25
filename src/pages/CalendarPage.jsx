import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CalendarPage = () => {
  const { selectedDate, changeDate, isEnglish } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate number of days in previous month
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    
    // Calculate days to display from previous month
    const prevMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(year, month - 1, daysInPreviousMonth - i),
        isCurrentMonth: false
      });
    }
    
    // Calculate days in current month
    const currentMonthDays = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Calculate days to display from next month
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const daysNeeded = 42 - totalDaysDisplayed; // 6 rows of 7 days
    
    for (let i = 1; i <= daysNeeded; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    // Combine all days
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const days = generateCalendarDays();
  
  // Format month and year for display
  const monthYearText = currentMonth.toLocaleDateString(
    isEnglish ? 'en-US' : 'ta-IN',
    { year: 'numeric', month: 'long' }
  );
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    changeDate(date);
  };
  
  // Check if a date is the same as the currently selected date
  const isSameDate = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return isSameDate(date, today);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D1B54] to-[#1A1046] p-5 text-white shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">
            📅 {isEnglish ? "Calendar" : "நாட்காட்டி"}
          </h1>
        </div>
        
        <div className="flex justify-between items-center">
          <Link to="/" className="text-indigo-200 hover:text-white">
            {isEnglish ? "Back to Home" : "முகப்புக்குத் திரும்பு"}
          </Link>
        </div>
      </div>
      
      {/* Calendar */}
      <div className="p-5">
        {/* Month and Year Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &lt;
          </button>
          <h2 className="font-bold text-lg">{monthYearText}</h2>
          <button 
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &gt;
          </button>
        </div>
        
        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div 
              key={day} 
              className="text-center font-medium text-sm py-2"
            >
              {isEnglish ? day : ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'][index]}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(day.date)}
              className={`
                h-12 rounded-lg text-center 
                ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                ${isSameDate(day.date, selectedDate) ? 'bg-[#2D1B54] text-white' : ''}
                ${isToday(day.date) && !isSameDate(day.date, selectedDate) ? 'border border-indigo-600' : ''}
                ${day.isCurrentMonth && !isSameDate(day.date, selectedDate) && !isToday(day.date) ? 'hover:bg-indigo-50' : ''}
              `}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
        
        {/* Current Selection Info */}
        <div className="mt-6 p-4 bg-[#F8F3E6]/70 rounded-lg border border-[#E3B23C]/20">
          <h3 className="font-medium mb-2">
            {isEnglish ? "Selected Date:" : "தேர்ந்தெடுக்கப்பட்ட தேதி:"}
          </h3>
          <p className="text-indigo-600 font-bold">
            {selectedDate.toLocaleDateString(
              isEnglish ? 'en-US' : 'ta-IN',
              { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </p>
        </div>
        
        {/* Back to Home Button */}
        <Link 
  to="/"
  className="w-full mt-6 bg-gradient-to-r from-[#2D1B54] to-[#1A1046] hover:from-[#1A1046] hover:to-[#2D1B54] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center">
          {isEnglish ? "View Cosmic Score" : "கோஸ்மிக் மதிப்பெண்ணைக் காண்க"}
        </Link>
      </div>
    </div>
  );
};

export default CalendarPage;