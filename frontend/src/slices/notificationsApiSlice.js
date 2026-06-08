import { apiSlice } from './apiSlice.js';

const NOTIFICATIONS_URL = '/notifications';

export const notificationsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get notification preferences
        getNotificationPreferences: builder.query({
            query: () => ({
                url: `${NOTIFICATIONS_URL}/preferences`,
                method: 'GET',
            }),
            providesTags: ['NotificationPreferences'],
        }),

        // Update email notification preferences
        updateEmailNotifications: builder.mutation({
            query: (data) => ({
                url: `${NOTIFICATIONS_URL}/email`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['NotificationPreferences'],
        }),

        // Update push notification preferences
        updatePushNotifications: builder.mutation({
            query: (data) => ({
                url: `${NOTIFICATIONS_URL}/push`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['NotificationPreferences'],
        }),

        // Register web push subscription
        registerPushSubscription: builder.mutation({
            query: (data) => ({
                url: `${NOTIFICATIONS_URL}/push-subscription`,
                method: 'POST',
                body: data,
            }),
        }),

        // Register mobile push token (Android/iOS via Capacitor)
        registerMobileToken: builder.mutation({
            query: (data) => ({
                url: `${NOTIFICATIONS_URL}/register-token`,
                method: 'POST',
                body: data,
            }),
        }),

        // Send test push notification
        sendTestPush: builder.mutation({
            query: () => ({
                url: `${NOTIFICATIONS_URL}/test-push`,
                method: 'POST',
            }),
        }),

        // Send test email notification
        sendTestEmail: builder.mutation({
            query: () => ({
                url: `${NOTIFICATIONS_URL}/test-email`,
                method: 'POST',
            }),
        }),

        // Get VAPID public key (for web push)
        getVapidPublicKey: builder.query({
            query: () => ({
                url: `${NOTIFICATIONS_URL}/vapid-public-key`,
                method: 'GET',
            }),
        }),
    }),
});

// Export hooks
export const {
    useGetNotificationPreferencesQuery,
    useUpdateEmailNotificationsMutation,
    useUpdatePushNotificationsMutation,
    useRegisterPushSubscriptionMutation,
    useRegisterMobileTokenMutation,  // ← Added this
    useSendTestPushMutation,
    useSendTestEmailMutation,
    useGetVapidPublicKeyQuery,
} = notificationsApiSlice;