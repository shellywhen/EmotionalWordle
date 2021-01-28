import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home
  }, {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  }, {
    path: "/playground",
    name: "Playground",
    component: () =>
      import("../views/Playground.vue")
  }, {
    path: "/wave",
    name: "Wave",
    component: () =>
      import("../views/Wave.vue")
  }, {
    path: "/manual",
    name: "Manual",
    component: () =>
      import("../views/Manual.vue")
  }, {
    path: "/particle",
    name: "Particle",
    component: () =>
      import("../views/Particle.vue")
  },
  {
    path: "/Shaking",
    name: "Shaking",
    component: () =>
      import("../views/Shaking.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
