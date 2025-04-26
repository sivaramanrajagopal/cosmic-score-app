// src/services/panchangService.js - Enhanced with detailed scoring
import { supabase } from '../utils/supabaseClient';
import { DateTime } from 'luxon';

// Nakshatra mapping (ID to name and vice versa)
const nakshatraNameToId = {
  // English names
  "Ashwini": 1,
  "Bharani": 2,
  "Krittika": 3,
  "Rohini": 4,
  "Mrigashira": 5,
  "Ardra": 6,
  "Punarvasu": 7,
  "Pushya": 8,
  "Ashlesha": 9,
  "Magha": 10,
  "Purva Phalguni": 11,
  "Uttara Phalguni": 12,
  "Hasta": 13,
  "Chitra": 14,
  "Swati": 15,
  "Vishakha": 16,
  "Anuradha": 17,
  "Jyeshtha": 18,
  "Mula": 19,
  "Purva Ashadha": 20,
  "Uttara Ashadha": 21,
  "Shravana": 22,
  "Dhanishta": 23,
  "Shatabhisha": 24,
  "Purva Bhadrapada": 25,
  "Uttara Bhadrapada": 26,
  "Revati": 27,
  
  // Tamil names
  "அசுவினி": 1,
  "பரணி": 2,
  "கிருத்திகை": 3,
  "ரோகிணி": 4,
  "மிருகசிரிஷம்": 5,
  "திருவாதிரை": 6,
  "புனர்பூசம்": 7,
  "பூசம்": 8,
  "ஆயில்யம்": 9,
  "மகம்": 10,
  "பூரம்": 11,
  "உத்திரம்": 12,
  "அஸ்தம்": 13,
  "சித்திரை": 14,
  "சுவாதி": 15,
  "விசாகம்": 16,
  "அனுஷம்": 17,
  "கேட்டை": 18,
  "மூலம்": 19,
  "பூராடம்": 20,
  "உத்திராடம்": 21,
  "திருவோணம்": 22,
  "அவிட்டம்": 23,
  "சதயம்": 24,
  "பூரட்டாதி": 25,
  "உத்திரட்டாதி": 26,
  "ரேவதி": 27
};

const nakshatraIdToName = {};
const nakshatraIdToTamilName = {};

Object.entries(nakshatraNameToId).forEach(([name, id]) => {
  // Only add English names to avoid duplicates
  if (!name.match(/[\u0B80-\u0BFF]/)) { // Range for Tamil script
    nakshatraIdToName[id] = name;
  } else {
    // Add Tamil names to the Tamil mapping
    nakshatraIdToTamilName[id] = name;
  }
});

// Tamil translations for Tarabalam types
const tarabalamTypeTranslations = {
  "Janma": "ஜன்ம",
  "Sampat": "சம்பத்",
  "Vipat": "ஆபத்து",
  "Kshema": "க்ஷேம",
  "pagai": "பகை",
  "saadhagam": "சாதகம்",
  "vadham": "வதம்",
  "Mitra": "மித்ர",
  "Parama Mitra": "பரம மித்ர",
  "Unknown": "தெரியாத"
};

// Tamil translations for effect descriptions
const effectTranslations = {
  "challenging": "சவாலான",
  "favorable": "சாதகமான",
  "prosperous": "செழிப்பான",
  "mixed": "கலப்பான",
  "positive": "நேர்மறையான",
  "highly favorable": "மிகவும் சாதகமான",
  "neutral": "நடுநிலையான"
};

// Tithi auspiciousness ratings (1-10)
const tithiRatings = {
  "Pratipada": 7, "Prathama": 7, "பிரதமை": 7,
  "Dwitiya": 8, "திவிதியை": 8,
  "Tritiya": 9, "திருதியை": 9,
  "Chaturthi": 5, "சதுர்த்தி": 5,
  "Panchami": 8, "பஞ்சமி": 8,
  "Shashthi": 7, "ஷஷ்டி": 7,
  "Saptami": 6, "சப்தமி": 6,
  "Ashtami": 4, "அஷ்டமி": 4,
  "Navami": 7, "நவமி": 7,
  "Dashami": 8, "தசமி": 8,
  "Ekadashi": 10, "ஏகாதசி": 10,
  "Dwadashi": 9, "துவாதசி": 9,
  "Trayodashi": 7, "திரயோதசி": 7,
  "Chaturdashi": 5, "சதுர்தசி": 5,
  "Purnima": 9, "பௌர்ணமி": 9, "Amavasya": 5, "அமாவாசை": 5
};

// Vara (weekday) auspiciousness ratings (1-10)
const varaRatings = {
  "Sunday": 8, "ஞாயிற்றுக்கிழமை": 8,
  "Monday": 7, "திங்கட்கிழமை": 7,
  "Tuesday": 5, "செவ்வாய்க்கிழமை": 5,
  "Wednesday": 8, "புதன்கிழமை": 8,
  "Thursday": 10, "வியாழக்கிழமை": 10,
  "Friday": 9, "வெள்ளிக்கிழமை": 9,
  "Saturday": 6, "சனிக்கிழமை": 6
};

// Yoga auspiciousness ratings (1-10)
const yogaRatings = {
  "Vishkambha": 5, "விஷ்கம்பம்": 5,
  "Preeti": 9, "பிரீதி": 9,
  "Ayushman": 8, "ஆயுஷ்மான்": 8,
  "Saubhagya": 9, "சௌபாக்கியம்": 9,
  "Shobhana": 8, "சோபனம்": 8,
  "Atiganda": 4, "அதிகண்டம்": 4,
  "Sukarma": 7, "சுகர்மம்": 7,
  "Dhriti": 8, "திருதி": 8,
  "Shoola": 5, "சூலம்": 5,
  "Ganda": 4, "கண்டம்": 4,
  "Vriddhi": 7, "விருத்தி": 7,
  "Dhruva": 8, "த்ருவம்": 8,
  "Vyaghata": 6, "வியாகாதம்": 6,
  "Harshana": 8, "ஹர்ஷணம்": 8,
  "Vajra": 6, "வஜ்ரம்": 6,
  "Siddhi": 10, "சித்தி": 10,
  "Vyatipata": 4, "வியாதிபாதம்": 4,
  "Variyana": 7, "வரியானம்": 7,
  "Parigha": 5, "பரிகம்": 5,
  "Shiva": 9, "சிவம்": 9,
  "Siddha": 9, "சித்தம்": 9,
  "Sadhya": 8, "சாத்தியம்": 8,
  "Shubha": 10, "சுபம்": 10,
  "Shukla": 8, "சுக்லம்": 8,
  "Brahma": 9, "பிரம்மம்": 9,
  "Indra": 8, "இந்திரம்": 8,
  "Vaidhriti": 5, "வைத்ருதி": 5
};

