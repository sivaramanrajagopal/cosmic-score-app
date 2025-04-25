import { useAppContext } from '../context/AppContext';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScoreDetailsComponent from '../components/ScoreDetailsComponent';

// Nakshatra translation map
const nakshatraTranslations = {
  "Ashwini": "அசுவினி",
  "Bharani": "பரணி",
  "Krittika": "கிருத்திகை",
  "Rohini": "ரோகிணி",
  "Mrigashira": "மிருகசிரிஷம்",
  "Ardra": "திருவாதிரை",
  "Punarvasu": "புனர்பூசம்",
  "Pushya": "பூசம்",
  "Ashlesha": "ஆயில்யம்",
  "Magha": "மகம்",
  "Purva Phalguni": "பூரம்",
  "Uttara Phalguni": "உத்திரம்",
  "Hasta": "அஸ்தம்",
  "Chitra": "சித்திரை",
  "Swati": "சுவாதி",
  "Vishakha": "விசாகம்",
  "Anuradha": "அனுஷம்",
  "Jyeshtha": "கேட்டை",
  "Mula": "மூலம்",
  "Purva Ashadha": "பூராடம்",
  "Uttara Ashadha": "உத்திராடம்",
  "Shravana": "திருவோணம்",
  "Dhanishta": "அவிட்டம்",
  "Shatabhisha": "சதயம்",
  "Purva Bhadrapada": "பூரட்டாதி",
  "Uttara Bhadrapada": "உத்திரட்டாதி",
  "Revati": "ரேவதி"
};

// Tarabalam type translations
const tarabalamTypes = {
  "Janma": "ஜன்ம",
  "Sampat": "சம்பத்",
  "Vipat": "விபத்",
  "Kshema": "க்ஷேம",
  "Pratyak": "பிரத்யக்",
  "Sadhana": "சாதன",
  "Naidhana": "நைதான",
  "Mitra": "மித்ர",
  "Parama Mitra": "பரம மித்ர",
  "Unknown": "தெரியாத"
};

// Function to get translated nakshatra name
const getNakshatraName = (name, isEnglish) => {
  if (isEnglish || !name) return name;
  return nakshatraTranslations[name] || name;
};

// Function to get translated tarabalam type
const getTarabalamType = (type, isEnglish) => {
  if (isEnglish || !type) return type;
  return tarabalamTypes[type] || type;
};

// Function to get translated nakshatra list
const getTranslatedNakshatraList = (nakshatraList, isEnglish) => {
  if (isEnglish || !nakshatraList) return nakshatraList;
  
  if (Array.isArray(nakshatraList)) {
    return nakshatraList.map(name => nakshatraTranslations[name] || name);
  }
  
  return nakshatraTranslations[nakshatraList] || nakshatraList;
};

// Helper function to parse JSON strings
const parseJsonIfString = (data) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.log("Failed to parse JSON:", e);
      return data;
    }
  }
  return data;
};

