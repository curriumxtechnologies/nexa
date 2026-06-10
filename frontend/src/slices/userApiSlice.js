import { apiSlice } from './apiSlice.js';

const USER_URL = '/users';

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Profile endpoints
        getProfile: builder.query({
            query: () => ({
                url: `${USER_URL}/profile`,
                method: 'GET',
            }),
            providesTags: ['User'],
        }),

        updateProfile: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/profile`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        changePassword: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/change-password`,
                method: 'PUT',
                body: data,
            }),
        }),

        toggleTwoFactor: builder.mutation({  // Renamed from toggleUser2FA to match backend
            query: (data) => ({
                url: `${USER_URL}/toggle-2fa`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        deleteAccount: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/account`,
                method: 'DELETE',
                body: data,
            }),
        }),
    }),
});

// Export hooks
export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useToggleTwoFactorMutation,  // Updated name
    useDeleteAccountMutation,
} = userApiSlice;