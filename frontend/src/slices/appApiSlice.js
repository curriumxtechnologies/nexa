// slices/appApiSlice.js
import { apiSlice } from './apiSlice.js';

const APP_URL = '/app';

// Same base URL construction as apiSlice.js — kept in sync so this
// always points at the same host as the rest of the app's API calls.
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://nexa-tq69.onrender.com'}/api`;

export const appApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Check for app updates (public - no auth needed)
        checkAppUpdate: builder.query({
            query: ({ platform = 'android', currentVersion }) => ({
                url: `${APP_URL}/version?platform=${platform}&currentVersion=${currentVersion || ''}`,
                method: 'GET',
            }),
        }),
        // Get details for a single version — used by the public
        // download landing page (AppDownload.jsx)
        getAppVersionById: builder.query({
            query: (versionId) => ({
                url: `${APP_URL}/version/${versionId}`,
                method: 'GET',
            }),
        }),
    }),
});

// Export hooks
export const {
    useCheckAppUpdateQuery,
    useGetAppVersionByIdQuery,
} = appApiSlice;

// Builds the absolute download URL for a given app version.
// Used directly with window.open() since this is a raw file download,
// not a typed RTK Query call.
export const getAppDownloadUrl = (versionId) => {
    return `${API_BASE_URL}${APP_URL}/download/${versionId}`;
};