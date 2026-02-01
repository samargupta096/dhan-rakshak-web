import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { title: 'Login' }
        },
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/views/DashboardView.vue'),
            meta: { title: 'Dashboard' }
        },
        {
            path: '/portfolio',
            name: 'portfolio',
            component: () => import('@/views/PortfolioView.vue'),
            meta: { title: 'Portfolio' }
        },
        {
            path: '/transactions',
            name: 'transactions',
            component: () => import('@/views/TransactionsView.vue'),
            meta: { title: 'Transactions' }
        },
        {
            path: '/insights',
            name: 'insights',
            component: () => import('@/views/InsightsView.vue'),
            meta: { title: 'Insights' }
        },
        {
            path: '/goals',
            name: 'goals',
            component: () => import('@/views/GoalsView.vue'),
            meta: { title: 'Goals' }
        },
        {
            path: '/trips',
            name: 'trips',
            component: () => import('@/views/TripsView.vue'),
            meta: { title: 'Trips' }
        },
        {
            path: '/reminders',
            name: 'reminders',
            component: () => import('@/views/RemindersView.vue'),
            meta: { title: 'Reminders' }
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('@/views/SettingsView.vue'),
            meta: { title: 'Settings' }
        }
    ]
});

// Update page title on navigation
router.beforeEach((to, _from, next) => {
    document.title = `${to.meta.title || 'Dhan-Rakshak'} | Dhan-Rakshak`;
    next();
});

export default router;
