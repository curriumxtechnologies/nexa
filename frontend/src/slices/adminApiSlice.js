// slices/adminApiSlice.js
import { apiSlice } from './apiSlice.js';

const ADMIN_URL = '/admin';

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ==================== USER MANAGEMENT ====================
        
        // Get all users (admin & super_admin)
        getUsers: builder.query({
            query: ({ page = 1, limit = 20, search = '', role = '' }) => ({
                url: `${ADMIN_URL}/users?page=${page}&limit=${limit}&search=${search}&role=${role}`,
                method: 'GET',
            }),
            providesTags: ['AdminUsers'],
        }),

        // Get single user by ID
        getUserById: builder.query({
            query: (userId) => ({
                url: `${ADMIN_URL}/users/${userId}`,
                method: 'GET',
            }),
            providesTags: (result, error, userId) => [{ type: 'AdminUser', id: userId }],
        }),

        // Get all admins (super_admin only)
        getAdmins: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/admins`,
                method: 'GET',
            }),
            providesTags: ['AdminUsers'],
        }),

        // Assign role to user (super_admin only)
        assignRole: builder.mutation({
            query: ({ userId, role }) => ({
                url: `${ADMIN_URL}/users/${userId}/role`,
                method: 'PUT',
                body: { role },
            }),
            invalidatesTags: ['AdminUsers', 'AdminUser'],
        }),

        // Delete user (admin & super_admin)
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `${ADMIN_URL}/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminUsers'],
        }),

        // ==================== EMAIL STATISTICS ====================
        
        // Get email statistics for all users
        getEmailStats: builder.query({
            query: ({ startDate, endDate } = {}) => ({
                url: `${ADMIN_URL}/stats/emails${startDate || endDate ? `?startDate=${startDate || ''}&endDate=${endDate || ''}` : ''}`,
                method: 'GET',
            }),
            providesTags: ['AdminStats'],
        }),

        // ==================== APP VERSION MANAGEMENT ====================
        
        // Get all app versions (public - no auth needed for checking updates)
        getAppVersions: builder.query({
            query: ({ platform = 'android' } = {}) => ({
                url: `${ADMIN_URL}/app/versions?platform=${platform}`,
                method: 'GET',
            }),
            providesTags: ['AppVersions'],
        }),

        // Upload new app version (admin & super_admin)
        uploadApp: builder.mutation({
            query: (formData) => ({
                url: `${ADMIN_URL}/app/upload`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['AppVersions'],
        }),

        // Update app version (admin & super_admin)
        updateApp: builder.mutation({
            query: ({ versionId, data }) => ({
                url: `${ADMIN_URL}/app/update/${versionId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['AppVersions'],
        }),

        // Delete app version (admin & super_admin)
        deleteApp: builder.mutation({
            query: (versionId) => ({
                url: `${ADMIN_URL}/app/delete/${versionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AppVersions'],
        }),
    }),
});

// Export hooks
export const {
    // User management
    useGetUsersQuery,
    useGetUserByIdQuery,
    useGetAdminsQuery,
    useAssignRoleMutation,
    useDeleteUserMutation,
    
    // Email statistics
    useGetEmailStatsQuery,
    
    // App management
    useGetAppVersionsQuery,
    useUploadAppMutation,
    useUpdateAppMutation,
    useDeleteAppMutation,
} = adminApiSlice;