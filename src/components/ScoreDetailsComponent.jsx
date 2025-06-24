import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

// 🌟 COMPLETE REWRITTEN COMPONENT FOR YOUR NEW SCORING SYSTEM

// Tamil translations mapping (your DB format to display format)
const nakshatraTranslations = {
  // Tamil to English
  "அஸ்வினி": "Ashwini",
  "பரணி": "Bharani",
  "கார்த்திகை": "Krittika", 
  "ரோஹிணி": "Rohini",
  "மிருகசீரிடம்": "Mrigashira",
  "திருவாதிரை": "Ardra",
  "புனர்பூசம்": "Punarvasu",
  "பூசம்": "Pushya",
  "ஆயில்யம்": "Ashlesha",
  "மகம்": "Magha",
  "பூரம்": "Purva Phalguni",
  "உத்திரம்": "Uttara Phalguni",
  "அஸ்தம்": "Hasta",
  "சித்திரை": "Chitra",
  "ஸ்வாதி": "Swati",
  "விசாகம்": "Vishakha",
  "அனுராதா": "Anuradha",
  "ஜேஷ்டா": "Jyeshtha",
  "மூலம்": "Mula",
  "பூராடம்": "Purva Ashadha",
  "உத்திராடம்": "Uttara Ashadha",
  "திருவோணம்": "Shravana",
  "அவிட்டம்": "Dhanishta",
  "சதயம்": "Shatabhisha",
  "பூரட்டாதி": "Purva Bhadrapada",
  "உத்திரட்டாதி": "Uttara Bhadrapada",
  "ரேவதி": "Revati",
  // English to Tamil (reverse mapping)
  "Ashwini": "அஸ்வினி",
  "Bharani": "பரணி",
  "Krittika": "கார்த்திகை",
  "Rohini": "ரோஹிணி",
  "Mrigashira": "மிருகசீரிடம்",
  "Ardra": "திருவாதிரை",
  "Punarvasu": "புனர்பூசம்",
  "Pushya": "பூசம்",
  "Ashlesha": "ஆயில்யம்",
  "Magha": "மகம்",
  "Purva Phalguni": "பூரம்",
  "Uttara Phalguni": "உத்திரம்",
  "Hasta": "அஸ்தம்",
  "Chitra": "சித்திரை",
  "Swati": "ஸ்வாதி",
  "Vishakha": "விசாகம்",
  "Anuradha": "அனுராதா",
  "Jyeshtha": "ஜேஷ்டா",
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

// Tarabalam types with translations
const tarabalamTypes = {
  "Janma": { en: "Janma", ta: "ஜன்ம" },
  "Sampat": { en: "Sampat", ta: "சம்பத்" },
  "Vipat": { en: "Vipat", ta: "விபத்" },
  "Kshema": { en: "Kshema", ta: "க்ஷேம" },
  "Pratyak": { en: "Pratyak", ta: "பிரத்யக்" },
  "Sadhana": { en: "Sadhana", ta: "சாதன" },
  "Naidhana": { en: "Naidhana", ta: "நைதான" },
  "Mitra": { en: "Mitra", ta: "மித்ர" },
  "Parama Mitra": { en: "Parama Mitra", ta: "பரம மித்ர" },
  "Unknown": { en: "Unknown", ta: "தெரியாத" }
};

// Effect translations
const effectTranslations = {
  "challenging": { en: "Challenging", ta: "சவாலான" },
  "favorable": { en: "Favorable", ta: "சாதகமான" },
  "highly favorable": { en: "Highly Favorable", ta: "மிகவும் சாதகமான" },
  "mixed": { en: "Mixed", ta: "கலப்பான" },
  "positive": { en: "Positive", ta: "நேர்மறையான" },
  "neutral": { en: "Neutral", ta: "நடுநிலையான" }
};

// Day quality ratings
const dayQualityRatings = {
  excellent: { en: "Excellent", ta: "சிறந்த", emoji: "✨", color: "emerald" },
  veryGood: { en: "Very Good", ta: "மிகவும் நல்ல", emoji: "😊", color: "green" },
  good: { en: "Good", ta: "நல்ல", emoji: "😐", color: "yellow" },
  fair: { en: "Fair", ta: "சாதாரண", emoji: "😕", color: "orange" },
  challenging: { en: "Challenging", ta: "சவாலான", emoji: "😔", color: "red" }
};

// Utility functions
const safelyExtractFromJsonb = (jsonbData, fallback = 'Unknown') => {
  if (!jsonbData) return fallback;
  
  try {
    // Handle different formats from your DB
    if (typeof jsonbData === 'string') {
      const parsed = JSON.parse(jsonbData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]?.name || fallback;
      }
      return parsed?.name || fallback;
    }
    
    if (Array.isArray(jsonbData) && jsonbData.length > 0) {
      return jsonbData[0]?.name || fallback;
    }
    
    if (typeof jsonbData === 'object') {
      return jsonbData?.name || fallback;
    }
    
    return fallback;
  } catch (error) {
    console.error('Error extracting from JSONB:', error);
    return fallback;
  }
};

