import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";
import settings from "./settings";
import user from "./user";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    auth,
    settings,
    user
  }
});
