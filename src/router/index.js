import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/sheet-desinger'
    },
    {
      path: '/sheet-desinger',
      name: 'sheetDesinger',
      component: () => import('../views/sheetDesinger/desinger.vue')
    },
    {
      path: '/sheet-cloumn',
      name: 'sheetDesinger',
      component: () => import('../views/sheetDesinger/index.vue')
    },
    {
      path: '/pivot-table',
      name: 'PivotTable',
      component: () => import('../views/PivotTable/index.vue')
    },
    {
      path: '/copy-sheet',
      name: 'copySheet',
      component: () => import('../views/copySheet/index.vue')
    },
    {
      path: '/spread-index',
      name: 'spreadIndex',
      component: () => import('../views/spread/index.vue')
    },
  ]
})
