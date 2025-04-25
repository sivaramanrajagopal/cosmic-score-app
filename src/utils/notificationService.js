// src/utils/notificationService.js
import { getPanchangData } from '../services/panchangService';

// Request notification permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }
  
  const permission = await Notification.requestPermission();
  console.log("Notification permission:", permission);
  return permission === "granted";
}

// Schedule a notification for the next 6 AM
export function scheduleDailyNotification() {
  // Calculate time until next 6 AM
  const now = new Date();
  const nextNotification = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getHours() >= 6 ? now.getDate() + 1 : now.getDate(),
    6, 0, 0
  );
  
  const timeUntilNotification = nextNotification - now;
  console.log(`Scheduling next notification for ${nextNotification.toLocaleString()} (${timeUntilNotification/1000/60} minutes from now)`);
  
  // Set timeout for the next notification
  setTimeout(() => {
    sendCosmicScoreNotification();
    // And reschedule for next day
    scheduleDailyNotification();
  }, timeUntilNotification);
  
  // Store next notification time in localStorage
  localStorage.setItem('nextNotificationTime', nextNotification.toISOString());
}

// Send the actual notification
export async function sendCosmicScoreNotification() {
  try {
    // Check if we have permission
    if (Notification.permission !== "granted") {
      console.log("No notification permission");
      return;
    }
    
    // Get today's cosmic score
    const today = new Date();
    const panchangData = await getPanchangData(today);
    
    // Get user's nakshatra
    const userNakshatra = localStorage.getItem('userNakshatra');
    let userNakshatraName = '';
    if (userNakshatra) {
      const nakshatra = JSON.parse(userNakshatra);
      userNakshatraName = nakshatra.name;
    }
    
    // Create notification
    const notification = new Notification("Today's Cosmic Score", {
      body: `Today's cosmic score is ${panchangData.cosmic_score}/10.${userNakshatraName ? ` Check your personal score for ${userNakshatraName}.` : ''}`,
      icon: "/favicon.ico"
    });
    
    // Handle notification click
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
    
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Initialize notifications (call this when your app starts)
export function initializeNotifications() {
  // First request permission
  requestNotificationPermission().then(granted => {
    if (granted) {
      // Check if we should schedule a new notification
      const nextNotificationTime = localStorage.getItem('nextNotificationTime');
      const now = new Date();
      
      if (!nextNotificationTime || new Date(nextNotificationTime) <= now) {
        // Either no scheduled notification or it's in the past, schedule a new one
        scheduleDailyNotification();
      } else {
        // Already scheduled, calculate time remaining
        const timeRemaining = new Date(nextNotificationTime) - now;
        
        // If it's too far in the future (more than 24h), reschedule
        if (timeRemaining > 24 * 60 * 60 * 1000 || timeRemaining < 0) {
          scheduleDailyNotification();
        } else {
          // Otherwise use the existing schedule
          setTimeout(() => {
            sendCosmicScoreNotification();
            scheduleDailyNotification();
          }, timeRemaining);
        }
      }
    }
  });
}