// Karana auspiciousness ratings (1-10)
const karanaRatings = {
  "Bava": 8, "பவ": 8,
  "Balava": 7, "பாலவ": 7,
  "Kaulava": 9, "கௌலவ": 9,
  "Taitila": 8, "தைதில": 8,
  "Garaja": 7, "கரஜ": 7,
  "Vanija": 7, "வணிஜ": 7,
  "Vishti": 4, "விஷ்டி": 4, "Bhadra": 4, "பத்ர": 4,
  "Shakuni": 6, "சகுனி": 6,
  "Chatushpada": 7, "சதுஷ்பாத": 7,
  "Naga": 5, "நாக": 5,
  "Kimstughna": 6, "கிம்ஸ்துக்ன": 6
};

// Nakshatra auspiciousness ratings (1-10)
const nakshatraRatings = {
  "Ashwini": 8, "அசுவினி": 8,
  "Bharani": 6, "பரணி": 6,
  "Krittika": 7, "கிருத்திகை": 7,
  "Rohini": 9, "ரோகிணி": 9,
  "Mrigashira": 8, "மிருகசிரிஷம்": 8,
  "Ardra": 5, "திருவாதிரை": 5,
  "Punarvasu": 8, "புனர்பூசம்": 8,
  "Pushya": 10, "பூசம்": 10,
  "Ashlesha": 6, "ஆயில்யம்": 6,
  "Magha": 7, "மகம்": 7,
  "Purva Phalguni": 8, "பூரம்": 8,
  "Uttara Phalguni": 9, "உத்திரம்": 9,
  "Hasta": 8, "அஸ்தம்": 8,
  "Chitra": 8, "சித்திரை": 8,
  "Swati": 7, "சுவாதி": 7,
  "Vishakha": 8, "விசாகம்": 8,
  "Anuradha": 9, "அனுஷம்": 9,
  "Jyeshtha": 7, "கேட்டை": 7,
  "Mula": 6, "மூலம்": 6,
  "Purva Ashadha": 7, "பூராடம்": 7,
  "Uttara Ashadha": 8, "உத்திராடம்": 8,
  "Shravana": 9, "திருவோணம்": 9,
  "Dhanishta": 8, "அவிட்டம்": 8,
  "Shatabhisha": 7, "சதயம்": 7,
  "Purva Bhadrapada": 7, "பூரட்டாதி": 7,
  "Uttara Bhadrapada": 8, "உத்திரட்டாதி": 8,
  "Revati": 9, "ரேவதி": 9
};

