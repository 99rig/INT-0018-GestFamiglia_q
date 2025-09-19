const routes = [
  // Landing page (no layout)
  {
    path: '/',
    component: () => import('pages/LandingPage.vue')
  },

  // Login route (no layout)
  {
    path: '/login',
    component: () => import('pages/users/LoginPage.vue')
  },

  // Register route (no layout)
  {
    path: '/register',
    component: () => import('pages/users/RegisterPage.vue')
  },

  // Main app routes (with layout)
  {
    path: '/app',
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
