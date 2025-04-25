import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// Nakshatra data
const nakshatras = [
  { id: 1, name: "Ashwini", tamil: "அசுவினி" },
  { id: 2, name: "Bharani", tamil: "பரணி" },
  { id: 3, name: "Krittika", tamil: "கிருத்திகை" },
  { id: 4, name: "Rohini", tamil: "ரோகிணி" },
  { id: 5, name: "Mrigashira", tamil: "மிருகசிரிஷம்" },
  { id: 6, name: "Ardra", tamil: "திருவாதிரை" },
  { id: 7, name: "Punarvasu", tamil: "புனர்பூசம்" },
  { id: 8, name: "Pushya", tamil: "பூசம்" },
  { id: 9, name: "Ashlesha", tamil: "ஆயில்யம்" },
  { id: 10, name: "Magha", tamil: "மகம்" },
  { id: 11, name: "Purva Phalguni", tamil: "பூரம்" },
  { id: 12, name: "Uttara Phalguni", tamil: "உத்திரம்" },
  { id: 13, name: "Hasta", tamil: "அஸ்தம்" },
  { id: 14, name: "Chitra", tamil: "சித்திரை" },
  { id: 15, name: "Swati", tamil: "சுவாதி" },
  { id: 16, name: "Vishakha", tamil: "விசாகம்" },
  { id: 17, name: "Anuradha", tamil: "அனுஷம்" },
  { id: 18, name: "Jyeshtha", tamil: "கேட்டை" },
  { id: 19, name: "Mula", tamil: "மூலம்" },
  { id: 20, name: "Purva Ashadha", tamil: "பூராடம்" },
  { id: 21, name: "Uttara Ashadha", tamil: "உத்திராடம்" },
  { id: 22, name: "Shravana", tamil: "திருவோணம்" },
  { id: 23, name: "Dhanishta", tamil: "அவிட்டம்" },
  { id: 24, name: "Shatabhisha", tamil: "சதயம்" },
  { id: 25, name: "Purva Bhadrapada", tamil: "பூரட்டாதி" },
  { id: 26, name: "Uttara Bhadrapada", tamil: "உத்திரட்டாதி" },
  { id: 27, name: "Revati", tamil: "ரேவதி" }
];

const OnboardingPage = () => {
  const { isEnglish, toggleLanguage, setUserNakshatra } = useAppContext();
  const navigate = useNavigate();
  
  const handleNakshatraSelect = (nakshatra) => {
    setUserNakshatra(nakshatra);
    navigate('/');
  };
  
  return (
    <div className="bg-gradient-to-b from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {isEnglish ? "Welcome to Cosmic Score" : "கோஸ்மிக் மதிப்பெண்ணுக்கு வரவேற்கிறோம்"}
      </h1>
      <p className="mb-6 text-center opacity-90">
        {isEnglish 
          ? "Please select your birth Nakshatra to get personalized cosmic scores" 
          : "தனிப்பயனாக்கப்பட்ட கோஸ்மிக் மதிப்பெண்களைப் பெற உங்கள் ஜென்ம நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்"}
      </p>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
        <h2 className="text-lg font-medium mb-3">
          {isEnglish ? "Select Your Birth Nakshatra" : "உங்கள் ஜென்ம நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்"}
        </h2>
        <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
          {nakshatras.map((nakshatra) => (
            <button
              key={nakshatra.id}
              className="bg-white/20 hover:bg-white/30 rounded-lg p-2 text-center transition-colors"
              onClick={() => handleNakshatraSelect(nakshatra)}
            >
              <div className="font-medium">{isEnglish ? nakshatra.name : nakshatra.tamil}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <button 
          onClick={toggleLanguage}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full"
        >
          {isEnglish ? "தமிழில் காட்டு" : "Show in English"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;