const translateNakshatra = (nakshatra, toLanguage) => {
  if (!nakshatra) return 'Unknown';
  return toLanguage === 'en' 
    ? (nakshatraTranslations[nakshatra] || nakshatra)
    : (nakshatraTranslations[nakshatra] || nakshatra);
};

const getScoreQuality = (score) => {
  if (score >= 8.0) return dayQualityRatings.excellent;
  if (score >= 6.5) return dayQualityRatings.veryGood;
  if (score >= 5.0) return dayQualityRatings.good;
  if (score >= 3.5) return dayQualityRatings.fair;
  return dayQualityRatings.challenging;
};

const getScoreColor = (score) => {
  const quality = getScoreQuality(score);
  const colorMap = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    green: "text-green-600 dark:text-green-400", 
    yellow: "text-yellow-600 dark:text-yellow-400",
    orange: "text-orange-600 dark:text-orange-400",
    red: "text-red-600 dark:text-red-400"
  };
  return colorMap[quality.color];
};

const getScoreBgColor = (score) => {
  const quality = getScoreQuality(score);
  const bgColorMap = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/30",
    green: "bg-green-50 dark:bg-green-900/30",
    yellow: "bg-yellow-50 dark:bg-yellow-900/30", 
    orange: "bg-orange-50 dark:bg-orange-900/30",
    red: "bg-red-50 dark:bg-red-900/30"
  };
  return bgColorMap[quality.color];
};

