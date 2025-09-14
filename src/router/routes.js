import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/tasks' },
      { path: 'tasks', component: () => import('pages/TaskList.vue'), name: 'tasks' },
      { path: 'keywords', component: () => import('pages/KeywordList.vue'), name: 'keywords' },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: 'login', component: () => import('pages/LoginPage.vue') }],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const loggedIn = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !loggedIn) {
    return next('/login')
  }
  next()
})

export default routes
