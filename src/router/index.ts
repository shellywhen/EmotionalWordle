/* eslint-disable */
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
    path: "/dynamic",
    name: "Emordle",
    component: () =>
      import("../views/Emordle.vue")
  }, {
    path: "/wave",
    name: "Wave",
    component: () =>
      import("../views/Wave.vue")
  }, {
    path: "/static",
    name: "Static",
    component: () =>
      import("../views/Static.vue")
  }, {
    path: "/particle",
    name: "Particle",
    component: () =>
      import("../views/Particle.vue")
  }, {
    path: "/Shaking",
    name: "Shaking",
    component: () =>
      import("../views/Shaking.vue")
  }, {
    path: "/Scheme",
    name: "scheme",
    component: () =>
      import("../views/Scheme.vue")
<<<<<<< HEAD
  // }, {
  //   path: "/playground",
  //   name: "playground",
  //   component: () =>
  //     import("../views/Playground.vue")
   }, {
    path: "/tool",
    name: "tool",
    component: () =>
      import("../views/Tool.vue")
=======
  }, {
    path: "/tool",
    name: "tool",
    component: () =>
      import ("../views/Tool.vue")
  }, {
    path: "/corpus",
    name: "corpus",
    component: () =>
      import ("../views/Corpus.vue")
>>>>>>> master
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
