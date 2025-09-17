const routes = [
  // Login route (no layout)
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },

  // Main app routes (with layout)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: '/dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: '/expenses', component: () => import('pages/ExpensesPage.vue') },
      { path: '/expenses/add', component: () => import('pages/ExpensesPage.vue') },
      { path: '/budget', component: () => import('pages/SpendingPlanPage.vue') },
      { path: '/spending-plans', component: () => import('pages/SpendingPlanPage.vue') },
      { path: '/scanner', component: () => import('pages/ScannerPage.vue') },
      { path: '/ocr-test', component: () => import('pages/OCRTestPage.vue') },
      { path: '/settings', component: () => import('pages/SettingsPage.vue') },
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
