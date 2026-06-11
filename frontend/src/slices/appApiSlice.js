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