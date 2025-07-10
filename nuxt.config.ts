// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui-pro',
    '@vueuse/nuxt',
    '@formkit/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-11',

  formkit: {
    // Experimental support for auto loading (see note):
    autoImport: true
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    public: {
      vistaApiUrl: process.env.NUXT_PUBLIC_VISTA_API_URL,
      vistaApiKey: process.env.NUXT_PUBLIC_VISTA_API_KEY,
      vistaSubscriptionCode: process.env.NUXT_PUBLIC_VISTA_SUBSCRIPTION_CODE,
      sendgridApiKey: process.env.NUXT_PUBLIC_SENDGRID_API_KEY,
    },
  }
})
