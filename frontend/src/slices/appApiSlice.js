// slices/appApiSlice.js
import { apiSlice } from './apiSlice.js';

const APP_URL = '/app';

export const appApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Check for app updates (public - no auth needed)
        checkAppUpdate: builder.query({
            query: ({ platform = 'android', currentVersion }) => ({
                url: `${APP_URL}/version?platform=${platform}&currentVersion=${currentVersion || ''}`,
                method: 'GET',
            }),
        }),
    }),
});

// Export hooks
export const {
    useCheckAppUpdateQuery,
} = appApiSlice;

// Resolves the base API URL the same way apiSlice does, so the download
// link always matches whatever environment (dev/staging/prod) the app
// is actually pointed at — instead of hardcoding or guessing an env var.
//
// RTK Query doesn't expose baseUrl the same way across setups, so this
// tries the common shapes in order and falls back to relative path
// (which works fine if your frontend and API are served from the same
// origin, e.g. behind one domain/proxy).
const resolveBaseUrl = () => {
    const bq = apiSlice?.util?.getRunningQueriesThunk ? apiSlice : null;

    // Most common: baseQuery is fetchBaseQuery, which stores its config
    // in a closure — not directly readable. So instead we check if you
    // exported the raw base URL string separately from apiSlice.js.
    if (typeof apiSlice.baseUrl === 'string') {
        return apiSlice.baseUrl;
    }
    if (typeof apiSlice.reducerPath === 'string' && typeof window !== 'undefined' && window.__API_BASE_URL__) {
        return window.__API_BASE_URL__;
    }

    // Fallback: relative path, works if frontend + API share origin
    return '';
};

// Builds the absolute (or relative) download URL for a given app version.
// Used directly with window.open() since this is a raw file download,
// not a typed RTK Query call.
export const getAppDownloadUrl = (versionId) => {
    const baseUrl = resolveBaseUrl();
    return `${baseUrl}${APP_URL}/download/${versionId}`;
};