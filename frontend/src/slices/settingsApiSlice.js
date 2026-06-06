import { apiSlice } from './apiSlice.js';

const SETTINGS_URL = '/settings';

export const settingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get user settings
        getSettings: builder.query({
            query: () => ({
                url: `${SETTINGS_URL}`,
                method: 'GET',
            }),
            providesTags: ['Settings'],
        }),

        // Update all settings
        updateSettings: builder.mutation({
            query: (data) => ({
                url: `${SETTINGS_URL}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),

        // Update email signature
        updateEmailSignature: builder.mutation({
            query: (data) => ({
                url: `${SETTINGS_URL}/email-signature`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),

        // Toggle dark mode
        toggleDarkMode: builder.mutation({
            query: (data) => ({
                url: `${SETTINGS_URL}/dark-mode`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),
    }),
});

// Export hooks
export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useUpdateEmailSignatureMutation,
    useToggleDarkModeMutation,
} = settingsApiSlice;