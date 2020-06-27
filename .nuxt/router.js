import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _36e63bf5 = () => interopDefault(import('..\\client\\pages\\dogs\\index.vue' /* webpackChunkName: "pages_dogs_index" */))
const _8eeb773c = () => interopDefault(import('..\\client\\pages\\dogs\\_breed.vue' /* webpackChunkName: "pages_dogs__breed" */))
const _4f1077e8 = () => interopDefault(import('..\\client\\pages\\index.vue' /* webpackChunkName: "pages_index" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/dogs",
    component: _36e63bf5,
    name: "dogs"
  }, {
    path: "/dogs/:breed",
    component: _8eeb773c,
    name: "dogs-breed"
  }, {
    path: "/",
    component: _4f1077e8,
    name: "index"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
