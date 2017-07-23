import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Tutorial from '@/components/Tutorial'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '/',
      component: Home
    },
    {
      path: '/tutorial',
      name: 'tutorial',
      component: Tutorial
    }
  ]
})
