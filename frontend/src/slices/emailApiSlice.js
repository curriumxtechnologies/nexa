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

        getResendConfigById: builder.query({
            query: (configId) => ({
                url: `${EMAIL_URL}/resend/config/${configId}`,
                method: 'GET',
            }),
            providesTags: ['ResendConfig'],
        }),

        updateResendConfig: builder.mutation({
            query: ({ configId, data }) => ({
                url: `${EMAIL_URL}/resend/config/${configId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['ResendConfig'],
        }),

        deleteResendConfig: builder.mutation({
            query: (configId) => ({
                url: `${EMAIL_URL}/resend/config/${configId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ResendConfig', 'Domain', 'CustomEmail'],
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

        updateWebhookSecret: builder.mutation({
            query: ({ resendConfigId, data }) => ({
                url: `${EMAIL_URL}/webhook/secret/${resendConfigId}`,
                method: 'PUT',
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

        deleteWebhookSecret: builder.mutation({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/webhook/secret/${resendConfigId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ResendConfig'],
        }),

        testWebhookConfig: builder.mutation({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/webhook/test/${resendConfigId}`,
                method: 'POST',
            }),
            invalidatesTags: ['ResendConfig'],
        }),

        getDomainStatus: builder.query({
            query: (configId) => ({
                url: `${EMAIL_URL}/domain/status/${configId}`,
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
            invalidatesTags: ['CustomEmail', 'EmailStats'],
        }),

        getCustomEmails: builder.query({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/custom-emails${resendConfigId ? `?resendConfigId=${resendConfigId}` : ''}`,
                method: 'GET',
            }),
            providesTags: ['CustomEmail'],
        }),

        updateCustomEmail: builder.mutation({
            query: ({ emailId, data }) => ({
                url: `${EMAIL_URL}/custom-emails/${emailId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['CustomEmail'],
        }),

        deleteCustomEmail: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/custom-emails/${emailId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CustomEmail', 'EmailStats'],
        }),

        // Team Access
        inviteUserToDomain: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/team/invite`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TeamAccess'],
        }),

        acceptInvitation: builder.mutation({
            query: (token) => ({
                url: `${EMAIL_URL}/team/accept/${token}`,
                method: 'POST',
            }),
            invalidatesTags: ['TeamAccess', 'CustomEmail', 'Domain'],
        }),

        declineInvitation: builder.mutation({
            query: (token) => ({
                url: `${EMAIL_URL}/team/decline/${token}`,
                method: 'POST',
            }),
            invalidatesTags: ['TeamAccess'],
        }),

        resendInvitation: builder.mutation({
            query: (accessId) => ({
                url: `${EMAIL_URL}/team/resend/${accessId}`,
                method: 'POST',
            }),
            invalidatesTags: ['TeamAccess'],
        }),

        getDomainAccessUsers: builder.query({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/team/access/${resendConfigId}`,
                method: 'GET',
            }),
            providesTags: ['TeamAccess'],
        }),

        updateUserAccess: builder.mutation({
            query: ({ accessId, data }) => ({
                url: `${EMAIL_URL}/team/access/${accessId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['TeamAccess'],
        }),

        revokeUserAccess: builder.mutation({
            query: (accessId) => ({
                url: `${EMAIL_URL}/team/access/${accessId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TeamAccess', 'CustomEmail'],
        }),

        getAccessibleDomains: builder.query({
            query: () => ({
                url: `${EMAIL_URL}/team/my-domains`,
                method: 'GET',
            }),
            providesTags: ['TeamAccess', 'Domain'],
        }),

        getPendingInvitations: builder.query({
            query: () => ({
                url: `${EMAIL_URL}/team/pending-invites`,
                method: 'GET',
            }),
            providesTags: ['TeamAccess'],
        }),

        getTeamMembers: builder.query({
            query: (resendConfigId) => ({
                url: `${EMAIL_URL}/team/members/${resendConfigId}`,
                method: 'GET',
            }),
            providesTags: ['TeamAccess'],
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
                url: `${EMAIL_URL}/${emailId}`,
                method: 'GET',
            }),
            providesTags: (result, error, emailId) => [{ type: 'Email', id: emailId }],
        }),

        // Single Email Actions
        markAsRead: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/${emailId}/read`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
                'EmailStats',
            ],
        }),

        markAsUnread: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/${emailId}/unread`,
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
                url: `${EMAIL_URL}/${emailId}/star`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
            ],
        }),

        toggleArchive: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/${emailId}/archive`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
            ],
        }),

        deleteEmail: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/${emailId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
                'SentEmails',
                'EmailStats',
            ],
        }),

        restoreEmail: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/${emailId}/restore`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
                'EmailStats',
            ],
        }),

        permanentlyDeleteEmail: builder.mutation({
            query: (emailId) => ({
                url: `${EMAIL_URL}/${emailId}/permanent`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, emailId) => [
                { type: 'Email', id: emailId },
                'Inbox',
                'SentEmails',
                'EmailStats',
            ],
        }),

        // Bulk Email Actions
        bulkMarkAsRead: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/bulk/read`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Inbox', 'EmailStats'],
        }),

        bulkMoveToTrash: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/bulk/trash`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Inbox', 'EmailStats'],
        }),

        bulkRestoreFromTrash: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/bulk/restore`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Inbox', 'EmailStats'],
        }),

        bulkToggleStar: builder.mutation({
            query: (data) => ({
                url: `${EMAIL_URL}/bulk/star`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Inbox'],
        }),

        emptyTrash: builder.mutation({
            query: () => ({
                url: `${EMAIL_URL}/trash/empty`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Inbox', 'EmailStats'],
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
    // Resend Configuration
    useAddResendConfigMutation,
    useGetResendConfigsQuery,
    useGetResendConfigByIdQuery,
    useUpdateResendConfigMutation,
    useDeleteResendConfigMutation,
    
    // Webhook Management
    useAddWebhookSecretMutation,
    useUpdateWebhookSecretMutation,
    useGetWebhookConfigQuery,
    useDeleteWebhookSecretMutation,
    useTestWebhookConfigMutation,
    useGetDomainStatusQuery,
    
    // Custom Email Management
    useCreateCustomEmailMutation,
    useGetCustomEmailsQuery,
    useUpdateCustomEmailMutation,
    useDeleteCustomEmailMutation,
    
    // Team Access
    useInviteUserToDomainMutation,
    useAcceptInvitationMutation,
    useDeclineInvitationMutation,
    useResendInvitationMutation,
    useGetDomainAccessUsersQuery,
    useUpdateUserAccessMutation,
    useRevokeUserAccessMutation,
    useGetAccessibleDomainsQuery,
    useGetPendingInvitationsQuery,
    useGetTeamMembersQuery,
    
    // Email Operations
    useSendEmailMutation,
    useGetInboxQuery,
    useGetSentEmailsQuery,
    useGetEmailByIdQuery,
    
    // Single Email Actions
    useMarkAsReadMutation,
    useMarkAsUnreadMutation,
    useToggleStarMutation,
    useToggleArchiveMutation,
    useDeleteEmailMutation,
    useRestoreEmailMutation,
    usePermanentlyDeleteEmailMutation,
    
    // Bulk Email Actions
    useBulkMarkAsReadMutation,
    useBulkMoveToTrashMutation,
    useBulkRestoreFromTrashMutation,
    useBulkToggleStarMutation,
    useEmptyTrashMutation,
    
    // Stats
    useGetEmailStatsQuery,
} = emailApiSlice;