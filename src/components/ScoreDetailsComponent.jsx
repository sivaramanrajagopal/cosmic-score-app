import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

// Tamil translations for nakshatras
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

// Tamil translations for Tarabalam types
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

// Effect translations
const effectTranslations = {
  "challenging": "சவாலான",
  "favorable": "சாதகமான",
  "prosperous": "செழிப்பான",
  "mixed": "கலப்பான",
  "positive": "நேர்மறையான",
  "highly favorable": "மிகவும் சாதகமான",
  "neutral": "நடுநிலையான"
};

// Helper functions
const getNakshatraName = (name, isEnglish) => {
  if (isEnglish) return name;
  return nakshatraTranslations[name] || name;
};

const getTarabalamTypeName = (type, isEnglish) => {
  if (isEnglish) return type;
  return tarabalamTypes[type] || type;
};

const getEffectName = (effect, isEnglish) => {
  if (isEnglish) return effect === 'challenging' ? 'Challenging' 
              : effect === 'neutral' ? 'Neutral' : 'Favorable';
  return effectTranslations[effect] || effect;
};

const ScoreDetailsComponent = () => {
  const { 
    personalScore, 
    isEnglish, 
    selectedDate,
    userNakshatra,
    shareToWhatsApp
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('breakdown');
  
  // If no personal score is available
  if (!personalScore) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
        <p className="text-gray-700 dark:text-gray-200">
          {isEnglish 
            ? "Personal score details are not available." 
            : "தனிப்பட்ட மதிப்பெண் விவரங்கள் கிடைக்கவில்லை."}
        </p>
      </div>
    );
  }

  // Check if any required data is missing and provide fallbacks
  const hasScoreBreakdown = personalScore.scoreBreakdown && 
    personalScore.scoreBreakdown.tithi && 
    personalScore.scoreBreakdown.vara && 
    personalScore.scoreBreakdown.nakshatra && 
    personalScore.scoreBreakdown.yoga && 
    personalScore.scoreBreakdown.karana;

  const hasRecommendations = personalScore.recommendations && 
    personalScore.recommendations.activities && 
    personalScore.recommendations.activities.favorable && 
    personalScore.recommendations.activities.unfavorable;
  
  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 7.0) return "text-[#00A3A3] dark:text-emerald-400";  // Teal for good scores
    if (score >= 5.0) return "text-[#FFA000] dark:text-yellow-300";  // Amber for medium scores
    return "text-[#FF5252] dark:text-red-400";                    // Coral for low scores
  };
  
  // Get background color based on score
  const getScoreBgColor = (score) => {
    if (score >= 7.0) return "bg-[#00A3A3]/10 dark:bg-emerald-900/30";
    if (score >= 5.0) return "bg-[#FFA000]/10 dark:bg-yellow-900/30";
    return "bg-[#FF5252]/10 dark:bg-red-900/30";
  };
  
  // Get an emoji based on score
  const getScoreEmoji = (score) => {
    if (score >= 8.0) return "✨";
    if (score >= 7.0) return "😊";
    if (score >= 5.0) return "😐";
    if (score >= 3.0) return "😕";
    return "😔";
  };
  
  // Prepare share text - with safety checks for undefined values
// Updated prepareShareText function for ScoreDetailsComponent.jsx

