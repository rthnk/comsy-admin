import Vue from "vue";
import store from "../store";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Admin from "../views/Admin.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Login",
    component: Home
  },
  {
    name: 'Admin',
    path: "/admin/",
    redirect: '/admin/root'
  },
  {
    name: 'AdminResource',
    path: "/admin/:resource",
    component: Admin
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