const HomePage = () => {
  const { 
    selectedDate, 
    userNakshatra, 
    isEnglish, 
    panchangData, 
    personalScore,
    isLoading, 
    error,
    toggleLanguage,
    shareToWhatsApp
  } = useAppContext();
  
  const [showDetails, setShowDetails] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const navigate = useNavigate();
  
  // Redirect to onboarding if user hasn't set nakshatra
  useEffect(() => {
    if (!userNakshatra && !isLoading) {
      navigate('/onboarding');
    }
  }, [userNakshatra, isLoading, navigate]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-indigo-600">
            {isEnglish ? "Loading cosmic alignments..." : "கோஸ்மிக் சீரமைப்புகளை ஏற்றுகிறது..."}
          </p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs text-[#2D1B54] hover:text-[#1A1046] border border-[#2D1B54]/30 px-3 py-1 rounded-full">
          {isEnglish ? "Try Again" : "மீண்டும் முயற்சிக்கவும்"}
        </button>
      </div>
    );
  }
  
  // If no data yet, show empty state
  if (!panchangData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p>{isEnglish ? "No data available for the selected date." : "தேர்ந்தெடுக்கப்பட்ட தேதிக்கு தரவு இல்லை."}</p>
      </div>
    );
  }
  
  // Pre-process JSON data
  const processedTithi = parseJsonIfString(panchangData.tithi);
  const processedNakshatra = parseJsonIfString(panchangData.nakshatra);
  const processedKarana = parseJsonIfString(panchangData.karana);
  const processedYoga = parseJsonIfString(panchangData.yoga);
  
  // Format date for display
  const formattedDate = new Date(panchangData.date).toLocaleDateString(
    isEnglish ? 'en-US' : 'ta-IN', 
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );
  
  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 7.0) return "text-[#00A3A3]";  // Teal for good scores
    if (score >= 5.0) return "text-[#FFA000]";  // Amber for medium scores
    return "text-[#FF5252]";                    // Coral for low scores
  };
  
  // Toggle details view
  const toggleDetails = () => {
    console.log("Toggling details. Current state:", showDetails);
    setShowDetails(!showDetails);
  };
  
  // Toggle score details view
  const toggleScoreDetails = () => {
    setShowScoreDetails(!showScoreDetails);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D1B54] to-[#1A1046] p-5 text-white shadow-lg">
      <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">
            ✨ {isEnglish ? "Cosmic Score" : "கோஸ்மிக் மதிப்பெண்"}
          </h1>
          <button 
            onClick={toggleLanguage}
            className="text-xs bg-[#E3B23C]/30 hover:bg-[#E3B23C]/50 px-3 py-1.5 rounded-full text-[#E3B23C] border border-[#E3B23C]/50">
            {isEnglish ? "தமிழில்" : "English"}
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <Link to="/settings" className="text-[#E3B23C]/80 hover:text-[#E3B23C]">
            {isEnglish ? "Settings" : "அமைப்புகள்"}
          </Link>
          <Link to="/calendar" className="bg-[#E3B23C]/20 border border-[#E3B23C]/50 px-3 py-1.5 rounded-full text-sm text-[#E3B23C]">
            {formattedDate}
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-5">
        {/* User Nakshatra Info */}
        <div className="mb-4 flex items-center justify-between bg-[#F8F3E6]/70 p-3 rounded-lg border border-[#E3B23C]/10">
          <div>
            <span className="text-sm text-yellow-700">{isEnglish ? "Your Birth Star" : "உங்கள் ஜென்ம நட்சத்திரம்"}</span>
            <div className="font-medium">
              {isEnglish ? userNakshatra?.name : getNakshatraName(userNakshatra?.name, false)}
            </div>
          </div>
          <Link 
            to="/settings"
            className="text-xs bg-yellow-100 hover:bg-indigo-200 px-2 py-1 rounded text-yellow-700"
          >
            {isEnglish ? "Change" : "மாற்று"}
          </Link>
        </div>
        
        {/* Dual Score Display - More responsive for Tamil */}
        <div className="grid grid-cols-2 mb-6 bg-white rounded-xl shadow-md overflow-hidden border border-[#E3B23C]/10">
          {/* General Cosmic Score */}
          <div className="p-4 text-center border-r border-gray-100">
            <div className="text-sm text-gray-600 mb-1">{isEnglish ? "General Score" : "பொது மதிப்பெண்"}</div>
            <div className={`text-3xl font-bold ${getScoreColor(panchangData.cosmic_score)}`}>
              {panchangData.cosmic_score}
            </div>
            <div className="text-xs text-gray-500 mt-1 px-1 whitespace-normal">
              {isEnglish ? "Based on Panchang" : "பஞ்சாங்கத்தின் அடிப்படையில்"}
            </div>
          </div>
          
          {/* Personal Score */}
          <div className="p-4 text-center">
            <div className="text-sm text-gray-600 mb-1 whitespace-normal">
              {isEnglish ? "Your Personal Score" : "உங்கள் தனிப்பட்ட மதிப்பெண்"}
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(personalScore?.score || 0)}`}>
              {personalScore?.score || "-"}
            </div>
            {personalScore?.tarabalamType && (
              <div className="text-xs mt-1 flex justify-center">
                <span className="px-2 py-0.5 bg-[#F8F3E6] text-[#1A1046] rounded-full border border-[#E3B23C]/30 whitespace-normal">
                  {isEnglish ? personalScore.tarabalamType : getTarabalamType(personalScore.tarabalamType, false)}
                </span>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1 px-1 whitespace-normal">
              {isEnglish ? "Based on your Nakshatra" : "உங்கள் நட்சத்திரத்தின் அடிப்படையில்"}
            </div>
          </div>
        </div>
        
        {/* Show Personal Score Details Button */}
        <button
          onClick={toggleScoreDetails}
          className="w-full mb-6 bg-[#F8F3E6] hover:bg-[#F0E6D2] text-[#5D4037] font-medium py-3 px-4 rounded-lg flex items-center justify-center border border-[#E3B23C]/20"
        >
          <span className="mr-2">🔍</span>
          {showScoreDetails
            ? (isEnglish ? "Hide Score Details" : "மதிப்பெண் விவரங்களை மறை")
            : (isEnglish ? "Show Score Details" : "மதிப்பெண் விவரங்களைக் காட்டு")}
        </button>
        
        {/* Personal Score Details Component */}
        {showScoreDetails && (
          <div className="mb-6">
            <ScoreDetailsComponent />
          </div>
        )}
        
        {/* Chandrashtama Information */}
        {panchangData.chandrashtama_for && panchangData.chandrashtama_for.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-[#F8F3E6] to-[#FFF8E1] border border-[#E3B23C]/30 rounded-lg p-4 text-[#5D4037]">
            <div className="flex flex-col sm:flex-row items-start">
              <span className="mr-2 text-lg mb-1 sm:mb-0">🌙</span>
              <div>
                <h3 className="font-bold text-[#1A1046]">{isEnglish ? "Chandrashtama Today" : "இன்றைய சந்திராஷ்டமம்"}</h3>
                <p className="text-sm mt-1 break-words">
                  {isEnglish 
                    ? `Today is Chandrashtama for: ${Array.isArray(panchangData.chandrashtama_for) 
                        ? panchangData.chandrashtama_for.join(', ') 
                        : panchangData.chandrashtama_for}` 
                    : `இன்றைய சந்திராஷ்டம நட்சத்திரங்கள்: ${Array.isArray(panchangData.chandrashtama_for) 
                        ? getTranslatedNakshatraList(panchangData.chandrashtama_for, false).join(', ') 
                        : getTranslatedNakshatraList(panchangData.chandrashtama_for, false)}`}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Panchang Elements */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium text-[#1A1046]">
              {isEnglish ? "Panchang Elements" : "பஞ்சாங்க கூறுகள்"}
            </h2>
            <button 
              onClick={toggleDetails}
              className="text-xs bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded text-indigo-700"
            >
              {showDetails 
                ? (isEnglish ? "Hide Details" : "விவரங்களை மறை") 
                : (isEnglish ? "Show Details" : "விவரங்களைக் காட்டு")}
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg">
            <div className="divide-y divide-gray-200">
              <div className="flex justify-between p-3">
                <div className="font-medium">Tithi</div>
                <div>
                  {Array.isArray(processedTithi) 
                    ? processedTithi[0]?.name 
                    : typeof processedTithi === 'object'
                      ? processedTithi.name
                      : processedTithi}
                </div>
              </div>
              <div className="flex justify-between p-3">
                <div className="font-medium">Vara</div>
                <div>{panchangData.vaara}</div>
              </div>
              <div className="flex justify-between p-3">
                <div className="font-medium">Nakshatra</div>
                <div>
                  {Array.isArray(processedNakshatra) 
                    ? processedNakshatra[0]?.name 
                    : typeof processedNakshatra === 'object'
                      ? processedNakshatra.name
                      : processedNakshatra}
                </div>
              </div>
              <div className="flex justify-between p-3">
                <div className="font-medium">Karana</div>
                <div>
                  {Array.isArray(processedKarana) 
                    ? processedKarana[0]?.name 
                    : typeof processedKarana === 'object'
                      ? processedKarana.name
                      : processedKarana}
                </div>
              </div>
              <div className="flex justify-between p-3">
                <div className="font-medium">Yoga</div>
                <div>
                  {Array.isArray(processedYoga) 
                    ? processedYoga[0]?.name 
                    : typeof processedYoga === 'object'
                      ? processedYoga.name
                      : processedYoga}
                </div>
              </div>
            </div>
          </div>
          
          {/* Expanded Details Section */}
          {showDetails && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              {/* Tithi Details */}
              {Array.isArray(processedTithi) && processedTithi.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Tithi Details</h3>
                  <div className="space-y-2">
                    {processedTithi.map((item, index) => (
                      <div key={`tithi-${index}`} className="text-sm bg-white p-2 rounded border border-gray-100">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.paksha} • {new Date(item.start).toLocaleTimeString()} - {new Date(item.end).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Nakshatra Details */}
              {Array.isArray(processedNakshatra) && processedNakshatra.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Nakshatra Details</h3>
                  <div className="space-y-2">
                    {processedNakshatra.map((item, index) => (
                      <div key={`nakshatra-${index}`} className="text-sm bg-white p-2 rounded border border-gray-100">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          Lord: {item.lord?.name} • {new Date(item.start).toLocaleTimeString()} - {new Date(item.end).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Karana Details */}
              {Array.isArray(processedKarana) && processedKarana.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Karana Details</h3>
                  <div className="space-y-2">
                    {processedKarana.map((item, index) => (
                      <div key={`karana-${index}`} className="text-sm bg-white p-2 rounded border border-gray-100">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.start).toLocaleTimeString()} - {new Date(item.end).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Yoga Details */}
              {Array.isArray(processedYoga) && processedYoga.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Yoga Details</h3>
                  <div className="space-y-2">
                    {processedYoga.map((item, index) => (
                      <div key={`yoga-${index}`} className="text-sm bg-white p-2 rounded border border-gray-100">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.start).toLocaleTimeString()} - {new Date(item.end).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <h3 className="font-medium mb-2 mt-4">Timing Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Sunrise: {panchangData.sunrise ? new Date(panchangData.sunrise).toLocaleTimeString() : '-'}</div>
                <div>Sunset: {panchangData.sunset ? new Date(panchangData.sunset).toLocaleTimeString() : '-'}</div>
                <div>Moonrise: {panchangData.moonrise ? new Date(panchangData.moonrise).toLocaleTimeString() : '-'}</div>
                <div>Moonset: {panchangData.moonset ? new Date(panchangData.moonset).toLocaleTimeString() : '-'}</div>
              </div>
              
              <h3 className="font-medium mt-4 mb-2">Special Features</h3>
              <div className="flex flex-wrap gap-2">
                {panchangData.is_amavasai && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {isEnglish ? "Amavasai" : "அமாவாசை"}
                  </span>
                )}
                {panchangData.is_pournami && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {isEnglish ? "Pournami" : "பௌர்ணமி"}
                  </span>
                )}
                {panchangData.is_mythra_muhurtham && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {isEnglish ? "Mythra Muhurtham" : "மித்ர முஹூர்த்தம்"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Share Button */}
        <button 
          onClick={shareToWhatsApp}
          className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">📱</span>
          {isEnglish ? "Share to WhatsApp" : "வாட்ஸ்அப்பில் பகிரவும்"}
        </button>
      </div>
    </div>
  );
};

export default HomePage;