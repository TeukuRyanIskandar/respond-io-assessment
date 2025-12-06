import { createApp } from 'vue'
import App from './App.vue'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

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
