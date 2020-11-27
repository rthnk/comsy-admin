import Vue from "vue";
import store from "../store";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Admin from "../views/Admin.vue";

import AdminRoot from "../components/AdminRoot.vue";
import SettingsManager from "../components/SettingsManager.vue";
import UsersManager from "../components/UsersManager.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Login",
    component: Home
  },
  {
    path: "/admin/",
    component: Admin,
    redirect: '/admin/root',
    children: [
      {
        path: "root",
        name: "Admin",
        component: AdminRoot
      },
      {
        path: "settings",
        name: "Settings",
        component: SettingsManager
      },
      {
        path: "users",
        name: "Users",
        component: UsersManager
      },
    ]
  },
  /*
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      // import(/ * webpackChunkName: "about" * / "../views/About.vue")
      import("../views/About.vue")
  }
  */
];

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.auth.loggedIn;
  if (to.name !== 'Login' && !isAuthenticated) next({
    name: 'Login',
    query: {
      next: to.path
    }
  });
  next();
})

export default router;
