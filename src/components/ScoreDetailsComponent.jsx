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
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        {isEnglish 
          ? "Personal score details are not available." 
          : "தனிப்பட்ட மதிப்பெண் விவரங்கள் கிடைக்கவில்லை."}
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
    if (score >= 7.0) return "text-[#00A3A3]";  // Teal for good scores
    if (score >= 5.0) return "text-[#FFA000]";  // Amber for medium scores
    return "text-[#FF5252]";                    // Coral for low scores
  };
  
  // Get background color based on score
  const getScoreBgColor = (score) => {
    if (score >= 7.0) return "bg-[#00A3A3]/10";  // Light teal for good scores
    if (score >= 5.0) return "bg-[#FFA000]/10";  // Light amber for medium scores
    return "bg-[#FF5252]/10";                    // Light coral for low scores
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
  const prepareShareText = () => {
    // Make sure selectedDate is available, otherwise use current date
    const dateToUse = selectedDate || new Date();
    
    const formattedDate = dateToUse.toLocaleDateString(
      isEnglish ? 'en-US' : 'ta-IN',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
    
    const scoreText = isEnglish 
      ? `*My Cosmic Score for ${formattedDate}*: ${personalScore.score}/10 ${getScoreEmoji(personalScore.score)}\n\n`
      : `*${formattedDate} அன்றைய எனது கோஸ்மிக் மதிப்பெண்*: ${personalScore.score}/10 ${getScoreEmoji(personalScore.score)}\n\n`;
    
    const tarabalamText = personalScore.tarabalamExplanation 
      ? (isEnglish ? personalScore.tarabalamExplanation.en : personalScore.tarabalamExplanation.ta) + '\n\n'
      : '';
      
    const chandrashtamaText = personalScore.isChandrashtama && personalScore.chandrashtamaExplanation
      ? (isEnglish ? personalScore.chandrashtamaExplanation.en : personalScore.chandrashtamaExplanation.ta) + '\n\n'
      : '';
    
    let favorableActivities = '';
    let unfavorableActivities = '';
    let colors = '';
    let affirmation = '';

    // Only include recommendations if they exist
    if (personalScore.recommendations) {
      if (personalScore.recommendations.activities && 
          personalScore.recommendations.activities.favorable &&
          Array.isArray(personalScore.recommendations.activities.favorable.en)) {
        favorableActivities = `${isEnglish ? '*Favorable Activities*' : '*சாதகமான செயல்பாடுகள்*'}:\n- ${
          isEnglish 
            ? personalScore.recommendations.activities.favorable.en.join('\n- ')
            : personalScore.recommendations.activities.favorable.ta.join('\n- ')
        }\n\n`;
      }
      
      if (personalScore.recommendations.activities && 
          personalScore.recommendations.activities.unfavorable &&
          Array.isArray(personalScore.recommendations.activities.unfavorable.en)) {
        unfavorableActivities = `${isEnglish ? '*Unfavorable Activities*' : '*சாதகமற்ற செயல்பாடுகள்*'}:\n- ${
          isEnglish 
            ? personalScore.recommendations.activities.unfavorable.en.join('\n- ')
            : personalScore.recommendations.activities.unfavorable.ta.join('\n- ')
        }\n\n`;
      }
      
      if (personalScore.recommendations.colors &&
          Array.isArray(personalScore.recommendations.colors.en)) {
        colors = `${isEnglish ? '*Favorable Colors*' : '*சாதகமான வண்ணங்கள்*'}: ${
          isEnglish 
            ? personalScore.recommendations.colors.en.join(', ')
            : personalScore.recommendations.colors.ta.join(', ')
        }\n\n`;
      }
      
      if (personalScore.recommendations.affirmation) {
        affirmation = `${isEnglish ? '*Today\'s Affirmation*' : '*இன்றைய உறுதிமொழி*'}:\n"${
          isEnglish 
            ? personalScore.recommendations.affirmation.en
            : personalScore.recommendations.affirmation.ta
        }"\n\n`;
      }
    }
      
    const appPromo = isEnglish 
      ? "Get your daily Cosmic Score based on Vedic astrology 🌟"
      : "வேத ஜோதிடத்தின் அடிப்படையில் உங்கள் தினசரி கோஸ்மிக் மதிப்பெண்ணைப் பெறுங்கள் 🌟";
      
    return scoreText + tarabalamText + chandrashtamaText + favorableActivities + 
           unfavorableActivities + colors + affirmation + appPromo;
  };
  
  // Handle custom WhatsApp share with error handling
  const handleCustomShare = () => {
    try {
      const shareText = prepareShareText();
      shareToWhatsApp(shareText);
    } catch (error) {
      console.error('Error preparing share text:', error);
      // Fallback to basic sharing if there's an error
      shareToWhatsApp(isEnglish 
        ? `My Cosmic Score: ${personalScore.score}/10 ${getScoreEmoji(personalScore.score)}`
        : `எனது கோஸ்மிக் மதிப்பெண்: ${personalScore.score}/10 ${getScoreEmoji(personalScore.score)}`
      );
    }
  };
  
  // Determine tabs to show
  const tabs = [
    { id: 'breakdown', label: isEnglish ? 'Score Breakdown' : 'மதிப்பெண் விரிவாக்கம்' },
    { id: 'recommendations', label: isEnglish ? 'Recommendations' : 'பரிந்துரைகள்' },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with personalized message */}
      <div className={`p-4 ${getScoreBgColor(personalScore.score)}`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium">
            {isEnglish ? 'Your Cosmic Analysis' : 'உங்கள் கோஸ்மிக் பகுப்பாய்வு'}
          </h2>
          <span className={`text-lg ${getScoreColor(personalScore.score)}`}>
            {getScoreEmoji(personalScore.score)}
          </span>
        </div>
        
        <p className="text-sm text-gray-700">
          {personalScore.tarabalamExplanation 
            ? (isEnglish ? personalScore.tarabalamExplanation.en : personalScore.tarabalamExplanation.ta)
            : (isEnglish ? 'Your personalized cosmic score for today.' : 'இன்றைய உங்கள் தனிப்பயனாக்கப்பட்ட கோஸ்மிக் மதிப்பெண்.')}
        </p>
        
        {personalScore.isChandrashtama && personalScore.chandrashtamaExplanation && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-amber-800">
            <strong>⚠️ {isEnglish ? 'Chandrashtama Alert:' : 'சந்திராஷ்டம எச்சரிக்கை:'}</strong>{' '}
            {isEnglish ? personalScore.chandrashtamaExplanation.en : personalScore.chandrashtamaExplanation.ta}
          </div>
        )}
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm flex-1 ${
                activeTab === tab.id 
                  ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
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
            <h3 className="font-medium mb-3">
              {isEnglish ? 'How Your Score is Calculated:' : 'உங்கள் மதிப்பெண் எவ்வாறு கணக்கிடப்படுகிறது:'}
            </h3>
            
            {hasScoreBreakdown ? (
              <div className="space-y-3">
                {/* Score Breakdown Items - Grid Layout to fix Tamil text overlap */}
                {/* Tithi */}
                <div className="grid grid-cols-12 gap-1 items-center mb-2">
                  {/* Label column */}
                  <div className="col-span-2 text-sm font-medium">
                    {isEnglish ? 'Tithi' : 'திதி'}
                  </div>
                  
                  {/* Name column with improved overflow handling */}
                  <div className="col-span-3 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {personalScore.scoreBreakdown.tithi.name}
                  </div>
                  
                  {/* Score column */}
                  <div className="col-span-1 text-xs font-medium text-center">
                    {personalScore.scoreBreakdown.tithi.score}/10
                  </div>
                  
                  {/* Progress bar column */}
                  <div className="col-span-5">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{width: `${personalScore.scoreBreakdown.tithi.score * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Weight column */}
                  <div className="col-span-1 text-xs text-right">
                    {personalScore.scoreBreakdown.tithi.weight}%
                  </div>
                </div>

                {/* Vara - same grid layout for consistency */}
                <div className="grid grid-cols-12 gap-1 items-center mb-2">
                  <div className="col-span-2 text-sm font-medium">
                    {isEnglish ? 'Vara' : 'வாரம்'}
                  </div>
                  <div className="col-span-3 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {personalScore.scoreBreakdown.vara.name}
                  </div>
                  <div className="col-span-1 text-xs font-medium text-center">
                    {personalScore.scoreBreakdown.vara.score}/10
                  </div>
                  <div className="col-span-5">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{width: `${personalScore.scoreBreakdown.vara.score * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="col-span-1 text-xs text-right">
                    {personalScore.scoreBreakdown.vara.weight}%
                  </div>
                </div>

                {/* Nakshatra - same grid layout */}
                <div className="grid grid-cols-12 gap-1 items-center mb-2">
                  <div className="col-span-2 text-sm font-medium">
                    {isEnglish ? 'Nakshatra' : 'நட்சத்திரம்'}
                  </div>
                  <div className="col-span-3 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {personalScore.scoreBreakdown.nakshatra.name}
                  </div>
                  <div className="col-span-1 text-xs font-medium text-center">
                    {personalScore.scoreBreakdown.nakshatra.score}/10
                  </div>
                  <div className="col-span-5">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{width: `${personalScore.scoreBreakdown.nakshatra.score * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="col-span-1 text-xs text-right">
                    {personalScore.scoreBreakdown.nakshatra.weight}%
                  </div>
                </div>

                {/* Yoga - same grid layout */}
                <div className="grid grid-cols-12 gap-1 items-center mb-2">
                  <div className="col-span-2 text-sm font-medium">
                    {isEnglish ? 'Yoga' : 'யோகம்'}
                  </div>
                  <div className="col-span-3 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {personalScore.scoreBreakdown.yoga.name}
                  </div>
                  <div className="col-span-1 text-xs font-medium text-center">
                    {personalScore.scoreBreakdown.yoga.score}/10
                  </div>
                  <div className="col-span-5">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{width: `${personalScore.scoreBreakdown.yoga.score * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="col-span-1 text-xs text-right">
                    {personalScore.scoreBreakdown.yoga.weight}%
                  </div>
                </div>

                {/* Karana - same grid layout */}
                <div className="grid grid-cols-12 gap-1 items-center mb-2">
                  <div className="col-span-2 text-sm font-medium">
                    {isEnglish ? 'Karana' : 'கரணம்'}
                  </div>
                  <div className="col-span-3 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {personalScore.scoreBreakdown.karana.name}
                  </div>
                  <div className="col-span-1 text-xs font-medium text-center">
                    {personalScore.scoreBreakdown.karana.score}/10
                  </div>
                  <div className="col-span-5">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{width: `${personalScore.scoreBreakdown.karana.score * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="col-span-1 text-xs text-right">
                    {personalScore.scoreBreakdown.karana.weight}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
                {isEnglish 
                  ? "Detailed score breakdown not available." 
                  : "விரிவான மதிப்பெண் பகுப்பாய்வு கிடைக்கவில்லை."}
              </div>
            )}
            
            {/* Thara Balam section - show if available */}
            {personalScore.tarabalamType && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-800 mb-1">
                  {isEnglish ? 'Thara Balam Effect' : 'தார பல விளைவு'}
                </h4>
                <p className="text-sm text-indigo-700">
                  {isEnglish 
                    ? `Your birth star ${userNakshatra ? `(${userNakshatra.name})` : ''} has a ${personalScore.tarabalamType} relationship with today's star.`
                    : `உங்கள் பிறப்பு நட்சத்திரம் (${getNakshatraName(userNakshatra?.name || "Revati", false)}) இன்றைய நட்சத்திரத்துடன் ${getTarabalamTypeName(personalScore.tarabalamType, false)} உறவைக் கொண்டுள்ளது.`}
                </p>
                
                {/* Improved Tarabalam visualization with fixed alignment */}
                <div className="mt-3 bg-white p-2 rounded-md border border-indigo-100">
                  <div className="mb-1 flex justify-between items-center">
                    <span className="text-xs font-medium text-indigo-700">
                      {isEnglish ? 'Effect' : 'விளைவு'}:
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      personalScore.tarabalamEffect === 'challenging' 
                        ? 'bg-red-100 text-red-700' 
                        : personalScore.tarabalamEffect === 'neutral'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-green-100 text-green-700'
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
                      <span className="text-xs text-red-600">
                        {isEnglish ? 'Negative' : 'எதிர்மறை'}
                      </span>
                      <span className="text-xs text-green-600">
                        {isEnglish ? 'Positive' : 'நேர்மறை'}
                      </span>
                    </div>
                    
                    {/* Fixed slider bar with proper alignment */}
                    <div className="relative h-2 w-full">
                      {/* Background gradient */}
                      <div className="h-2 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-full"></div>
                      
                      {/* Position dot based on adjustment value */}
                      <div 
                        className="absolute w-4 h-4 rounded-full -mt-1 shadow-md bg-red-500 transform -translate-x-1/2"
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
                    
                    <div className="text-center mt-3 text-xs text-indigo-700">
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
                  <h3 className="font-medium mb-2 text-[#00A3A3]">
                    {isEnglish ? 'Favorable Activities' : 'சாதகமான செயல்பாடுகள்'}
                  </h3>
                  <div className="bg-[#00A3A3]/10 rounded-lg p-3">
                    <ul className="list-disc pl-5 space-y-1">
                      {(isEnglish 
                        ? personalScore.recommendations.activities.favorable.en 
                        : personalScore.recommendations.activities.favorable.ta
                      ).map((activity, index) => (
                        <li key={index} className="text-sm">{activity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Unfavorable Activities */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-[#FF5252]">
                    {isEnglish ? 'Activities to Avoid' : 'தவிர்க்க வேண்டிய செயல்பாடுகள்'}
                  </h3>
                  <div className="bg-[#FF5252]/10 rounded-lg p-3">
                    <ul className="list-disc pl-5 space-y-1">
                      {(isEnglish 
                        ? personalScore.recommendations.activities.unfavorable.en 
                        : personalScore.recommendations.activities.unfavorable.ta
                      ).map((activity, index) => (
                        <li key={index} className="text-sm">{activity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Colors and Directions */}
                {personalScore.recommendations.colors && personalScore.recommendations.directions && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Auspicious Colors */}
                    <div>
                      <h3 className="font-medium mb-2 text-[#1A1046]">
                        {isEnglish ? 'Auspicious Colors' : 'சாதகமான வண்ணங்கள்'}
                      </h3>
                      <div className="bg-[#1A1046]/5 rounded-lg p-3">
                        <ul className="list-disc pl-5 space-y-1">
                          {(isEnglish 
                            ? personalScore.recommendations.colors.en 
                            : personalScore.recommendations.colors.ta
                          ).map((color, index) => (
                            <li key={index} className="text-sm">{color}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Favorable Directions */}
                    <div>
                      <h3 className="font-medium mb-2 text-[#1A1046]">
                        {isEnglish ? 'Favorable Directions' : 'சாதகமான திசைகள்'}
                      </h3>
                      <div className="bg-[#1A1046]/5 rounded-lg p-3">
                        <ul className="list-disc pl-5 space-y-1">
                          {(isEnglish 
                            ? personalScore.recommendations.directions.favorable.en 
                            : personalScore.recommendations.directions.favorable.ta
                          ).map((direction, index) => (
                            <li key={index} className="text-sm">{direction}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Today's Affirmation */}
                {personalScore.recommendations.affirmation && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-[#E3B23C]">
                      {isEnglish ? 'Today\'s Affirmation' : 'இன்றைய உறுதிமொழி'}
                    </h3>
                    <div className="bg-[#F8F3E6] border border-[#E3B23C]/20 rounded-lg p-3">
                      <p className="text-sm italic text-[#5D4037]">
                        "{isEnglish 
                          ? personalScore.recommendations.affirmation.en 
                          : personalScore.recommendations.affirmation.ta}"
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
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
            ? "Share Full Insights to WhatsApp" 
            : "முழு உள்ளுணர்வுகளை வாட்ஸ்அப்பில் பகிரவும்"}
        </button>
      </div>
    </div>
  );
};

export default ScoreDetailsComponent;