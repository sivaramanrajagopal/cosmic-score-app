import React, { createContext, useState, useContext, useEffect } from 'react';
import { getPanchangData, getUserSpecificScore, normalizeDate } from '../services/panchangService';

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
  // State variables - initialize date with noon time to avoid timezone issues
  const [selectedDate, setSelectedDate] = useState(() => {
    // Always initialize with noon time to avoid timezone date shifting
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  });
  
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
      
      // Ensure we're using a proper Date object before passing it
      let dateObject;
      if (date instanceof Date) {
        // Clone the date and set to noon time to avoid timezone issues
        dateObject = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      } else {
        // Convert to Date if it's not already, and set to noon time
        const parsedDate = new Date(date);
        dateObject = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 12, 0, 0);
      }
      
      console.log("Normalized date for API query:", dateObject);
      // Get panchang data using the consistent date
      const data = await getPanchangData(dateObject);
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
      
      // Ensure we're using a consistent date object
      let dateObject;
      if (selectedDate instanceof Date) {
        // Clone the date and set to noon time to avoid timezone issues
        dateObject = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
      } else {
        // Convert to Date if it's not already, and set to noon time
        const parsedDate = new Date(selectedDate);
        dateObject = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 12, 0, 0);
      }
      
      const scoreData = await getUserSpecificScore(dateObject, userNakshatra.id);
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
    
    // Ensure we have a proper Date object with noon time
    let dateObject;
    if (date instanceof Date) {
      // Clone the date and set to noon time to avoid timezone issues
      dateObject = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    } else {
      // Convert to Date if it's not already, and set to noon time
      const parsedDate = new Date(date);
      dateObject = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 12, 0, 0);
    }
    
    console.log("Standardized date object:", dateObject);
    setSelectedDate(dateObject);
    fetchPanchangData(dateObject);
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
      
      // Format date - use UTC timeZone to ensure consistent display
      const formattedDate = selectedDate.toLocaleDateString(
        isEnglish ? 'en-US' : 'ta-IN',
        { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
      );
      
      // Extract essential panchang details
      let vaara = '';
      let nakshatra = '';
      let tithi = '';
      
      // Extract vaara (weekday)
      if (panchangData?.vaara) {
        vaara = panchangData.vaara;
      }
      
      // Extract nakshatra
      try {
        if (panchangData?.main_nakshatra) {
          nakshatra = panchangData.main_nakshatra;
        } else if (panchangData?.nakshatra) {
          const processedNakshatra = typeof panchangData.nakshatra === 'string' 
            ? JSON.parse(panchangData.nakshatra) 
            : panchangData.nakshatra;
          
          nakshatra = Array.isArray(processedNakshatra) 
            ? processedNakshatra[0]?.name 
            : processedNakshatra?.name || '';
        }
      } catch (e) {
        console.error("Error parsing nakshatra:", e);
        nakshatra = '';
      }
      
      // Extract tithi
      try {
        if (panchangData?.tithi) {
          const processedTithi = typeof panchangData.tithi === 'string' 
            ? JSON.parse(panchangData.tithi) 
            : panchangData.tithi;
          
          tithi = Array.isArray(processedTithi) 
            ? processedTithi[0]?.name 
            : processedTithi?.name || '';
        }
      } catch (e) {
        console.error("Error parsing tithi:", e);
        tithi = '';
      }
      
      // Get score value
      const scoreValue = personalScore?.score || panchangData?.cosmic_score || '-';
      
      // App link (replace with your actual app URL in production)
      const appLink = "https://cosmicscore.app"; // Replace with your actual app URL
      
      // Default message
      let message;
      
      if (customText) {
        // Use custom text if provided
        console.log("Using custom text for WhatsApp share");
        message = customText;
      } else {
        // Generate default message in the suggested format with emojis
        message = isEnglish
          ? `Cosmic Score for ${formattedDate}: 🌞 ${vaara}, 🌙 Nakshatra: ${nakshatra}, Tithi: ${tithi}, Score: ${scoreValue}/10. Check yours 👉 ${appLink}`
          : `${formattedDate} அன்றைய கோஸ்மிக் மதிப்பெண்: 🌞 ${vaara}, 🌙 நட்சத்திரம்: ${nakshatra}, திதி: ${tithi}, மதிப்பெண்: ${scoreValue}/10. உங்களுடையதை பார்க்க 👉 ${appLink}`;
      }
      
      // Encode the message for WhatsApp
      const encodedMessage = encodeURIComponent(message);
      
      // Generate WhatsApp link
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      
      console.log("Opening WhatsApp with URL:", whatsappUrl);
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      // For mobile devices, try to open the WhatsApp app directly after a short delay
      setTimeout(() => {
        try {
          const mobileUrl = `whatsapp://send?text=${encodedMessage}`;
          window.location.href = mobileUrl;
          console.log("Attempting to open WhatsApp app with URL:", mobileUrl);
        } catch (mobileError) {
          console.log("Mobile app opening attempt may have failed:", mobileError);
        }
      }, 1500);
    } catch (err) {
      console.error('Error sharing to WhatsApp:', err);
      // Simple fallback if there's an error
      try {
        const fallbackMessage = `Cosmic Score: ${personalScore?.score || panchangData?.cosmic_score || '-'}/10`;
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