const prepareShareText = () => {
  // Make sure selectedDate is available, otherwise use current date
  const dateToUse = selectedDate || new Date();
  
  const formattedDate = dateToUse.toLocaleDateString(
    isEnglish ? 'en-US' : 'ta-IN',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  );
  
  // Initialize variables with safe empty defaults
  let vaaraText = '';
  let nakshatraText = '';
  let tithiText = '';
  
  // Safely extract vaara (weekday)
  if (typeof personalScore.panchangData?.vaara === 'string') {
    vaaraText = personalScore.panchangData.vaara;
  }
  
  // Safely extract nakshatra
  try {
    if (typeof personalScore.panchangData?.main_nakshatra === 'string') {
      nakshatraText = personalScore.panchangData.main_nakshatra;
    } else if (personalScore.panchangData?.nakshatra) {
      // Handle different possible formats
      const nakshatraData = personalScore.panchangData.nakshatra;
      
      if (typeof nakshatraData === 'string') {
        try {
          // Try to parse JSON string
          const parsed = JSON.parse(nakshatraData);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
            nakshatraText = parsed[0].name;
          } else if (parsed && parsed.name) {
            nakshatraText = parsed.name;
          }
        } catch (e) {
          // If not valid JSON, use as is
          nakshatraText = nakshatraData;
        }
      } else if (Array.isArray(nakshatraData) && nakshatraData.length > 0) {
        // It's already an array
        nakshatraText = nakshatraData[0]?.name || '';
      } else if (nakshatraData && typeof nakshatraData === 'object') {
        // It's a single object
        nakshatraText = nakshatraData.name || '';
      }
    }
  } catch (e) {
    console.error("Error extracting nakshatra for share:", e);
    nakshatraText = '';
  }
  
  // Safely extract tithi
  try {
    if (personalScore.panchangData?.tithi) {
      const tithiData = personalScore.panchangData.tithi;
      
      if (typeof tithiData === 'string') {
        try {
          // Try to parse JSON string
          const parsed = JSON.parse(tithiData);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
            tithiText = parsed[0].name;
          } else if (parsed && parsed.name) {
            tithiText = parsed.name;
          }
        } catch (e) {
          // If not valid JSON, use as is
          tithiText = tithiData;
        }
      } else if (Array.isArray(tithiData) && tithiData.length > 0) {
        // It's already an array
        tithiText = tithiData[0]?.name || '';
      } else if (tithiData && typeof tithiData === 'object') {
        // It's a single object
        tithiText = tithiData.name || '';
      }
    }
  } catch (e) {
    console.error("Error extracting tithi for share:", e);
    tithiText = '';
  }
  
  // Add extra logging to debug the values
  console.log("Share data extracted:", { 
    date: formattedDate,
    vaara: vaaraText,
    nakshatra: nakshatraText,
    tithi: tithiText,
    score: personalScore.score
  });
  
  // App link
  const appLink = "https://cosmicscore.app"; // Replace with your actual app URL
  
  // Create a concise message in the requested format
  const message = isEnglish 
    ? `Cosmic Score for ${formattedDate}: ${vaaraText ? '🌞 ' + vaaraText + ', ' : ''}${nakshatraText ? '🌙 Nakshatra: ' + nakshatraText + ', ' : ''}${tithiText ? 'Tithi: ' + tithiText + ', ' : ''}Score: ${personalScore.score}/10. Check yours 👉 ${appLink}`
    : `${formattedDate} அன்றைய கோஸ்மிக் மதிப்பெண்: ${vaaraText ? '🌞 ' + vaaraText + ', ' : ''}${nakshatraText ? '🌙 நட்சத்திரம்: ' + nakshatraText + ', ' : ''}${tithiText ? 'திதி: ' + tithiText + ', ' : ''}மதிப்பெண்: ${personalScore.score}/10. உங்களுடையதை பார்க்க 👉 ${appLink}`;
  
  // Log the final message for debugging
  console.log("Final share message:", message);
  
  return message;
};
  
  // Handle custom WhatsApp share with error handling
// Updated handleCustomShare function

