// src/hooks/usePushNotifications.js
import { useState, useEffect, useCallback } from 'react';
import {
  useGetVapidPublicKeyQuery,
  useRegisterPushSubscriptionMutation,
} from '../slices/notificationsApiSlice';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');

  const { data: vapidData } = useGetVapidPublicKeyQuery(undefined, {
    skip: !isSupported,
  });
  const [registerSubscription] = useRegisterPushSubscriptionMutation();

  // Check browser support
  useEffect(() => {
    const supported =
      'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  // Check if already subscribed
  const checkExistingSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        setSubscription(existingSub);
        setPermission('granted');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidData?.data?.publicKey) return false;

    try {
      // Request permission first
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(
        vapidData.data.publicKey
      );

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      setSubscription(newSubscription);

      // Send to server
      await registerSubscription({
        subscription: newSubscription.toJSON(),
        deviceType: 'web',
      }).unwrap();

      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  }, [isSupported, vapidData, registerSubscription]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setPermission(Notification.permission);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    isSubscribed: !!subscription,
    permission,
    subscription,
    subscribe,
    unsubscribe,
  };
};