// Calculate the Tarabalam relationship between two nakshatras
// FIXED: Properly calculate distance by counting from birth star to today's star
function calculateTarabalam(dayNakshatra, userNakshatraId) {
  // Convert day nakshatra to ID if it's a string name
  let dayNakshatraId;
  
  if (typeof dayNakshatra === 'string') {
    dayNakshatraId = nakshatraNameToId[dayNakshatra];
    if (!dayNakshatraId) {
      // Try to extract the nakshatra name from possible array or object
      try {
        const parsed = JSON.parse(dayNakshatra);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dayNakshatraId = nakshatraNameToId[parsed[0].name];
        } else if (parsed.name) {
          dayNakshatraId = nakshatraNameToId[parsed.name];
        }
      } catch (e) {
        // Not a JSON string, continue with other methods
        console.log("Failed to parse nakshatra as JSON:", e);
      }
    }
  } else if (typeof dayNakshatra === 'number') {
    dayNakshatraId = dayNakshatra;
  } else if (dayNakshatra && typeof dayNakshatra === 'object') {
    // Handle object or array
    if (Array.isArray(dayNakshatra) && dayNakshatra.length > 0) {
      if (dayNakshatra[0].id) {
        dayNakshatraId = dayNakshatra[0].id;
      } else if (dayNakshatra[0].name) {
        dayNakshatraId = nakshatraNameToId[dayNakshatra[0].name];
      }
    } else if (dayNakshatra.id) {
      dayNakshatraId = dayNakshatra.id;
    } else if (dayNakshatra.name) {
      dayNakshatraId = nakshatraNameToId[dayNakshatra.name];
    }
  }
  
  // Ensure we have numeric values
  dayNakshatraId = Number(dayNakshatraId) || 1;
  const userNakId = Number(userNakshatraId) || 1;
  
  console.log(`Calculating Tarabalam: Day Nakshatra ID: ${dayNakshatraId}, User Nakshatra ID: ${userNakId}`);
  
  // FIXED: Calculate distance by counting from birth star to today's star
  // If day nakshatra is >= user nakshatra, distance is straightforward
  // If day nakshatra is < user nakshatra, we need to wrap around the zodiac
  let distance;
  
  if (dayNakshatraId >= userNakId) {
    // Direct count from birth star to current star
    distance = dayNakshatraId - userNakId + 1;
  } else {
    // Count from birth star through the zodiac cycle to current star
    distance = (27 - userNakId + 1) + dayNakshatraId;
  }
  
  console.log(`Tarabalam distance: ${distance}`);
  
  // Determine Tarabalam type based on traditional calculation
  // The relationship is based on the count (distance)
  // Return both the type and a detailed explanation with Tamil support
  switch(distance) {
    case 1: case 10: case 19: 
      return { 
        type: "Janma", 
        tamil_type: "ஜன்ம",
        adjustment: -0.3,
        score: 4.0,
        effect: "challenging",
        tamil_effect: "சவாலான",
        explanation: {
          en: "Birth star (Janma) relationship can bring challenges and obstacles. Focus on self-care and reflection today.",
          ta: "பிறப்பு நட்சத்திர (ஜன்ம) உறவு சவால்களையும் தடைகளையும் கொண்டு வரலாம். இன்று சுய பராமரிப்பு மற்றும் சிந்தனையில் கவனம் செலுத்தவும்."
        }
      };
    case 2: case 11: case 20: 
      return { 
        type: "Sampat", 
        tamil_type: "சம்பத்",
        adjustment: 0.5,
        score: 8.5,
        effect: "prosperous",
        tamil_effect: "செழிப்பான",
        explanation: {
          en: "Wealth (Sampat) relationship brings prosperity and abundance. Good day for financial decisions and new opportunities.",
          ta: "செல்வ (சம்பத்) உறவு செழிப்பையும் வளமையும் கொண்டு வருகிறது. நிதி முடிவுகள் மற்றும் புதிய வாய்ப்புகளுக்கு நல்ல நாள்."
        }
      };
    case 3: case 12: case 21: 
      return { 
        type: "Vipat", 
        tamil_type: "ஆபத்து",
        adjustment: -0.5,
        score: 3.5,
        effect: "challenging",
        tamil_effect: "சவாலான",
        explanation: {
          en: "Danger (Vipat) relationship suggests caution. Better to avoid major decisions or risky ventures today.",
          ta: "ஆபத்து (ஆபத்து) உறவு எச்சரிக்கையை குறிக்கிறது. இன்று பெரிய முடிவுகள் அல்லது ஆபத்தான முயற்சிகளைத் தவிர்ப்பது நல்லது."
        }
      };
    case 4: case 13: case 22: 
      return { 
        type: "Kshema", 
        tamil_type: "க்ஷேம",
        adjustment: 0.3,
        score: 7.5,
        effect: "favorable",
        tamil_effect: "சாதகமான",
        explanation: {
          en: "Well-being (Kshema) relationship promotes stability and comfort. Good for health-related activities and family matters.",
          ta: "நல்வாழ்வு (க்ஷேம) உறவு நிலைத்தன்மை மற்றும் ஆறுதலை ஊக்குவிக்கிறது. ஆரோக்கியம் தொடர்பான செயல்பாடுகள் மற்றும் குடும்ப விஷயங்களுக்கு நல்லது."
        }
      };
    case 5: case 14: case 23: 
      return { 
        type: "Pratyak", 
        tamil_type: "பகை",
        adjustment: -0.1,
        score: 5.0,
        effect: "mixed",
        tamil_effect: "கலப்பான",
        explanation: {
          en: "Obstacle (Pratyak) relationship may bring minor challenges. Be patient and avoid unnecessary conflicts today.",
          ta: "தடை (பகை) உறவு சிறிய சவால்களைக் கொண்டு வரலாம். பொறுமையாக இருந்து இன்று தேவையற்ற மோதல்களைத் தவிர்க்கவும்."
        }
      };
    case 6: case 15: case 24: 
      return { 
        type: "Sadhagam", 
        tamil_type: "சாதகம்",
        adjustment: 0.2,
        score: 7.0,
        effect: "positive",
        tamil_effect: "நேர்மறையான",
        explanation: {
          en: "Achievement (Sadhana) relationship supports accomplishing goals. Good for focused work and completing projects.",
          ta: "சாதனை (சாதன) உறவு இலக்குகளை அடைவதற்கு ஆதரவாக உள்ளது. கவனம் செலுத்திய வேலை மற்றும் திட்டங்களை முடிப்பதற்கு நல்லது."
        }
      };
    case 7: case 16: case 25: 
      return { 
        type: "vadham", 
        tamil_type: "வதம்",
        adjustment: -0.2,
        score: 4.5,
        effect: "challenging",
        tamil_effect: "சவாலான",
        explanation: {
          en: "End (vadham) relationship may bring closures or endings. Good for reflection but avoid starting new ventures.",
          ta: "முடிவு (வதம்) உறவு முடிவுகளைக் கொண்டு வரலாம். சிந்தனைக்கு நல்லது ஆனால் புதிய முயற்சிகளைத் தொடங்குவதைத் தவிர்க்கவும்."
        }
      };
    case 8: case 17: case 26: 
      return { 
        type: "Mitra", 
        tamil_type: "மித்ர",
        adjustment: 0.4,
        score: 8.0,
        effect: "favorable",
        tamil_effect: "சாதகமான",
        explanation: {
          en: "Friend (Mitra) relationship brings support and harmony. Good for social activities and collaborative projects.",
          ta: "நண்பர் (மித்ர) உறவு ஆதரவையும் நல்லிணக்கத்தையும் கொண்டு வருகிறது. சமூக செயல்பாடுகள் மற்றும் கூட்டு திட்டங்களுக்கு நல்லது."
        }
      };
    case 9: case 18: case 27: 
      return { 
        type: "Parama Mitra", 
        tamil_type: "பரம மித்ர",
        adjustment: 0.6,
        score: 9.0,
        effect: "highly favorable",
        tamil_effect: "மிகவும் சாதகமான",
        explanation: {
          en: "Great friend (Parama Mitra) relationship is highly auspicious. Excellent for important events, new beginnings, and spiritual practices.",
          ta: "சிறந்த நண்பர் (பரம மித்ர) உறவு மிகவும் நற்பலன் தரக்கூடியது. முக்கிய நிகழ்வுகள், புதிய தொடக்கங்கள் மற்றும் ஆன்மீக நடைமுறைகளுக்கு சிறந்தது."
        }
      };
    default: 
      return { 
        type: "Unknown", 
        tamil_type: "தெரியாத",
        adjustment: 0,
        score: 5.0,
        effect: "neutral",
        tamil_effect: "நடுநிலையான",
        explanation: {
          en: "The relationship between your birth star and today's star is neutral.",
          ta: "உங்கள் பிறப்பு நட்சத்திரத்திற்கும் இன்றைய நட்சத்திரத்திற்கும் இடையேயான உறவு நடுநிலையானது."
        }
      };
  }
}

