import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC AUTH ROUTES ====================
    
    // Register user
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Verify email OTP
    verifyEmail: builder.mutation({
      query: (verificationData) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: verificationData,
      }),
      invalidatesTags: ['User'],
    }),

    // Resend verification OTP
    resendVerification: builder.mutation({
      query: (emailData) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: emailData,
      }),
    }),

    // Login user
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Verify 2FA OTP during login
    verify2FA: builder.mutation({
      query: (twoFAData) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body: twoFAData,
      }),
    }),

    // Forgot password - send OTP
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: emailData,
      }),
    }),

    // Reset password with OTP
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: resetData,
      }),
    }),

    // ==================== PROTECTED USER ROUTES (using userApiSlice instead) ====================
    // NOTE: toggle2FA and getProfile should be in userApiSlice, not authApiSlice
    // But keeping for backward compatibility - they will be deprecated
    toggle2FA: builder.mutation({
      query: (toggleData) => ({
        url: '/users/toggle-2fa',  // Changed from /auth/toggle-2fa to /users/toggle-2fa
        method: 'PUT',
        body: toggleData,
      }),
      invalidatesTags: ['User'],
    }),

    // Get user profile - should use userApiSlice
    getProfile: builder.query({
      query: () => '/users/profile',  // Changed from /auth/profile to /users/profile
      providesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Public auth hooks
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLoginMutation,
  useVerify2FAMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  
  // Protected user hooks (deprecated - use userApiSlice instead)
  useToggle2FAMutation,
  useGetProfileQuery,
} = authApiSlice;