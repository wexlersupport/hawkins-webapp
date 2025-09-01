// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui-pro',
    '@vueuse/nuxt',
    '@formkit/nuxt',
    'nuxt-pdfmake',
  ],
  vite: {
    resolve: {
      alias: {
        "pdfjs-dist/build/pdf.worker.mjs": "pdfjs-dist/build/pdf.worker.mjs",
      },
    },
  },
  pdfmake: {
    enabled: true, // Enable the module
    enableComposable: true, // Enable usePDFMake and useFontPresets composables
    enableDevtools: true, // Enable the devtools tab
  },

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
      openrouterApiKey: process.env.NUXT_PUBLIC_OPENROUTER_API_KEY,
    },
  }
})
