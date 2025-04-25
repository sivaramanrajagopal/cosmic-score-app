import React, { createContext, useState, useContext, useEffect } from 'react';
import { getPanchangData, getUserSpecificScore } from '../services/panchangService';

// Create context
const AppContext = createContext(null);

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  // State variables
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userNakshatra, setUserNakshatra] = useState(null);
  const [isEnglish, setIsEnglish] = useState(true);
  const [panchangData, setPanchangData] = useState(null);
  const [personalScore, setPersonalScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user nakshatra from localStorage
  useEffect(() => {
    try {
      const savedNakshatra = localStorage.getItem('userNakshatra');
      if (savedNakshatra) {
        setUserNakshatra(JSON.parse(savedNakshatra));
      }
      
      const savedLanguage = localStorage.getItem('isEnglish');
      if (savedLanguage !== null) {
        setIsEnglish(savedLanguage === 'true');
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
    
    // Initial data fetch
    fetchPanchangData(new Date());
  }, []);
  
  // Update personal score when user nakshatra or panchang data changes
  useEffect(() => {
    if (userNakshatra && panchangData) {
      calculatePersonalScore();
    }
  }, [userNakshatra, panchangData]);
  
  // Function to fetch panchang data
  const fetchPanchangData = async (date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching panchang data for:", date);
      const data = await getPanchangData(date);
      setPanchangData(data);
    } catch (err) {
      console.error('Error fetching panchang data:', err);
      setError(isEnglish 
        ? "Failed to fetch cosmic data. Please try again later." 
        : "கோஸ்மிக் தரவைப் பெற முடியவில்லை. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to calculate personal score based on user's nakshatra
  const calculatePersonalScore = async () => {
    if (!userNakshatra) {
      console.log("No user nakshatra set, skipping personal score calculation");
      return;
    }
    
    try {
      console.log("Calculating personal score for nakshatra:", userNakshatra.name);
      const scoreData = await getUserSpecificScore(selectedDate, userNakshatra.id);
      console.log("Received personal score data:", scoreData);
      setPersonalScore(scoreData);
    } catch (err) {
      console.error('Error calculating personal score:', err);
      // Set a basic fallback personalScore with just the score value
      setPersonalScore({
        score: panchangData?.cosmic_score || 5.0,
        tarabalamType: "Unknown",
        isChandrashtama: false,
        cosmicScore: panchangData?.cosmic_score || 5.0
      });
    }
  };
  
  // Function to change date
  const changeDate = (date) => {
    console.log("Changing date to:", date);
    setSelectedDate(date);
    fetchPanchangData(date);
  };
  
  // Function to set user nakshatra
  const setUserNakshatraAndSave = (nakshatra) => {
    console.log("Setting user nakshatra:", nakshatra);
    setUserNakshatra(nakshatra);
    localStorage.setItem('userNakshatra', JSON.stringify(nakshatra));
  };
  
  // Function to toggle language
  const toggleLanguage = () => {
    console.log("Toggling language from", isEnglish ? "English to Tamil" : "Tamil to English");
    setIsEnglish(!isEnglish);
    localStorage.setItem('isEnglish', !isEnglish);
  };
  
  // Function to share to WhatsApp
  const shareToWhatsApp = (customText = null) => {
    try {
      console.log("Sharing to WhatsApp...");
      
      // Format date
      const formattedDate = selectedDate.toLocaleDateString(
        isEnglish ? 'en-US' : 'ta-IN',
        { year: 'numeric', month: 'long', day: 'numeric' }
      );
      
      // Default message
      let message;
      
      if (customText) {
        // Use custom text if provided
        console.log("Using custom text for WhatsApp share");
        message = customText;
      } else {
        // Generate default message
        console.log("Generating default WhatsApp share text");
        message = isEnglish
          ? `My Cosmic Score for ${formattedDate}: ${personalScore?.score || panchangData?.cosmic_score || '-'}/10\n\n` +
            `${userNakshatra ? `Birth Star: ${userNakshatra.name}\n` : ''}` +
            `Get your daily Cosmic Score based on Vedic astrology 🌟`
          : `${formattedDate} அன்றைய எனது கோஸ்மிக் மதிப்பெண்: ${personalScore?.score || panchangData?.cosmic_score || '-'}/10\n\n` +
            `${userNakshatra ? `பிறப்பு நட்சத்திரம்: ${userNakshatra.tamil || userNakshatra.name}\n` : ''}` +
            `வேத ஜோதிடத்தின் அடிப்படையில் உங்கள் தினசரி கோஸ்மிக் மதிப்பெண்ணைப் பெறுங்கள் 🌟`;
      }
      
      // Encode the message for WhatsApp
      const encodedMessage = encodeURIComponent(message);
      
      // Generate WhatsApp link
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      
      console.log("Opening WhatsApp with URL:", whatsappUrl);
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Error sharing to WhatsApp:', err);
      // Simple fallback if there's an error
      try {
        const fallbackMessage = `My Cosmic Score: ${personalScore?.score || panchangData?.cosmic_score || '-'}/10`;
        window.open(`https://wa.me/?text=${encodeURIComponent(fallbackMessage)}`, '_blank');
      } catch (fallbackError) {
        console.error('Fallback sharing also failed:', fallbackError);
        alert(isEnglish 
          ? "Could not open WhatsApp. Please try again later." 
          : "வாட்ஸ்அப்பைத் திறக்க முடியவில்லை. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.");
      }
    }
  };
  
  // Context value
  const contextValue = {
    selectedDate,
    userNakshatra,
    isEnglish,
    panchangData,
    personalScore,
    isLoading,
    error,
    changeDate,
    setUserNakshatra: setUserNakshatraAndSave,
    toggleLanguage,
    shareToWhatsApp
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Export the context and provider
export { AppContext };
export default AppProvider;