// Get panchang data for a specific date
export async function getPanchangData(date) {
  try {
    // const formattedDate = DateTime.fromJSDate(date).toISODate();
    const dateObj = new Date(date);
    // Use UTC methods to create a consistent date string in IST
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    console.log("Attempting to fetch panchang data for date:", formattedDate);
    
    // Check if Supabase connection is working
    
    // Check if Supabase connection is working
    if (!supabase) {
      console.error("Supabase client is not initialized");
      throw new Error("Database connection error");
    }
    
    // Try to get the data
    const { data, error } = await supabase
      .from('daily_panchangam')
      .select('*')
      .eq('date', formattedDate)
      .single();
    
    if (error) {
      console.error('Error fetching panchang data:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      // Check for common errors
      if (error.code === 'PGRST116') {
        console.error('No data found for the specified date');
      } else if (error.code === '42P01') {
        console.error('Table "daily_panchangam" does not exist');
      } else if (error.code === '42703') {
        console.error('Column name error - check your column names');
      }
      
      throw error;
    }
    
    if (!data) {
      console.error('No data found for date:', formattedDate);
      
      // For testing purposes, return mock data if no real data is found
      const mockData = {
        date: formattedDate,
        tithi: [{
          id: 40, 
          index: 0, 
          name: "நவமி", 
          paksha: "கிருஷ்ண பக்ஷ", 
          start: "2025-04-21T18:59:13+05:30", 
          end: "2025-04-22T18:13:28+05:30"
        }],
        vaara: "செவ்வாய்க்கிழமை",
        nakshatra: [{
          id: 21, 
          name: "திருவோணம்", 
          lord: {
            id: 1, 
            name: "சந்திரன்", 
            vedic_name: "சந்திரன்"
          }, 
          start: "2025-04-21T12:37:29+05:30", 
          end: "2025-04-22T12:44:17+05:30"
        }],
        main_nakshatra: "திருவோணம்",
        karana: [{
          index: 0, 
          id: 3, 
          name: "சைதுளை", 
          start: "2025-04-21T18:59:13+05:30", 
          end: "2025-04-22T06:41:52+05:30"
        }],
        yoga: [{
          id: 22, 
          name: "சுபம்", 
          start: "2025-04-21T23:00:15+05:30", 
          end: "2025-04-22T21:13:10+05:30"
        }],
        cosmic_score: 7.8,
        sunrise: "2025-04-21T06:15:00+05:30",
        sunset: "2025-04-21T18:30:00+05:30",
        moonrise: "2025-04-21T14:22:00+05:30",
        moonset: "2025-04-21T02:45:00+05:30",
        is_amavasai: false,
        is_pournami: false,
        is_mythra_muhurtham: true,
        chandrashtama_for: ["Punarvasu","Ardra"],
        tarabalam_type: "Vipat"
      };
      
      console.log("Returning mock data for development");
      return mockData;
    }
    
    console.log("Successfully retrieved panchang data:", data);
    return data;
  } catch (err) {
    console.error('Error in getPanchangData:', err);
    
    // Return mock data for development to keep the app working
    const mockData = {
      date: DateTime.fromJSDate(date).toISODate(),
      tithi: [{
        id: 40, 
        index: 0, 
        name: "நவமி", 
        paksha: "கிருஷ்ண பக்ஷ", 
        start: "2025-04-21T18:59:13+05:30", 
        end: "2025-04-22T18:13:28+05:30"
      }],
      vaara: "செவ்வாய்க்கிழமை",
      nakshatra: [{
        id: 23, 
        name: "அவிட்டம்", 
        lord: {
          id: 4, 
          name: "செவ்வாய்", 
          vedic_name: "செவ்வாய்"
        }, 
        start: "2025-04-21T12:37:29+05:30", 
        end: "2025-04-22T12:44:17+05:30"
      }],
      main_nakshatra: "அவிட்டம்",
      karana: [{
        index: 0, 
        id: 3, 
        name: "சைதுளை", 
        start: "2025-04-21T18:59:13+05:30", 
        end: "2025-04-22T06:41:52+05:30"
      }],
      yoga: [{
        id: 22, 
        name: "சுபம்", 
        start: "2025-04-21T23:00:15+05:30", 
        end: "2025-04-22T21:13:10+05:30"
      }],
      cosmic_score: 7.8,
      sunrise: "2025-04-21T06:15:00+05:30",
      sunset: "2025-04-21T18:30:00+05:30",
      moonrise: "2025-04-21T14:22:00+05:30",
      moonset: "2025-04-21T02:45:00+05:30",
      is_amavasai: false,
      is_pournami: false,
      is_mythra_muhurtham: true,
      chandrashtama_for: ["Punarvasu","Ardra"],
      tarabalam_type: "Vipat"
    };
    
    console.log("Returning mock data due to error");
    return mockData;
  }
}

// Get panchang data for a date range
export async function getPanchangDataRange(startDate, endDate) {
  try {
    const formattedStartDate = DateTime.fromJSDate(startDate).toISODate();
    const formattedEndDate = DateTime.fromJSDate(endDate).toISODate();
    
    const { data, error } = await supabase
      .from('daily_panchangam')
      .select('*')
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching panchang data range:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      // Return mock data range for development
      const mockDataRange = [
        {
          date: formattedStartDate,
          tithi: [{name: "நவமி"}],
          vaara: "திங்கட்கிழமை",
          nakshatra: [{name: "திருவோணம்"}],
          main_nakshatra: "திருவோணம்",
          cosmic_score: 7.8
        },
        {
          date: DateTime.fromISO(formattedStartDate).plus({ days: 1 }).toISODate(),
          tithi: [{name: "தசமி"}],
          vaara: "செவ்வாய்க்கிழமை",
          nakshatra: [{name: "அவிட்டம்"}],
          main_nakshatra: "அவிட்டம்",
          cosmic_score: 6.5
        }
      ];
      return mockDataRange;
    }
    
    return data;
  } catch (err) {
    console.error('Error in getPanchangDataRange:', err);
    
    // Return mock data for development
    const mockDataRange = [
      {
        date: DateTime.fromJSDate(startDate).toISODate(),
        tithi: [{name: "நவமி"}],
        vaara: "திங்கட்கிழமை",
        nakshatra: [{name: "திருவோணம்"}],
        main_nakshatra: "திருவோணம்",
        cosmic_score: 7.8
      },
      {
        date: DateTime.fromJSDate(startDate).plus({ days: 1 }).toISODate(),
        tithi: [{name: "தசமி"}],
        vaara: "செவ்வாய்க்கிழமை",
        nakshatra: [{name: "அவிட்டம்"}],
        main_nakshatra: "அவிட்டம்",
        cosmic_score: 6.5
      }
    ];
    return mockDataRange;
  }
}