// 🎯 MAIN COMPONENT
const ScoreDetailsComponent = () => {
  const { 
    personalScore, 
    isEnglish, 
    selectedDate,
    userNakshatra,
    shareToWhatsApp,
    cosmicScore // Add this to context if not already there
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('breakdown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calculatedScore, setCalculatedScore] = useState(null);

  // 🔥 FETCH PERSONALIZED SCORE FROM YOUR BACKEND
  const fetchPersonalizedScore = useCallback(async (date, birthNakshatra) => {
    if (!date || !birthNakshatra) {
      setError(isEnglish ? 'Date and birth nakshatra are required' : 'தேதி மற்றும் பிறப்பு நட்சத்திரம் தேவை');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Format date for your API
      const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
      
      // Replace with your actual API endpoint
      const response = await fetch('/api/calculate-personalized-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calculation_date: formattedDate,
          birth_nakshatra: birthNakshatra
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle error from your PostgreSQL function
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCalculatedScore(data);
    } catch (err) {
      console.error('Error fetching personalized score:', err);
      setError(err.message || (isEnglish ? 'Failed to calculate score' : 'மதிப்பெண் கணக்கிடுவதில் தோல்வி'));
    } finally {
      setIsLoading(false);
    }
  }, [isEnglish]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (selectedDate && userNakshatra?.name && !personalScore) {
      fetchPersonalizedScore(selectedDate, userNakshatra.name);
    }
  }, [selectedDate, userNakshatra, personalScore, fetchPersonalizedScore]);

  // Use calculated score or passed personal score
  const scoreData = personalScore || calculatedScore;

  // 📱 IMPROVED SHARE FUNCTION
  const prepareShareText = useCallback(() => {
    if (!scoreData) return '';
    
    try {
      const dateToUse = selectedDate || new Date();
      const formattedDate = dateToUse.toLocaleDateString(
        isEnglish ? 'en-US' : 'ta-IN',
        { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
      );
      
      // Extract panchang data safely
      const vaaraText = scoreData.panchangData?.vaara || '';
      const nakshatraText = scoreData.panchangData?.main_nakshatra || 
                           safelyExtractFromJsonb(scoreData.panchangData?.nakshatra);
      const tithiText = safelyExtractFromJsonb(scoreData.panchangData?.tithi);
      const yogaText = safelyExtractFromJsonb(scoreData.panchangData?.yoga);
      
      const quality = getScoreQuality(scoreData.score);
      const appLink = "https://cosmicscore.app";
      
      if (isEnglish) {
        return `🌟 My Cosmic Score for ${formattedDate}
        
📊 Score: ${scoreData.score}/10 ${quality.emoji} (${quality.en})
${vaaraText ? `📅 Day: ${vaaraText}` : ''}
${nakshatraText ? `🌙 Nakshatra: ${translateNakshatra(nakshatraText, 'en')}` : ''}
${tithiText ? `🌛 Tithi: ${tithiText}` : ''}
${yogaText ? `🧘 Yoga: ${yogaText}` : ''}
${scoreData.isChandrashtama ? `⚠️ Chandrashtama Day - Exercise Caution` : ''}
${scoreData.tarabalamType ? `✨ Tarabalam: ${scoreData.tarabalamType} (${effectTranslations[scoreData.tarabalamEffect]?.en || scoreData.tarabalamEffect})` : ''}

Check your cosmic score → ${appLink}`;
      } else {
        return `🌟 ${formattedDate} அன்றைய எனது கோஸ்மிக் மதிப்பெண்
        
📊 மதிப்பெண்: ${scoreData.score}/10 ${quality.emoji} (${quality.ta})
${vaaraText ? `📅 நாள்: ${vaaraText}` : ''}
${nakshatraText ? `🌙 நட்சத்திரம்: ${translateNakshatra(nakshatraText, 'ta')}` : ''}
${tithiText ? `🌛 திதி: ${tithiText}` : ''}
${yogaText ? `🧘 யோகம்: ${yogaText}` : ''}
${scoreData.isChandrashtama ? `⚠️ சந்திராஷ்டம நாள் - கவனமாக இருங்கள்` : ''}
${scoreData.tarabalamType ? `✨ தாரபல: ${tarabalamTypes[scoreData.tarabalamType]?.ta || scoreData.tarabalamType} (${effectTranslations[scoreData.tarabalamEffect]?.ta || scoreData.tarabalamEffect})` : ''}

உங்கள் கோஸ்மிக் மதிப்பெண்ணைப் பார்க்க → ${appLink}`;
      }
    } catch (error) {
      console.error('Error preparing share text:', error);
      const quality = getScoreQuality(scoreData.score);
      return isEnglish 
        ? `My Cosmic Score: ${scoreData.score}/10 ${quality.emoji}`
        : `எனது கோஸ்மிக் மதிப்பெண்: ${scoreData.score}/10 ${quality.emoji}`;
    }
  }, [scoreData, selectedDate, isEnglish]);

  const handleShare = useCallback(() => {
    try {
      const shareText = prepareShareText();
      if (shareText) {
        shareToWhatsApp(shareText);
      } else {
        throw new Error('No data to share');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert(isEnglish 
        ? "Sorry, sharing failed. Please try again." 
        : "பகிர்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.");
    }
  }, [prepareShareText, shareToWhatsApp, isEnglish]);

  // 🔄 LOADING STATE
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            {isEnglish 
              ? 'Calculating your personalized cosmic score...' 
              : 'உங்கள் தனிப்பயனாக்கப்பட்ட கோஸ்மிக் மதிப்பெண்ணைக் கணக்கிடுகிறது...'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isEnglish 
              ? 'Analyzing cosmic energies for your birth nakshatra' 
              : 'உங்கள் பிறப்பு நட்சத்திரத்திற்கான கோஸ்மிக் சக்திகளை பகுப்பாய்வு செய்கிறது'}
          </p>
        </div>
      </div>
    );
  }

  // ❌ ERROR STATE
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-500 text-xl mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">
                {isEnglish ? 'Calculation Error' : 'கணக்கீடு பிழை'}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                {error}
              </p>
              <button 
                onClick={() => fetchPersonalizedScore(selectedDate, userNakshatra?.name)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isEnglish ? 'Try Again' : 'மீண்டும் முயற்சிக்கவும்'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 📝 NO DATA STATE
  if (!scoreData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            {isEnglish ? 'Get Your Personalized Score' : 'உங்கள் தனிப்பயனாக்கப்பட்ட மதிப்பெண்ணைப் பெறுங்கள்'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isEnglish 
              ? 'Enter your birth nakshatra to get personalized cosmic analysis based on Tarabalam and Chandrashtama.' 
              : 'தாரபல மற்றும் சந்திராஷ்டம அடிப்படையில் தனிப்பயனாக்கப்பட்ட கோஸ்மிக் பகுப்பாய்வைப் பெற உங்கள் பிறப்பு நட்சத்திரத்தை உள்ளிடவும்.'}
          </p>
          
          {userNakshatra && selectedDate && (
            <button 
              onClick={() => fetchPersonalizedScore(selectedDate, userNakshatra.name)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isEnglish ? 'Calculate My Score' : 'எனது மதிப்பெண்ணைக் கணக்கிடுங்கள்'}
            </button>
          )}
          
          {cosmicScore && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isEnglish ? 'General Cosmic Score Available:' : 'பொது கோஸ்மிக் மதிப்பெண் கிடைக்கிறது:'}
              </p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {cosmicScore}/10 {getScoreQuality(cosmicScore).emoji}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🎯 MAIN COMPONENT RENDER
  const quality = getScoreQuality(scoreData.score);
  const tabs = [
    { id: 'breakdown', label: isEnglish ? 'Score Analysis' : 'மதிப்பெண் பகுப்பாய்வு', icon: '📊' },
    { id: 'recommendations', label: isEnglish ? 'Guidance' : 'வழிகாட்டுதல்', icon: '🔮' },
    { id: 'tarabalam', label: isEnglish ? 'Tarabalam' : 'தாரபல', icon: '⭐' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* 🎨 HEADER SECTION */}
      <div className={`p-6 ${getScoreBgColor(scoreData.score)}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {isEnglish ? 'Your Cosmic Analysis' : 'உங்கள் கோஸ்மிக் பகுப்பாய்வு'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {userNakshatra && (
                <>
                  {isEnglish ? 'Birth Nakshatra: ' : 'பிறப்பு நட்சத்திரம்: '}
                  <span className="font-medium">
                    {translateNakshatra(userNakshatra.name, isEnglish ? 'en' : 'ta')}
                  </span>
                </>
              )}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(scoreData.score)} mb-1`}>
              {scoreData.score}/10
            </div>
            <div className="flex items-center justify-end">
              <span className="text-2xl mr-2">{quality.emoji}</span>
              <span className={`text-sm font-medium ${getScoreColor(scoreData.score)}`}>
                {isEnglish ? quality.en : quality.ta}
              </span>
            </div>
          </div>
        </div>

        {/* 🚨 CHANDRASHTAMA WARNING */}
        {scoreData.isChandrashtama && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <span className="text-red-500 text-xl mr-3 flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <h4 className="font-bold text-red-800 dark:text-red-300 mb-1">
                  {isEnglish ? 'Chandrashtama Alert' : 'சந்திராஷ்டம எச்சரிக்கை'}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {scoreData.chandrashtamaExplanation
                    ? (isEnglish ? scoreData.chandrashtamaExplanation.en : scoreData.chandrashtamaExplanation.ta)
                    : (isEnglish 
                        ? 'Today is Chandrashtama for your birth nakshatra. Exercise extra caution in important decisions.'
                        : 'இன்று உங்கள் பிறப்பு நட்சத்திரத்திற்கு சந்திராஷ்டம. முக்கியமான முடிவுகளில் கூடுதல் எச்சரிக்கையுடன் இருங்கள்.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 📝 TARABALAM SUMMARY */}
        {scoreData.tarabalamType && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-3">
            <p className="text-sm text-indigo-800 dark:text-indigo-300">
              <span className="font-medium">
                {isEnglish ? 'Tarabalam Effect: ' : 'தாரபல விளைவு: '}
              </span>
              {scoreData.tarabalamExplanation
                ? (isEnglish ? scoreData.tarabalamExplanation.en : scoreData.tarabalamExplanation.ta)
                : `${tarabalamTypes[scoreData.tarabalamType]?.[isEnglish ? 'en' : 'ta'] || scoreData.tarabalamType} - ${effectTranslations[scoreData.tarabalamEffect]?.[isEnglish ? 'en' : 'ta'] || scoreData.tarabalamEffect}`}
            </p>
          </div>
        )}
      </div>

      {/* 📑 TAB NAVIGATION */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id 
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📊 TAB CONTENT */}
      <div className="p-6">
        {/* SCORE BREAKDOWN TAB */}
        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {isEnglish ? 'Score Calculation Details' : 'மதிப்பெண் கணக்கீடு விவரங்கள்'}
              </h3>
              
              {/* WEIGHTING INFO */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3">
                  {isEnglish ? 'Weighting Formula' : 'எடையிடல் வாய்ப்பாடு'}
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">15%</div>
                    <div className="text-gray-600 dark:text-gray-300">{isEnglish ? 'Vara' : 'வாரம்'}</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border">
                    <div className="font-bold text-purple-600 dark:text-purple-400">30%</div>
                    <div className="text-gray-600 dark:text-gray-300">{isEnglish ? 'Nakshatra' : 'நட்சத்திரம்'}</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">15%</div>
                    <div className="text-gray-600 dark:text-gray-300">{isEnglish ? 'Yoga' : 'யோகம்'}</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">15%</div>
                    <div className="text-gray-600 dark:text-gray-300">{isEnglish ? 'Karana' : 'கரணம்'}</div>
                  </div>
                  <div className="text-center p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded border">
                    <div className="font-bold">100%</div>
                    <div className="text-xs">{isEnglish ? 'Total' : 'மொத்தம்'}</div>
                  </div>
                </div>
              </div>

              {/* COMPONENT BREAKDOWN */}
              {scoreData.scoreBreakdown ? (
                <div className="space-y-4">
                  {/* Tithi Component */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🌙</span>
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {isEnglish ? 'Tithi' : 'திதி'}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({scoreData.scoreBreakdown.tithi?.name || 'Unknown'})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {scoreData.scoreBreakdown.tithi?.score || 0}/10
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          25% weight
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{width: `${(scoreData.scoreBreakdown.tithi?.score || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* Vara Component */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">📅</span>
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {isEnglish ? 'Vara (Day)' : 'வாரம் (நாள்)'}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({scoreData.scoreBreakdown.vara?.name || 'Unknown'})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {scoreData.scoreBreakdown.vara?.score || 0}/10
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          15% weight
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{width: `${(scoreData.scoreBreakdown.vara?.score || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* Nakshatra Component - Highest Weight */}
                  <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">⭐</span>
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {isEnglish ? 'Nakshatra' : 'நட்சத்திரம்'}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({scoreData.scoreBreakdown.nakshatra?.name || 'Unknown'})
                          </span>
                          <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                            {isEnglish ? 'Highest Weight' : 'அதிக எடை'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          {scoreData.scoreBreakdown.nakshatra?.score || 0}/10
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          30% weight
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{width: `${(scoreData.scoreBreakdown.nakshatra?.score || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* Yoga Component */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🧘</span>
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {isEnglish ? 'Yoga' : 'யோகம்'}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({scoreData.scoreBreakdown.yoga?.name || 'Unknown'})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {scoreData.scoreBreakdown.yoga?.score || 0}/10
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          15% weight
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{width: `${(scoreData.scoreBreakdown.yoga?.score || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* Karana Component */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">⏰</span>
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {isEnglish ? 'Karana' : 'கரணம்'}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({scoreData.scoreBreakdown.karana?.name || 'Unknown'})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {scoreData.scoreBreakdown.karana?.score || 0}/10
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          15% weight
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{width: `${(scoreData.scoreBreakdown.karana?.score || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* ADJUSTMENTS SECTION */}
                  {(scoreData.adjustment !== 0 || scoreData.isChandrashtama) && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">
                        {isEnglish ? 'Score Adjustments' : 'மதிப்பெண் சரிசெய்தல்கள்'}
                      </h4>
                      <div className="space-y-2">
                        {scoreData.adjustment !== 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-yellow-700 dark:text-yellow-300">
                              {isEnglish ? 'Tarabalam Effect:' : 'தாரபல விளைவு:'}
                            </span>
                            <span className={`font-medium ${scoreData.adjustment > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {scoreData.adjustment > 0 ? '+' : ''}{scoreData.adjustment}
                            </span>
                          </div>
                        )}
                        {scoreData.isChandrashtama && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-yellow-700 dark:text-yellow-300">
                              {isEnglish ? 'Chandrashtama Penalty:' : 'சந்திராஷ்டம தண்டனை:'}
                            </span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              -1.0
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-4xl mb-3 block">📊</span>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isEnglish 
                      ? 'Detailed breakdown not available' 
                      : 'விரிவான பகுப்பாய்வு கிடைக்கவில்லை'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {scoreData.recommendations ? (
              <>
                {/* Favorable Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center">
                    <span className="mr-2">✅</span>
                    {isEnglish ? 'Favorable Activities' : 'சாதகமான செயல்பாடுகள்'}
                  </h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
                    <ul className="space-y-2">
                      {(isEnglish 
                        ? scoreData.recommendations.activities?.favorable?.en || []
                        : scoreData.recommendations.activities?.favorable?.ta || []
                      ).map((activity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-emerald-500 mr-2 mt-1">•</span>
                          <span className="text-emerald-800 dark:text-emerald-300">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Unfavorable Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center">
                    <span className="mr-2">❌</span>
                    {isEnglish ? 'Activities to Avoid' : 'தவிர்க்க வேண்டிய செயல்பாடுகள்'}
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <ul className="space-y-2">
                      {(isEnglish 
                        ? scoreData.recommendations.activities?.unfavorable?.en || []
                        : scoreData.recommendations.activities?.unfavorable?.ta || []
                      ).map((activity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-1">•</span>
                          <span className="text-red-800 dark:text-red-300">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Colors and Directions */}
                {(scoreData.recommendations.colors || scoreData.recommendations.directions) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Auspicious Colors */}
                    {scoreData.recommendations.colors && (
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center">
                          <span className="mr-2">🎨</span>
                          {isEnglish ? 'Auspicious Colors' : 'சாதகமான வண்ணங்கள்'}
                        </h3>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {(isEnglish 
                              ? scoreData.recommendations.colors.en || []
                              : scoreData.recommendations.colors.ta || []
                            ).map((color, index) => (
                              <span key={index} className="bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Favorable Directions */}
                    {scoreData.recommendations.directions?.favorable && (
                      <div>
                        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center">
                          <span className="mr-2">🧭</span>
                          {isEnglish ? 'Favorable Directions' : 'சாதகமான திசைகள்'}
                        </h3>
                        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {(isEnglish 
                              ? scoreData.recommendations.directions.favorable.en || []
                              : scoreData.recommendations.directions.favorable.ta || []
                            ).map((direction, index) => (
                              <span key={index} className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                                {direction}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Today's Affirmation */}
                {scoreData.recommendations.affirmation && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center">
                      <span className="mr-2">💫</span>
                      {isEnglish ? 'Today\'s Affirmation' : 'இன்றைய உறுதிமொழி'}
                    </h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                      <blockquote className="text-center">
                        <p className="text-lg italic text-yellow-800 dark:text-yellow-300 mb-2">
                          "{isEnglish 
                            ? scoreData.recommendations.affirmation.en 
                            : scoreData.recommendations.affirmation.ta}"
                        </p>
                      </blockquote>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-4xl mb-3 block">🔮</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {isEnglish 
                    ? 'Recommendations not available' 
                    : 'பரிந்துரைகள் கிடைக்கவில்லை'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TARABALAM TAB */}
        {activeTab === 'tarabalam' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {isEnglish ? 'Tarabalam Analysis' : 'தாரபல பகுப்பாய்வு'}
              </h3>
              
              {scoreData.tarabalamType ? (
                <div className="space-y-4">
                  {/* Tarabalam Type */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">⭐</div>
                      <h4 className="text-xl font-bold text-indigo-800 dark:text-indigo-300">
                        {tarabalamTypes[scoreData.tarabalamType]?.[isEnglish ? 'en' : 'ta'] || scoreData.tarabalamType}
                      </h4>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                        {isEnglish ? 'Tarabalam Type' : 'தாரபல வகை'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {isEnglish ? 'Effect Type' : 'விளைவு வகை'}
                        </div>
                        <div className={`font-medium ${
                          scoreData.tarabalamEffect === 'challenging' ? 'text-red-600 dark:text-red-400' :
                          scoreData.tarabalamEffect === 'neutral' ? 'text-gray-600 dark:text-gray-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {effectTranslations[scoreData.tarabalamEffect]?.[isEnglish ? 'en' : 'ta'] || scoreData.tarabalamEffect}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {isEnglish ? 'Score Impact' : 'மதிப்பெண் தாக்கம்'}
                        </div>
                        <div className={`font-bold text-lg ${
                          scoreData.adjustment > 0 ? 'text-green-600 dark:text-green-400' :
                          scoreData.adjustment < 0 ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {scoreData.adjustment > 0 ? '+' : ''}{scoreData.adjustment || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {scoreData.tarabalamExplanation && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {isEnglish ? 'Detailed Explanation' : 'விரிவான விளக்கம்'}
                      </h5>
                      <p className="text-gray-700 dark:text-gray-300">
                        {isEnglish ? scoreData.tarabalamExplanation.en : scoreData.tarabalamExplanation.ta}
                      </p>
                    </div>
                  )}

                  {/* Visual Indicator */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                      {isEnglish ? 'Effect Intensity' : 'விளைவு தீவிரம்'}
                    </h5>
                    <div className="relative">
                      <div className="h-6 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 dark:from-red-800 dark:via-yellow-800 dark:to-green-800 rounded-full"></div>
                      <div 
                        className="absolute top-0 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-lg transform -translate-x-1/2"
                        style={{
                          left: `${50 + (scoreData.adjustment || 0) * 80}%`,
                          backgroundColor: scoreData.adjustment > 0 ? '#10B981' : 
                                          scoreData.adjustment < 0 ? '#EF4444' : '#9CA3AF'
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>{isEnglish ? 'Challenging' : 'சவாலான'}</span>
                      <span>{isEnglish ? 'Neutral' : 'நடுநிலை'}</span>
                      <span>{isEnglish ? 'Favorable' : 'சாதகமான'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-4xl mb-3 block">⭐</span>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isEnglish 
                      ? 'Tarabalam analysis not available' 
                      : 'தாரபல பகுப்பாய்வு கிடைக்கவில்லை'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 📱 SHARE BUTTON */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          >
            <span className="text-xl mr-3 group-hover:scale-110 transition-transform">📱</span>
            <span className="text-lg">
              {isEnglish 
                ? "Share My Cosmic Score" 
                : "எனது கோஸ்மிக் மதிப்பெண்ணைப் பகிரவும்"}
            </span>
          </button>
          
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            {isEnglish 
              ? 'Share your personalized cosmic analysis with friends and family'
              : 'உங்கள் தனிப்பயனாக்கப்பட்ட கோஸ்மிக் பகுப்பாய்வை நண்பர்கள் மற்றும் குடும்பத்தினருடன் பகிரவும்'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreDetailsComponent;
