import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const CalendarPage = () => {
  // Using React's useContext directly instead of the custom hook
  const context = useContext(AppContext);
  const { selectedDate, changeDate, isEnglish } = context || {};
  
  // Initialize with noon time to avoid timezone date shifting
  const [currentMonth, setCurrentMonth] = useState(() => {
    const dateToUse = selectedDate || new Date();
    // Create a date with the same year, month components to avoid timezone shifts
    return new Date(dateToUse.getFullYear(), dateToUse.getMonth(), 1, 12, 0, 0);
  });
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month - set to noon to avoid timezone shifts
    const firstDay = new Date(year, month, 1, 12, 0, 0);
    // Get last day of month - set to noon to avoid timezone shifts
    const lastDay = new Date(year, month + 1, 0, 12, 0, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate number of days in previous month
    const daysInPreviousMonth = new Date(year, month, 0, 12, 0, 0).getDate();
    
    // Calculate days to display from previous month
    const prevMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        // Set to noon time to avoid timezone date shifts
        date: new Date(year, month - 1, daysInPreviousMonth - i, 12, 0, 0),
        isCurrentMonth: false
      });
    }
    
    // Calculate days in current month
    const currentMonthDays = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      currentMonthDays.push({
        // Set to noon time to avoid timezone date shifts
        date: new Date(year, month, i, 12, 0, 0),
        isCurrentMonth: true
      });
    }
    
    // Calculate days to display from next month
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const daysNeeded = 42 - totalDaysDisplayed; // 6 rows of 7 days
    
    for (let i = 1; i <= daysNeeded; i++) {
      nextMonthDays.push({
        // Set to noon time to avoid timezone date shifts
        date: new Date(year, month + 1, i, 12, 0, 0),
        isCurrentMonth: false
      });
    }
    
    // Combine all days
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const days = generateCalendarDays();
  
  // Format month and year for display - use UTC to ensure consistent display
  const monthYearText = currentMonth.toLocaleDateString(
    isEnglish ? 'en-US' : 'ta-IN',
    { year: 'numeric', month: 'long', timeZone: 'UTC' }
  );
  
  // Handle month navigation - ensure noon time to avoid timezone shifts
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    // Maintain noon time
    newDate.setHours(12, 0, 0, 0);
    setCurrentMonth(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    // Maintain noon time
    newDate.setHours(12, 0, 0, 0);
    setCurrentMonth(newDate);
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    if (changeDate) {
      // Ensure we have a proper Date object with noon time to prevent date shifting
      const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0  // Set to noon local time to avoid timezone issues with date boundaries
      );
      
      console.log("Calendar selected date (local):", localDate);
      changeDate(localDate);
    }
  };
  
  // Check if a date is the same as the currently selected date
  // Only compare year, month, day - not time
  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    // Compare only year, month, and day components
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  // Check if a date is today - compare only year, month, day
  const isToday = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };
  
  // If context is null, show loading
  if (!context) {
    return <div className="p-5 text-center">Loading calendar...</div>;
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D1B54] to-[#1A1046] p-5 text-white shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-white">
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
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray">{monthYearText}</h2>
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
              className="text-center font-medium text-sm py-2 text-gray-700 dark:text-gray-300"
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
                ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}
                ${isSameDate(day.date, selectedDate) ? 'bg-[#2D1B54] text-white' : ''}
                ${isToday(day.date) && !isSameDate(day.date, selectedDate) ? 'border border-indigo-600 dark:border-indigo-400' : ''}
                ${day.isCurrentMonth && !isSameDate(day.date, selectedDate) && !isToday(day.date) ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900' : ''}
              `}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
        
        {/* Current Selection Info */}
        <div className="mt-6 p-4 bg-[#F8F3E6]/70 dark:bg-gray-800 rounded-lg border border-[#E3B23C]/20 dark:border-indigo-500/30">
          <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
            {isEnglish ? "Selected Date:" : "தேர்ந்தெடுக்கப்பட்ட தேதி:"}
          </h3>
          <p className="text-indigo-600 dark:text-indigo-300 font-bold">
            {selectedDate && selectedDate.toLocaleDateString(
              isEnglish ? 'en-US' : 'ta-IN',
              { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
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