// Get user-specific panchang score with detailed breakdown
export async function getUserSpecificScore(date, userNakshatraId) {
  try {
    console.log("getUserSpecificScore called with date:", date, "and userNakshatraId:", userNakshatraId);
    const panchangData = await getPanchangData(date);
    console.log("Calculating personal score for nakshatra ID:", userNakshatraId);
    
    // Get user's nakshatra name for reference
    const userNakshatraName = nakshatraIdToName[userNakshatraId] || "Unknown";
    const userNakshatraTamilName = nakshatraIdToTamilName[userNakshatraId] || "Unknown";
    console.log("User nakshatra name:", userNakshatraName);
    console.log("User nakshatra Tamil name:", userNakshatraTamilName);
    
    // Get the main nakshatra for the day
    let mainNakshatra = panchangData.main_nakshatra;
    
    // If main_nakshatra isn't available, try to get it from nakshatra array
    if (!mainNakshatra && panchangData.nakshatra) {
      if (Array.isArray(panchangData.nakshatra) && panchangData.nakshatra.length > 0) {
        mainNakshatra = panchangData.nakshatra[0].name;
      } else if (typeof panchangData.nakshatra === 'object') {
        mainNakshatra = panchangData.nakshatra.name;
      } else if (typeof panchangData.nakshatra === 'string') {
        try {
          const parsed = JSON.parse(panchangData.nakshatra);
          if (Array.isArray(parsed) && parsed.length > 0) {
            mainNakshatra = parsed[0].name;
          } else if (parsed && parsed.name) {
            mainNakshatra = parsed.name;
          }
        } catch (e) {
          // Not JSON, use as is
          mainNakshatra = panchangData.nakshatra;
        }
      }
    }
    
    console.log("Day's main nakshatra:", mainNakshatra);
    
    // Calculate personalized Tarabalam based on the relationship between
    // user's birth nakshatra and today's nakshatra
    const tarabalam = calculateTarabalam(mainNakshatra, userNakshatraId);
    console.log("Calculated Tarabalam:", tarabalam);
    
    // Check if user's nakshatra is in chandrashtama_for list
    let isChandrashtama = false;
    if (panchangData.chandrashtama_for) {
      // Parse chandrashtama_for which could be array, string, or JSON string
      let chandrashtamaList = [];
      
      if (Array.isArray(panchangData.chandrashtama_for)) {
        chandrashtamaList = panchangData.chandrashtama_for;
      } else if (typeof panchangData.chandrashtama_for === 'string') {
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(panchangData.chandrashtama_for);
          chandrashtamaList = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If not valid JSON, treat as comma-separated
          chandrashtamaList = panchangData.chandrashtama_for.split(',').map(s => s.trim());
        }
      }
      
      console.log("Chandrashtama list:", chandrashtamaList);
      
      // Check if user's nakshatra name is in the chandrashtama list
      isChandrashtama = chandrashtamaList.some(item => {
        const itemString = String(item).trim();
        return itemString === userNakshatraName ||
               itemString === nakshatraIdToName[userNakshatraId];
      });
    }
    
    console.log("Is Chandrashtama for this user:", isChandrashtama);
    
    // Extract names from panchang data with better error handling
    let tithiName = "", yogaName = "", karanaName = "", nakshatraName = "", varaName = "";
    
    // Extract Tithi
    try {
      if (panchangData.tithi) {
        if (Array.isArray(panchangData.tithi) && panchangData.tithi.length > 0) {
          tithiName = panchangData.tithi[0].name || "Unknown";
        } else if (typeof panchangData.tithi === 'object' && panchangData.tithi.name) {
          tithiName = panchangData.tithi.name;
        } else if (typeof panchangData.tithi === 'string') {
          try {
            const parsed = JSON.parse(panchangData.tithi);
            if (Array.isArray(parsed) && parsed.length > 0) {
              tithiName = parsed[0].name || "Unknown";
            } else if (parsed && parsed.name) {
              tithiName = parsed.name;
            } else {
              tithiName = panchangData.tithi;
            }
          } catch (e) {
            tithiName = panchangData.tithi;
          }
        }
      }
    } catch (e) {
      console.error("Error extracting tithi name:", e);
      tithiName = "Unknown";
    }
    
    // Extract Yoga
    try {
      if (panchangData.yoga) {
        if (Array.isArray(panchangData.yoga) && panchangData.yoga.length > 0) {
          yogaName = panchangData.yoga[0].name || "Unknown";
        } else if (typeof panchangData.yoga === 'object' && panchangData.yoga.name) {
          yogaName = panchangData.yoga.name;
        } else if (typeof panchangData.yoga === 'string') {
          try {
            const parsed = JSON.parse(panchangData.yoga);
            if (Array.isArray(parsed) && parsed.length > 0) {
              yogaName = parsed[0].name || "Unknown";
            } else if (parsed && parsed.name) {
              yogaName = parsed.name;
            } else {
              yogaName = panchangData.yoga;
            }
          } catch (e) {
            yogaName = panchangData.yoga;
          }
        }
      }
    } catch (e) {
      console.error("Error extracting yoga name:", e);
      yogaName = "Unknown";
    }
    
    // Extract Karana
    try {
      if (panchangData.karana) {
        if (Array.isArray(panchangData.karana) && panchangData.karana.length > 0) {
          karanaName = panchangData.karana[0].name || "Unknown";
        } else if (typeof panchangData.karana === 'object' && panchangData.karana.name) {
          karanaName = panchangData.karana.name;
        } else if (typeof panchangData.karana === 'string') {
          try {
            const parsed = JSON.parse(panchangData.karana);
            if (Array.isArray(parsed) && parsed.length > 0) {
              karanaName = parsed[0].name || "Unknown";
            } else if (parsed && parsed.name) {
              karanaName = parsed.name;
            } else {
              karanaName = panchangData.karana;
            }
          } catch (e) {
            karanaName = panchangData.karana;
          }
        }
      }
    } catch (e) {
      console.error("Error extracting karana name:", e);
      karanaName = "Unknown";
    }
    
    // Nakshatra already processed above as mainNakshatra
    nakshatraName = mainNakshatra || "Unknown";
    
    // Vara (weekday)
    varaName = panchangData.vaara || "Unknown";
    
    console.log("Extracted element names:", {
      tithi: tithiName,
      yoga: yogaName,
      karana: karanaName,
      nakshatra: nakshatraName,
      vara: varaName
    });
    
    // Calculate individual scores for each element (with fallbacks)
    const tithiScore = tithiRatings[tithiName] || 5;
    const varaScore = varaRatings[varaName] || 7;
    const yogaScore = yogaRatings[yogaName] || 7;
    const karanaScore = karanaRatings[karanaName] || 7;
    const nakshatraScore = nakshatraRatings[nakshatraName] || 7;
    
    console.log("Individual element scores:", {
      tithi: tithiScore,
      yoga: yogaScore,
      karana: karanaScore,
      nakshatra: nakshatraScore,
      vara: varaScore
    });
    
    // Calculate weighted average for general cosmic score
    // Weights: Tithi (25%), Vara (15%), Nakshatra (30%), Yoga (15%), Karana (15%)
    const calculatedCosmicScore = (
      (tithiScore * 0.25) +
      (varaScore * 0.15) +
      (nakshatraScore * 0.30) +
      (yogaScore * 0.15) +
      (karanaScore * 0.15)
    );
    
    // Use calculated score or fall back to provided cosmic_score
    const baseScore = panchangData.cosmic_score || Math.round(calculatedCosmicScore * 10) / 10;
    console.log("Base cosmic score:", baseScore);
    
    // Calculate personalized score
    let personalScore;
    let chandrashtamaExplanation = null;
    
    if (isChandrashtama) {
      // For chandrashtama days, maximum score is 4.0
      personalScore = Math.min(4.0, baseScore * 0.6);
      console.log("Applied Chandrashtama reduction to score:", personalScore);
      
      chandrashtamaExplanation = {
        en: "Today is Chandrashtama for your birth star, which generally indicates a challenging day. Limit major activities and focus on rest and spiritual practices.",
        ta: "இன்று உங்கள் பிறப்பு நட்சத்திரத்திற்கு சந்திராஷ்டமம், இது பொதுவாக ஒரு சவாலான நாளைக் குறிக்கிறது. முக்கிய செயல்பாடுகளை மட்டுப்படுத்தி ஓய்வு மற்றும் ஆன்மீக நடைமுறைகளில் கவனம் செலுத்துங்கள்."
      };
    } else {
      // Apply personalized Tarabalam adjustment
      personalScore = baseScore + tarabalam.adjustment;
      
      // Ensure score stays within 1-10 range and round to 1 decimal
      personalScore = Math.round(Math.min(10, Math.max(1, personalScore)) * 10) / 10;
      console.log("Final personal score with Tarabalam adjustment:", personalScore);
    }
    
    // Generate recommendations based on personalScore and tarabalam
    const recommendations = generateRecommendations(personalScore, tarabalam, userNakshatraId, isChandrashtama);
    
    // Create the full result object
    const result = {
      score: personalScore,
      tarabalamType: tarabalam.type,
      tarabalamTypeTamil: tarabalam.tamil_type,
      tarabalamEffect: tarabalam.effect,
      tarabalamEffectTamil: tarabalam.tamil_effect,
      adjustment: tarabalam.adjustment,
      tarabalamExplanation: tarabalam.explanation,
      chandrashtamaExplanation: chandrashtamaExplanation,
      isChandrashtama: isChandrashtama,
      cosmicScore: baseScore,
      scoreBreakdown: {
        tithi: { name: tithiName, score: tithiScore, weight: 25 },
        vara: { name: varaName, score: varaScore, weight: 15 },
        nakshatra: { name: nakshatraName, score: nakshatraScore, weight: 30 },
        yoga: { name: yogaName, score: yogaScore, weight: 15 },
        karana: { name: karanaName, score: karanaScore, weight: 15 }
      },
      recommendations: recommendations,
      panchangData: panchangData
    };
    
    console.log("Generated personal score result:", JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.error('Error in getUserSpecificScore:', err);
    
    // Return a more complete fallback data to avoid undefined errors
    return {
      score: 6.5,
      tarabalamType: "Vipat",
      tarabalamTypeTamil: "ஆபத்து",
      tarabalamEffect: "challenging",
      tarabalamEffectTamil: "சவாலான",
      adjustment: -0.2,
      tarabalamExplanation: {
        en: "The relationship between your birth star and today's star suggests caution.",
        ta: "உங்கள் பிறப்பு நட்சத்திரத்திற்கும் இன்றைய நட்சத்திரத்திற்கும் இடையேயான உறவு எச்சரிக்கையை பரிந்துரைக்கிறது."
      },
      isChandrashtama: false,
      cosmicScore: 7.8,
      scoreBreakdown: {
        tithi: { name: "நவமி", score: 7, weight: 25 },
        vara: { name: "செவ்வாய்க்கிழமை", score: 5, weight: 15 },
        nakshatra: { name: "அவிட்டம்", score: 8, weight: 30 },
        yoga: { name: "சுபம்", score: 10, weight: 15 },
        karana: { name: "சைதுளை", score: 7, weight: 15 }
      },
      recommendations: {
        activities: {
          favorable: {
            en: ["Routine tasks", "Personal reflection", "Planning"],
            ta: ["வழக்கமான பணிகள்", "தனிப்பட்ட பிரதிபலிப்பு", "திட்டமிடல்"]
          },
          unfavorable: {
            en: ["Major financial decisions", "Starting new ventures", "Travel"],
            ta: ["பெரிய நிதி முடிவுகள்", "புதிய முயற்சிகளைத் தொடங்குதல்", "பயணம்"]
          }
        },
        colors: {
          en: ["Blue", "White"],
          ta: ["நீலம்", "வெள்ளை"]
        },
        directions: {
          favorable: {
            en: ["North", "East"],
            ta: ["வடக்கு", "கிழக்கு"]
          },
          unfavorable: {
            en: ["South"],
            ta: ["தெற்கு"]
          }
        },
        affirmation: {
          en: "I practice patience and careful consideration in all my actions today.",
          ta: "இன்று எனது அனைத்து செயல்களிலும் பொறுமையையும் கவனமான பரிசீலனையையும் பயிற்சி செய்கிறேன்."
        }
      },
      panchangData: null
    };
  }
}

