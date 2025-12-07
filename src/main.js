import { createApp } from 'vue'
import App from './App.vue'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      networkMode: 'always',
      staleTime: Infinity,
      gcTime: 60 * 60 * 1000,
    },
  },
})

const pinia = createPinia()

createApp(App)
  .use(VueQueryPlugin, { queryClient })
  .use(pinia)
  .mount('#app')
