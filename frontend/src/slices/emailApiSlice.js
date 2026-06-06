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
            invalidatesTags: ['ResendConfig', 'Domain'],
        }),

        getResendConfigs: builder.query({
            query: () => ({
                url: `${EMAIL_URL}/resend/configs`,
                method: 'GET',
            }),
            providesTags: ['ResendConfig'],
        }),

        // Webhook Management
        addWebhookSecret: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/webhook/secret`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['ResendConfig'],
        }),

        getWebhookConfig: builder.query({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/webhook/secret/${resendConfigId}`,
                method: 'GET',
            }),
            providesTags: ['ResendConfig'],
        }),

        // Custom Email Management
        createCustomEmail: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/custom-emails`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['CustomEmail'],
        }),

        getCustomEmails: builder.query({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/custom-emails${resendConfigId ? `?resendConfigId=${resendConfigId}` : ''}`,
                method: 'GET',
            }),
            providesTags: ['CustomEmail'],
        }),

        // Team Access
        inviteUserToDomain: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/invite`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TeamAccess'],
        }),

        acceptInvitation: builder.mutation({
            query: (token) => ({
                url: `${EMAIL_URL}/accept-invitation/${token}`,
                method: 'POST',
            }),
            invalidatesTags: ['TeamAccess', 'CustomEmail'],
        }),

        getDomainAccessUsers: builder.query({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/domain-access/${resendConfigId}`,
                method: 'GET',
            }),
            providesTags: ['TeamAccess'],
        }),

        updateUserAccess: builder.mutation({
            query: ({ accessId, data }) => ({
                url: `${EMAIL_URL}/access/${accessId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['TeamAccess'],
        }),

        revokeUserAccess: builder.mutation({
            query: (accessId) => ({
                url: `${EMAIL_URL}/access/${accessId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TeamAccess'],
        }),

        getAccessibleDomains: builder.query({
            query: () => ({
                url: `${EMAIL_URL}/accessible-domains`,
                method: 'GET',
            }),
            providesTags: ['TeamAccess', 'Domain'],
        }),

        // Email Operations
        sendEmail: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/send`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['SentEmails', 'EmailStats'],
        }),

        getInbox: builder.query({
            query: ({ page = 1, limit = 20, folder = 'inbox' }) => ({
                url: `${EMAIL_URL}/inbox?page=${page}&limit=${limit}&folder=${folder}`,
                method: 'GET',
            }),
            providesTags: ['Inbox'],
        }),

        getSentEmails: builder.query({
            query: ({ page = 1, limit = 20 }) => ({
                url: `${EMAIL_URL}/sent?page=${page}&limit=${limit}`,
                method: 'GET',
            }),
            providesTags: ['SentEmails'],
        }),

        getEmailById: builder.query({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}`,
                method: 'GET',
            }),
            providesTags: (result, error, emailId) => [{ type: 'Email', id: emailId }],
        }),

        markAsRead: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}/read`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
                'EmailStats',
            ],
        }),

        toggleStar: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}/star`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
            ],
        }),

        toggleArchive: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}/archive`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
            ],
        }),

        // Move email to trash
        deleteEmail: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
                'SentEmails',
                'EmailStats',
            ],
        }),

        // Permanently delete email from trash
        permanentlyDeleteEmail: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}/permanent`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
                'SentEmails',
                'EmailStats',
            ],
        }),

        // Restore email from trash back to inbox
        restoreEmail: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/email/${emailId}/restore`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
                'SentEmails',
                'EmailStats',
            ],
        }),

        getEmailStats: builder.query({
            query: () => ({
                url: `${EMAIL_URL}/stats`,
                method: 'GET',
            }),
            providesTags: ['EmailStats'],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useAddResendConfigMutation,
    useGetResendConfigsQuery,
    useAddWebhookSecretMutation,
    useGetWebhookConfigQuery,
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
    usePermanentlyDeleteEmailMutation,
    useRestoreEmailMutation,
    useGetEmailStatsQuery,
} = emailApiSlice;