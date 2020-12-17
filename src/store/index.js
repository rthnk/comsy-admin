import Vue from "vue";
import Vuex from "vuex";
import auth from "./auth";
import { generateCrudState } from "./crud-gen.js";
import settings from "./settings";

const resources = generateCrudState('resources');
const collections = generateCrudState('collections');

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    auth,
    collections,
    resources,
    settings,
  }
});

export default store;

export async function getStore() {
  const resources = await store.dispatch('resources/getItems');
  resources.forEach(resource => {
    const module = generateCrudState(resource);
    if (!store.hasModule(resource)) {
      store.registerModule(resource, module);
    }
  });
  return store;
}