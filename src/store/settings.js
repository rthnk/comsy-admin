
export function state() {
  return {
    isDark: localStorage.getItem('theme') === 'dark'
  }
}

export const mutations = {
  setTheme(state, dark) {
    if (dark) {
      state.isDark = true;
      localStorage.setItem('theme', 'dark');
    } else {
      state.isDark = false;
      localStorage.setItem('theme', 'light');
    }
  }
};
export const getters = {};
export const actions = {
  setDark({commit}, dark) {
    commit('setTheme', dark)
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};
