import { apiSlice } from './apiSlice.js';

const EMAIL_URL = '/email';

export const emailApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Resend Configuration
        addResendConfig: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/resend/config`,
                method: 'POST',
                body: data,
            }),
        }),

        getResendConfigs: builder.query({
            query: () => ({
                url: `${EMAIL_URL}/resend/configs`,
                method: 'GET',
            }),
        }),

        verifyDomain: builder.mutation({
            query: (token) => ({
                url: `${EMAIL_URL}/verify-domain/${token}`,
                method: 'GET',
            }),
        }),

        // Custom Email Management
        createCustomEmail: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/custom-emails`,
                method: 'POST',
                body: data,
            }),
        }),

        getCustomEmails: builder.query({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/custom-emails${resendConfigId ? `?resendConfigId=${resendConfigId}` : ''}`,
                method: 'GET',
            }),
        }),

        // Team Access
        inviteUserToDomain: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/invite`,
                method: 'POST',
                body: data,
            }),
        }),

        acceptInvitation: builder.mutation({
            query: (token) => ({
                url: `${EMAIL_URL}/accept-invitation/${token}`,
                method: 'POST',
            }),
        }),

        getDomainAccessUsers: builder.query({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/domain-access/${resendConfigId}`,
                method: 'GET',
            }),
        }),

        updateUserAccess: builder.mutation({
            query: ({ accessId, data }) => ({
                url: `${EMAIL_URL}/access/${accessId}`,
                method: 'PUT',
                body: data,
            }),
        }),

        revokeUserAccess: builder.mutation({
            query: (accessId) => ({
                url: `${EMAIL_URL}/access/${accessId}`,
                method: 'DELETE',
            }),
        }),

        getAccessibleDomains: builder.query({
            query: () => ({
                url: `${EMAIL_URL}/accessible-domains`,
                method: 'GET',
            }),
        }),

        // Email Operations
        sendEmail: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/send`,
                method: 'POST',
                body: data,
            }),
        }),

        getInbox: builder.query({
            query: ({ page = 1, limit = 20, folder = 'inbox' }) => ({
                url: `${EMAIL_URL}/inbox?page=${page}&limit=${limit}&folder=${folder}`,
                method: 'GET',
            }),
        }),

        getSentEmails: builder.query({
            query: ({ page = 1, limit = 20 }) => ({
                url: `${EMAIL_URL}/sent?page=${page}&limit=${limit}`,
                method: 'GET',
            }),
        }),

        getEmailById: builder.query({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}`,
                method: 'GET',
            }),
        }),

        markAsRead: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}/read`,
                method: 'PUT',
            }),
        }),

        toggleStar: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}/star`,
                method: 'PUT',
            }),
        }),

        toggleArchive: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}/archive`,
                method: 'PUT',
            }),
        }),

        deleteEmail: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}`,
                method: 'DELETE',
            }),
        }),

        getEmailStats: builder.query({
            query: () => ({
                url: `${EMAIL_URL}/stats`,
                method: 'GET',
            }),
        }),
    }),
});

// Export hooks for usage in components
export const {
    useAddResendConfigMutation,
    useGetResendConfigsQuery,
    useVerifyDomainMutation,
    useCreateCustomEmailMutation,
    useGetCustomEmailsQuery,
    useInviteUserToDomainMutation,
    useAcceptInvitationMutation,
    useGetDomainAccessUsersQuery,
    useUpdateUserAccessMutation,
    useRevokeUserAccessMutation,
    useGetAccessibleDomainsQuery,
    useSendEmailMutation,
    useGetInboxQuery,
    useGetSentEmailsQuery,
    useGetEmailByIdQuery,
    useMarkAsReadMutation,
    useToggleStarMutation,
    useToggleArchiveMutation,
    useDeleteEmailMutation,
    useGetEmailStatsQuery,
} = emailApiSlice;