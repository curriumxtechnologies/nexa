// slices/appApiSlice.js
import { apiSlice } from './apiSlice.js';

const APP_URL = '/app';

// Same base URL construction as apiSlice.js — kept in sync so this
// always points at the same host as the rest of the app's API calls.
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://nexa-tq69.onrender.com'}/api`;

export const appApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Check for app updates - now accepts token for version tracking
        checkAppUpdate: builder.query({
            query: ({ platform = 'android', currentVersion, token }) => {
                let url = `${APP_URL}/version?platform=${platform}`;
                if (currentVersion) {
                    url += `&currentVersion=${currentVersion}`;
                }
                if (token) {
                    url += `&token=${token}`;
                }
                return {
                    url,
                    method: 'GET',
                };
            },
        }),
        
        // Get details for a single version — used by the public
        // download landing page (AppDownload.jsx)
        getAppVersionById: builder.query({
            query: (versionId) => ({
                url: `${APP_URL}/version/${versionId}`,
                method: 'GET',
            }),
        }),
        
        // Update user's app version after download
        updateUserAppVersion: builder.mutation({
            query: ({ token, version }) => ({
                url: `${APP_URL}/update-version`,
                method: 'POST',
                body: { token, version },
            }),
        }),
    }),
});

// Export hooks
export const {
    useCheckAppUpdateQuery,
    useGetAppVersionByIdQuery,
    useUpdateUserAppVersionMutation,
} = appApiSlice;

// Builds the absolute download URL for a given app version.
// Now includes token parameter for version tracking
export const getAppDownloadUrl = (versionId, token = null) => {
    let url = `${API_BASE_URL}${APP_URL}/download/${versionId}`;
    if (token) {
        url += `?token=${token}`;
    }
    return url;
};