// src/hooks/useMobilePushNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { useRegisterMobileTokenMutation } from '../slices/notificationsApiSlice';

export const useMobilePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');
  
  const [registerMobileToken] = useRegisterMobileTokenMutation();

  // Check if running on Capacitor (mobile)
  useEffect(() => {
    const isMobile = !!(window.Capacitor && window.Capacitor.isNativePlatform());
    setIsSupported(isMobile);

    if (isMobile) {
      checkExistingToken();
    }
  }, []);

  // Check if we already have a token stored
  const checkExistingToken = useCallback(() => {
    const storedToken = localStorage.getItem('fcmToken');
    if (storedToken) {
      setFcmToken(storedToken);
      setIsSubscribed(true);
      setPermission('granted');
    }
  }, []);

  // Request permission and register for push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      console.log('Not running on mobile device');
      return false;
    }

    try {
      // Dynamically import Capacitor modules
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        // Request permission (iOS only, Android auto-grants)
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        setPermission('denied');
        return false;
      }
      
      setPermission('granted');

      // Register with FCM
      await PushNotifications.register();

      // Listen for the FCM token
      const registrationListener = await PushNotifications.addListener(
        'registration',
        async (token) => {
          console.log('📱 FCM Token received:', token.value);
          setFcmToken(token.value);
          
          // Save token locally
          localStorage.setItem('fcmToken', token.value);
          
          // Send to backend
          try {
            await registerMobileToken({
              fcmToken: token.value,
              deviceType: 'android',
              platform: 'capacitor'
            }).unwrap();
            setIsSubscribed(true);
          } catch (error) {
            console.error('Failed to send token to backend:', error);
          }
          
          // Clean up listener after token is received
          registrationListener.remove();
        }
      );

      // Handle registration errors
      const errorListener = await PushNotifications.addListener(
        'registrationError',
        (error) => {
          console.error('FCM registration error:', error);
          setIsSubscribed(false);
          errorListener.remove();
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to subscribe to mobile push:', error);
      return false;
    }
  }, [isSupported, registerMobileToken]);

  // Unsubscribe (remove token from backend)
  const unsubscribe = useCallback(async () => {
    if (!isSupported || !fcmToken) return false;

    try {
      // Call backend to remove the token
      await registerMobileToken({
        fcmToken,
        deviceType: 'android',
        action: 'unsubscribe'
      }).unwrap();
      
      // Clear local storage
      localStorage.removeItem('fcmToken');
      setFcmToken(null);
      setIsSubscribed(false);
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }, [isSupported, fcmToken, registerMobileToken]);

  return {
    isSupported,
    isSubscribed,
    fcmToken,
    permission,
    subscribe,
    unsubscribe,
  };
};