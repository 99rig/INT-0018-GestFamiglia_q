import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Route guard per autenticazione
  Router.beforeEach(async (to, from, next) => {
    console.log(`🛣️ Router guard: ${from.path} → ${to.path}`)

    // Pagine pubbliche che non richiedono autenticazione
    const publicPages = ['/login', '/register', '/landing-vue', '/landing2-vue', '/forgot-password', '/reset-password']
    const requiresAuth = !publicPages.includes(to.path)

    if (!requiresAuth) {
      console.log('📖 Public page, skipping auth check')
      return next()
    }

    try {
      // Importa dinamicamente il store per evitare circular imports
      const { useAuthStore } = await import('../stores/auth.js')
      const authStore = useAuthStore()

      console.log('🔍 Auth guard check:', {
        isInitialized: authStore.isInitialized,
        isAuthenticated: authStore.isAuthenticated,
        hasToken: !!authStore.accessToken,
        hasUser: !!authStore.user
      })

      // Aspetta che l'auth store sia inizializzato
      if (!authStore.isInitialized) {
        console.log('⏳ Store not initialized, initializing...')
        await authStore.initialize()
        console.log('✅ Store initialized:', {
          isAuthenticated: authStore.isAuthenticated,
          hasToken: !!authStore.accessToken
        })
      }

      // Controlla se l'utente è autenticato
      if (!authStore.isAuthenticated) {
        console.log('❌ User not authenticated, redirecting to login')
        // Evita loop di redirect
        if (to.path !== '/login') {
          return next({ path: '/login', replace: true })
        }
        return next()
      }

      // Utente autenticato, procedi
      console.log('✅ User authenticated, proceeding to', to.path)
      next()
    } catch (error) {
      console.error('❌ Authentication check failed:', error)
      // Evita loop di redirect
      if (to.path !== '/login') {
        next({ path: '/login', replace: true })
      } else {
        next()
      }
    }
  })

  return Router
})
