import Vue from "vue";
import App from "./App.vue";
import { getStore } from "./store";
import router from "./router";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

async function initialize() {
  const store = await getStore();
  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount("#app");
}

initialize();
