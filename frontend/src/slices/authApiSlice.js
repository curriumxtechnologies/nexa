import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register user
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Verify email OTP
    verifyEmail: builder.mutation({
      query: (verificationData) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: verificationData,
      }),
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
    }),

    // Verify 2FA OTP
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

    // Toggle 2FA (protected route)
    toggle2FA: builder.mutation({
      query: (toggleData) => ({
        url: '/auth/toggle-2fa',
        method: 'POST',
        body: toggleData,
      }),
    }),

    // Get user profile (protected route)
    getProfile: builder.query({
      query: () => '/auth/profile',
    }),
  }),
});

// Export hooks for usage in components
export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLoginMutation,
  useVerify2FAMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useToggle2FAMutation,
  useGetProfileQuery,
} = authApiSlice;