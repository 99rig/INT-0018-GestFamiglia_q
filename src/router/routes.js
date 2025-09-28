const routes = [
  // Landing pages Vue (per riferimento sviluppo)
  {
    path: '/landing-vue',
    component: () => import('layouts/LandingLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LandingPage.vue') }
    ]
  },

  {
    path: '/landing2-vue',
    component: () => import('layouts/LandingLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LandingPage2.vue') }
    ]
  },

  // Login route (no layout) - for Vue.js app
  {
    path: '/login',
    component: () => import('pages/users/LoginPage.vue')
  },

  // Register route (no layout) - for Vue.js app
  {
    path: '/register',
    component: () => import('pages/users/RegisterPage.vue')
  },

  // Forgot password route (no layout)
  {
    path: '/forgot-password',
    component: () => import('pages/users/ForgotPasswordPage.vue')
  },

  // Reset password route (no layout)
  {
    path: '/reset-password',
    component: () => import('pages/users/ResetPasswordPage.vue')
  },

  // Main app routes (with layout)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      { path: '/dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: '/expenses', component: () => import('pages/expenses/ExpensesPage.vue') },
      { path: '/expenses/add', component: () => import('pages/expenses/ExpensesPage.vue') },
      { path: '/budget', component: () => import('pages/reports/SpendingPlanPage.vue') },
      { path: '/spending-plans', component: () => import('pages/reports/SpendingPlanPage.vue') },
      { path: '/spending-plans/:id', component: () => import('pages/reports/PlannedExpenseDetailPage.vue') },
      { path: '/scanner', component: () => import('pages/expenses/ScannerPage.vue') },
      { path: '/ocr-test', component: () => import('pages/expenses/OCRTestPage.vue') },
      { path: '/settings', component: () => import('pages/users/SettingsPage.vue') },
      { path: '/help', component: () => import('pages/HelpPage.vue') }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