const handleCustomShare = () => {
  try {
    // First, validate if personalScore has necessary data
    if (!personalScore || typeof personalScore !== 'object') {
      console.error('Invalid personalScore object for sharing');
      
      // Fallback to basic sharing
      shareToWhatsApp(isEnglish 
        ? `My Cosmic Score: ${personalScore?.score || '?'}/10`
        : `எனது கோஸ்மிக் மதிப்பெண்: ${personalScore?.score || '?'}/10`
      );
      return;
    }
    
    // Try to prepare share text
    let shareText;
    try {
      shareText = prepareShareText();
      console.log("Prepared share text:", shareText);
    } catch (prepareError) {
      console.error('Error preparing share text:', prepareError);
      
      // Create simplified fallback text if preparation fails
      shareText = isEnglish 
        ? `My Cosmic Score: ${personalScore.score}/10 ${getScoreEmoji(personalScore.score)}`
        : `எனது கோஸ்மிக் மதிப்பெண்: ${personalScore.score}/10 ${getScoreEmoji(personalScore.score)}`;
    }
    
    // Ensure shareText is a string
    if (typeof shareText !== 'string') {
      console.error('Share text is not a string:', shareText);
      shareText = String(personalScore.score || '?') + '/10';
    }
    
    // Share the text
    shareToWhatsApp(shareText);
  } catch (error) {
    console.error('Critical error in handleCustomShare:', error);
    
    // Ultimate fallback for critical errors
    alert(isEnglish 
      ? "Sorry, sharing failed. Please try again." 
      : "பகிர்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.");
  }
};
  
  // Determine tabs to show
  const tabs = [
    { id: 'breakdown', label: isEnglish ? 'Score Breakdown' : 'மதிப்பெண் விரிவாக்கம்' },
    { id: 'recommendations', label: isEnglish ? 'Recommendations' : 'பரிந்துரைகள்' },
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header with personalized message */}
      <div className={`p-4 ${getScoreBgColor(personalScore.score)}`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-gray-800 dark:text-gray-200">
            {isEnglish ? 'Your Cosmic Analysis' : 'உங்கள் கோஸ்மிக் பகுப்பாய்வு'}
          </h2>
          <span className={`text-lg ${getScoreColor(personalScore.score)}`}>
            {getScoreEmoji(personalScore.score)}
          </span>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {personalScore.tarabalamExplanation 
            ? (isEnglish ? personalScore.tarabalamExplanation.en : personalScore.tarabalamExplanation.ta)
            : (isEnglish ? 'Your personalized cosmic score for today.' : 'இன்றைய உங்கள் தனிப்பயனாக்கப்பட்ட கோஸ்மிக் மதிப்பெண்.')}
        </p>
        
        {personalScore.isChandrashtama && personalScore.chandrashtamaExplanation && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-100 dark:border-yellow-700 rounded-md text-sm text-amber-800 dark:text-amber-300">
            <strong>⚠️ {isEnglish ? 'Chandrashtama Alert:' : 'சந்திராஷ்டம எச்சரிக்கை:'}</strong>{' '}
            {isEnglish ? personalScore.chandrashtamaExplanation.en : personalScore.chandrashtamaExplanation.ta}
          </div>
        )}
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm flex-1 ${
                activeTab === tab.id 
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="p-4">
        {/* Score Breakdown Tab */}
        {activeTab === 'breakdown' && (
          <div>
            <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
              {isEnglish ? 'How Your Score is Calculated:' : 'உங்கள் மதிப்பெண் எவ்வாறு கணக்கிடப்படுகிறது:'}
            </h3>
            
            {hasScoreBreakdown ? (
              <div className="space-y-4">
                {/* Improved Score Breakdown Items - Using a more responsive layout */}
                
                {/* Tithi */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between mb-1">
                    <div className="flex items-center mb-1 md:mb-0">
                      <span className="font-medium text-gray-800 dark:text-gray-200 mr-2 min-w-[80px]">
                        {isEnglish ? 'Tithi:' : 'திதி:'}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px] md:max-w-full">
                        {personalScore.scoreBreakdown.tithi.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mr-2">
                        {personalScore.scoreBreakdown.tithi.score}/10
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({personalScore.scoreBreakdown.tithi.weight}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" 
                      style={{width: `${personalScore.scoreBreakdown.tithi.score * 10}%`}}
                    ></div>
                  </div>
                </div>

                {/* Vara - same improved layout */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between mb-1">
                    <div className="flex items-center mb-1 md:mb-0">
                      <span className="font-medium text-gray-800 dark:text-gray-200 mr-2 min-w-[80px]">
                        {isEnglish ? 'Vara:' : 'வாரம்:'}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px] md:max-w-full">
                        {personalScore.scoreBreakdown.vara.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mr-2">
                        {personalScore.scoreBreakdown.vara.score}/10
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({personalScore.scoreBreakdown.vara.weight}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" 
                      style={{width: `${personalScore.scoreBreakdown.vara.score * 10}%`}}
                    ></div>
                  </div>
                </div>

                {/* Nakshatra - same improved layout */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between mb-1">
                    <div className="flex items-center mb-1 md:mb-0">
                      <span className="font-medium text-gray-800 dark:text-gray-200 mr-2 min-w-[80px]">
                        {isEnglish ? 'Nakshatra:' : 'நட்சத்திரம்:'}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px] md:max-w-full">
                        {personalScore.scoreBreakdown.nakshatra.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mr-2">
                        {personalScore.scoreBreakdown.nakshatra.score}/10
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({personalScore.scoreBreakdown.nakshatra.weight}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" 
                      style={{width: `${personalScore.scoreBreakdown.nakshatra.score * 10}%`}}
                    ></div>
                  </div>
                </div>

                {/* Yoga - same improved layout */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between mb-1">
                    <div className="flex items-center mb-1 md:mb-0">
                      <span className="font-medium text-gray-800 dark:text-gray-200 mr-2 min-w-[80px]">
                        {isEnglish ? 'Yoga:' : 'யோகம்:'}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px] md:max-w-full">
                        {personalScore.scoreBreakdown.yoga.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mr-2">
                        {personalScore.scoreBreakdown.yoga.score}/10
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({personalScore.scoreBreakdown.yoga.weight}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" 
                      style={{width: `${personalScore.scoreBreakdown.yoga.score * 10}%`}}
                    ></div>
                  </div>
                </div>

                {/* Karana - same improved layout */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between mb-1">
                    <div className="flex items-center mb-1 md:mb-0">
                      <span className="font-medium text-gray-800 dark:text-gray-200 mr-2 min-w-[80px]">
                        {isEnglish ? 'Karana:' : 'கரணம்:'}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px] md:max-w-full">
                        {personalScore.scoreBreakdown.karana.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mr-2">
                        {personalScore.scoreBreakdown.karana.score}/10
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({personalScore.scoreBreakdown.karana.weight}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" 
                      style={{width: `${personalScore.scoreBreakdown.karana.score * 10}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 text-center">
                {isEnglish 
                  ? "Detailed score breakdown not available." 
                  : "விரிவான மதிப்பெண் பகுப்பாய்வு கிடைக்கவில்லை."}
              </div>
            )}
            
            {/* Thara Balam section - show if available */}
            {personalScore.tarabalamType && (
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-1">
                  {isEnglish ? 'Thara Balam Effect' : 'தார பல விளைவு'}
                </h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  {isEnglish 
                    ? `Your birth star ${userNakshatra ? `(${userNakshatra.name})` : ''} has a ${personalScore.tarabalamType} relationship with today's star.`
                    : `உங்கள் பிறப்பு நட்சத்திரம் (${getNakshatraName(userNakshatra?.name || "Revati", false)}) இன்றைய நட்சத்திரத்துடன் ${getTarabalamTypeName(personalScore.tarabalamType, false)} உறவைக் கொண்டுள்ளது.`}
                </p>
                
                {/* Improved Tarabalam visualization with fixed alignment */}
                <div className="mt-3 bg-white dark:bg-gray-800 p-2 rounded-md border border-indigo-100 dark:border-indigo-800">
                  <div className="mb-1 flex justify-between items-center">
                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                      {isEnglish ? 'Effect' : 'விளைவு'}:
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      personalScore.tarabalamEffect === 'challenging' 
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
                        : personalScore.tarabalamEffect === 'neutral'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    }`}>
                      {isEnglish 
                        ? (personalScore.tarabalamEffect === 'challenging' 
                            ? 'Challenging' 
                            : personalScore.tarabalamEffect === 'neutral'
                              ? 'Neutral'
                              : 'Favorable')
                        : (personalScore.tarabalamEffect === 'challenging'
                            ? 'சவாலான'
                            : personalScore.tarabalamEffect === 'neutral'
                              ? 'நடுநிலையான'
                              : 'சாதகமான')}
                    </span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex mb-1 justify-between">
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {isEnglish ? 'Negative' : 'எதிர்மறை'}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {isEnglish ? 'Positive' : 'நேர்மறை'}
                      </span>
                    </div>
                    
                    {/* Fixed slider bar with proper alignment */}
                    <div className="relative h-2 w-full">
                      {/* Background gradient */}
                      <div className="h-2 bg-gradient-to-r from-red-300 dark:from-red-800 via-yellow-300 dark:via-yellow-800 to-green-300 dark:to-green-800 rounded-full"></div>
                      
                      {/* Position dot based on adjustment value */}
                      <div 
                        className="absolute w-4 h-4 rounded-full -mt-1 shadow-md transform -translate-x-1/2"
                        style={{
                          top: 0,
                          left: `${personalScore.adjustment <= -0.5 ? '10%' : 
                                personalScore.adjustment <= -0.3 ? '20%' :
                                personalScore.adjustment <= -0.2 ? '30%' :
                                personalScore.adjustment <= -0.1 ? '40%' :
                                personalScore.adjustment === 0 ? '50%' :
                                personalScore.adjustment <= 0.1 ? '60%' :
                                personalScore.adjustment <= 0.3 ? '70%' :
                                personalScore.adjustment <= 0.4 ? '80%' : '90%'}`,
                          backgroundColor: personalScore.adjustment < 0 ? '#EF4444' : 
                                          personalScore.adjustment === 0 ? '#9CA3AF' : '#10B981'
                        }}
                      ></div>
                    </div>
                    
                    <div className="text-center mt-3 text-xs text-indigo-700 dark:text-indigo-300">
                      {isEnglish
                        ? `Score adjustment: ${personalScore.adjustment > 0 ? '+' : ''}${personalScore.adjustment || 0}`
                        : `மதிப்பெண் சரிசெய்தல்: ${personalScore.adjustment > 0 ? '+' : ''}${personalScore.adjustment || 0}`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            {hasRecommendations ? (
              <>
                {/* Favorable Activities */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-[#00A3A3] dark:text-emerald-400">
                    {isEnglish ? 'Favorable Activities' : 'சாதகமான செயல்பாடுகள்'}
                  </h3>
                  <div className="bg-[#00A3A3]/10 dark:bg-emerald-900/30 rounded-lg p-3">
                    <ul className="list-disc pl-5 space-y-1">
                      {(isEnglish 
                        ? personalScore.recommendations.activities.favorable.en 
                        : personalScore.recommendations.activities.favorable.ta
                      ).map((activity, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{activity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Unfavorable Activities */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-[#FF5252] dark:text-red-400">
                    {isEnglish ? 'Activities to Avoid' : 'தவிர்க்க வேண்டிய செயல்பாடுகள்'}
                  </h3>
                  <div className="bg-[#FF5252]/10 dark:bg-red-900/30 rounded-lg p-3">
                    <ul className="list-disc pl-5 space-y-1">
                      {(isEnglish 
                        ? personalScore.recommendations.activities.unfavorable.en 
                        : personalScore.recommendations.activities.unfavorable.ta
                      ).map((activity, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{activity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Colors and Directions */}
                {personalScore.recommendations.colors && personalScore.recommendations.directions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Auspicious Colors */}
                    <div>
                      <h3 className="font-medium mb-2 text-[#1A1046] dark:text-indigo-300">
                        {isEnglish ? 'Auspicious Colors' : 'சாதகமான வண்ணங்கள்'}
                      </h3>
                      <div className="bg-[#1A1046]/5 dark:bg-indigo-900/30 rounded-lg p-3">
                        <ul className="list-disc pl-5 space-y-1">
                          {(isEnglish 
                            ? personalScore.recommendations.colors.en 
                            : personalScore.recommendations.colors.ta
                          ).map((color, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{color}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Favorable Directions */}
                    <div>
                      <h3 className="font-medium mb-2 text-[#1A1046] dark:text-indigo-300">
                        {isEnglish ? 'Favorable Directions' : 'சாதகமான திசைகள்'}
                      </h3>
                      <div className="bg-[#1A1046]/5 dark:bg-indigo-900/30 rounded-lg p-3">
                        <ul className="list-disc pl-5 space-y-1">
                          {(isEnglish 
                            ? personalScore.recommendations.directions.favorable.en 
                            : personalScore.recommendations.directions.favorable.ta
                          ).map((direction, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{direction}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Today's Affirmation */}
                {personalScore.recommendations.affirmation && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-[#E3B23C] dark:text-yellow-400">
                      {isEnglish ? 'Today\'s Affirmation' : 'இன்றைய உறுதிமொழி'}
                    </h3>
                    <div className="bg-[#F8F3E6] dark:bg-gray-700 border border-[#E3B23C]/20 dark:border-yellow-500/30 rounded-lg p-3">
                      <p className="text-sm italic text-[#5D4037] dark:text-gray-300">
                        "{isEnglish 
                          ? personalScore.recommendations.affirmation.en 
                          : personalScore.recommendations.affirmation.ta}"
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 text-center">
                {isEnglish 
                  ? "Recommendations are not available." 
                  : "பரிந்துரைகள் கிடைக்கவில்லை."}
              </div>
            )}
          </div>
        )}
        
        {/* Share Button */}
        <button 
          onClick={handleCustomShare}
          className="w-full mt-3 bg-[#E3B23C] hover:bg-[#D4A429] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">📱</span>
          {isEnglish 
            ? "Share to WhatsApp" 
            : "வாட்ஸ்அப்பில் பகிரவும்"}
        </button>
      </div>
    </div>
  );
};

export default ScoreDetailsComponent;