// Generate personalized recommendations based on score and tarabalam
function generateRecommendations(score, tarabalam, nakshatraId, isChandrashtama) {
  // Base recommendations by score range
  let recommendations = {
    activities: {
      favorable: { en: [], ta: [] },
      unfavorable: { en: [], ta: [] }
    },
    colors: { en: [], ta: [] },
    directions: {
      favorable: { en: [], ta: [] },
      unfavorable: { en: [], ta: [] }
    },
    affirmation: { en: "", ta: "" }
  };
  
  // Favorable activities based on score
  if (score >= 7.5) {
    // High score - very favorable day
    recommendations.activities.favorable.en = [
      "Important meetings and negotiations", 
      "Starting new ventures", 
      "Financial investments",
      "Travel",
      "Celebrations and social gatherings"
    ];
    recommendations.activities.favorable.ta = [
      "முக்கியமான கூட்டங்கள் மற்றும் பேச்சுவார்த்தைகள்",
      "புதிய முயற்சிகளைத் தொடங்குதல்",
      "நிதி முதலீடுகள்",
      "பயணம்",
      "கொண்டாட்டங்கள் மற்றும் சமூக கூட்டங்கள்"
    ];
    recommendations.activities.unfavorable.en = [
      "Procrastination",
      "Isolation"
    ];
    recommendations.activities.unfavorable.ta = [
      "காலம் கடத்துதல்",
      "தனிமைப்படுதல்"
    ];
    recommendations.affirmation.en = "I embrace the positive energy of today and make the most of every opportunity that comes my way.";
    recommendations.affirmation.ta = "இன்றைய நேர்மறையான ஆற்றலை நான் ஏற்றுக்கொள்கிறேன், என் வழியில் வரும் ஒவ்வொரு வாய்ப்பையும் பயன்படுத்திக்கொள்கிறேன்.";
  } else if (score >= 5.5) {
    // Medium score - moderately favorable day
    recommendations.activities.favorable.en = [
      "Routine work", 
      "Moderate planning", 
      "Learning and education",
      "Family activities",
      "Spiritual practices"
    ];
    recommendations.activities.favorable.ta = [
      "வழக்கமான வேலை",
      "மிதமான திட்டமிடல்",
      "கற்றல் மற்றும் கல்வி",
      "குடும்ப செயல்பாடுகள்",
      "ஆன்மீக நடைமுறைகள்"
    ];
    recommendations.activities.unfavorable.en = [
      "Major financial decisions",
      "Confrontations",
      "Risky ventures"
    ];
    recommendations.activities.unfavorable.ta = [
      "பெரிய நிதி முடிவுகள்",
      "மோதல்கள்",
      "ஆபத்தான முயற்சிகள்"
    ];
    recommendations.affirmation.en = "I maintain balance and harmony as I navigate through the opportunities and challenges of today.";
    recommendations.affirmation.ta = "இன்றைய வாய்ப்புகள் மற்றும் சவால்களில் நான் செல்லும்போது சமநிலையையும் நல்லிணக்கத்தையும் பராமரிக்கிறேன்.";
  } else {
    // Low score - challenging day
    recommendations.activities.favorable.en = [
      "Reflection and meditation", 
      "Routine maintenance", 
      "Rest and self-care",
      "Planning for future",
      "Spiritual rituals"
    ];
    recommendations.activities.favorable.ta = [
      "பிரதிபலிப்பு மற்றும் தியானம்",
      "வழக்கமான பராமரிப்பு",
      "ஓய்வு மற்றும் சுய பராமரிப்பு",
      "எதிர்காலத்திற்கான திட்டமிடல்",
      "ஆன்மீக சடங்குகள்"
    ];
    recommendations.activities.unfavorable.en = [
      "Major decisions", 
      "Starting new projects",
      "Important meetings",
      "Travel",
      "Legal matters"
    ];
    recommendations.activities.unfavorable.ta = [
      "முக்கிய முடிவுகள்",
      "புதிய திட்டங்களைத் தொடங்குதல்",
      "முக்கியமான கூட்டங்கள்",
      "பயணம்",
      "சட்ட விவகாரங்கள்"
    ];
    recommendations.affirmation.en = "I focus on patience and inner strength, knowing that challenges are opportunities for growth.";
    recommendations.affirmation.ta = "சவால்கள் வளர்ச்சிக்கான வாய்ப்புகள் என்பதை அறிந்து, பொறுமை மற்றும் உள் வலிமையில் கவனம் செலுத்துகிறேன்.";
  }
  
  // Adjust recommendations based on Tarabalam effect
  if (tarabalam.effect === "highly favorable") {
    recommendations.activities.favorable.en.push("Important ceremonies", "Major life decisions");
    recommendations.activities.favorable.ta.push("முக்கியமான சடங்குகள்", "முக்கிய வாழ்க்கை முடிவுகள்");
  } else if (tarabalam.effect === "challenging") {
    recommendations.activities.unfavorable.en.push("Confrontations", "Major purchases");
    recommendations.activities.unfavorable.ta.push("மோதல்கள்", "பெரிய கொள்முதல்கள்");
  }
  
  // Add special recommendations for Chandrashtama
  if (isChandrashtama) {
    recommendations.activities.favorable.en = [
      "Prayer and meditation",
      "Rest and recovery",
      "Simple routines",
      "Spiritual practices",
      "Charitable acts"
    ];
    recommendations.activities.favorable.ta = [
      "பிரார்த்தனை மற்றும் தியானம்",
      "ஓய்வு மற்றும் மீட்பு",
      "எளிய வழக்கங்கள்",
      "ஆன்மீக நடைமுறைகள்",
      "தர்ம செயல்கள்"
    ];
    recommendations.activities.unfavorable.en = [
      "Major decisions",
      "New initiatives",
      "Financial transactions",
      "Travel",
      "Arguments and conflicts"
    ];
    recommendations.activities.unfavorable.ta = [
      "முக்கிய முடிவுகள்",
      "புதிய முயற்சிகள்",
      "நிதி பரிவர்த்தனைகள்",
      "பயணம்",
      "விவாதங்கள் மற்றும் மோதல்கள்"
    ];
    recommendations.affirmation.en = "I focus on inner peace and spiritual growth during this challenging time.";
    recommendations.affirmation.ta = "இந்த சவாலான நேரத்தில் உள் அமைதி மற்றும் ஆன்மீக வளர்ச்சியில் கவனம் செலுத்துகிறேன்.";
  }
  
  // Assign colors based on nakshatra lord
  const nakshatraIdNum = Number(nakshatraId) || 1;
  
  // Group nakshatras by lord (planet)
  // Sun: 1-3 (Ketu), 10-12 (Sun)
  // Moon: 4-6 (Venus), 22-24 (Saturn)
  // Mars: 7-9 (Sun), 25-27 (Jupiter)
  // Mercury: 13-15 (Mars), 16-18 (Rahu)
  // Jupiter: 19-21 (Mercury)
  
  if ([1, 2, 3, 10, 11, 12].includes(nakshatraIdNum)) {
    // Sun/Ketu nakshatras
    recommendations.colors.en = ["Red", "Pink", "Orange"];
    recommendations.colors.ta = ["சிவப்பு", "இளஞ்சிவப்பு", "ஆரஞ்சு"];
    recommendations.directions.favorable.en = ["East", "Northeast"];
    recommendations.directions.favorable.ta = ["கிழக்கு", "வடகிழக்கு"];
  } else if ([4, 5, 6, 22, 23, 24].includes(nakshatraIdNum)) {
    // Moon/Venus/Saturn nakshatras
    recommendations.colors.en = ["White", "Silver", "Light Blue"];
    recommendations.colors.ta = ["வெள்ளை", "வெள்ளி", "இளநீலம்"];
    recommendations.directions.favorable.en = ["Northwest", "North"];
    recommendations.directions.favorable.ta = ["வடமேற்கு", "வடக்கு"];
  } else if ([7, 8, 9, 25, 26, 27].includes(nakshatraIdNum)) {
    // Mars/Jupiter nakshatras
    recommendations.colors.en = ["Red", "Yellow", "Gold"];
    recommendations.colors.ta = ["சிவப்பு", "மஞ்சள்", "தங்கம்"];
    recommendations.directions.favorable.en = ["South", "East"];
    recommendations.directions.favorable.ta = ["தெற்கு", "கிழக்கு"];
  } else if ([13, 14, 15, 16, 17, 18].includes(nakshatraIdNum)) {
    // Mercury/Rahu nakshatras
    recommendations.colors.en = ["Green", "Blue", "Purple"];
    recommendations.colors.ta = ["பச்சை", "நீலம்", "ஊதா"];
    recommendations.directions.favorable.en = ["North", "West"];
    recommendations.directions.favorable.ta = ["வடக்கு", "மேற்கு"];
  } else if ([19, 20, 21].includes(nakshatraIdNum)) {
    // Jupiter/Mercury nakshatras
    recommendations.colors.en = ["Yellow", "Orange", "Green"];
    recommendations.colors.ta = ["மஞ்சள்", "ஆரஞ்சு", "பச்சை"];
    recommendations.directions.favorable.en = ["Northeast", "East"];
    recommendations.directions.favorable.ta = ["வடகிழக்கு", "கிழக்கு"];
  } else {
    // Fallback for any invalid nakshatra ID
    recommendations.colors.en = ["Blue", "White", "Yellow"];
    recommendations.colors.ta = ["நீலம்", "வெள்ளை", "மஞ்சள்"];
    recommendations.directions.favorable.en = ["East", "North"];
    recommendations.directions.favorable.ta = ["கிழக்கு", "வடக்கு"];
  }
  
  // Add unfavorable directions (opposite to favorable)
  if (recommendations.directions.favorable.en.includes("North")) {
    recommendations.directions.unfavorable.en.push("South");
    recommendations.directions.unfavorable.ta.push("தெற்கு");
  } else if (recommendations.directions.favorable.en.includes("South")) {
    recommendations.directions.unfavorable.en.push("North");
    recommendations.directions.unfavorable.ta.push("வடக்கு");
  }
  
  if (recommendations.directions.favorable.en.includes("East")) {
    recommendations.directions.unfavorable.en.push("West");
    recommendations.directions.unfavorable.ta.push("மேற்கு");
  } else if (recommendations.directions.favorable.en.includes("West")) {
    recommendations.directions.unfavorable.en.push("East");
    recommendations.directions.unfavorable.ta.push("கிழக்கு");
  }
  
  return recommendations;
}