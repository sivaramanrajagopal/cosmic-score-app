import { supabase } from './utils/supabaseClient';
import React, { useEffect } from 'react';
import { initializeNotifications } from './utils/notificationService';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';
import { AppProvider } from './context/AppContext';

function App() {
  useEffect(() => {
    async function testSupabase() {
      try {
        console.log("Testing Supabase connection...");
        const { data, error } = await supabase.from('daily_panchangam').select('*').limit(1);
        
        if (error) {
          console.error("Supabase test error:", error);
        } else {
          console.log("Supabase test successful:", data);
        }
      } catch (err) {
        console.error("Supabase test exception:", err);
      }
    }
    initializeNotifications();
    testSupabase();
  }, []);
  
  return (
    <AppProvider>
      <Router>
        {/* 
          Fixed centering by using fixed width container with margin auto
          and making sure the content is centered within the container
        */}
        <div className="min-h-screen bg-gradient-to-b from-[#F8F3E6] to-white py-4 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto px-4"> 
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;