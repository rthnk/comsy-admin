import axios from "axios";
import { decode } from "jsonwebtoken";

const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api/v1/'
  : `${location.origin}/api/v1/`;

export function getAxiosInstance(token) {
  if (!window.$axios || token) {
    let bToken = `Bearer ${token}`;
    if (!token) {
      if (localStorage.getItem('token') !== 'null') {
        bToken = `Bearer ${localStorage.getItem('token')}`;
      } else {
        bToken = '';
      }
    }
    window.$axios = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        Authorization: bToken
      }
    });
  }
  return window.$axios
}

async function validateToken(token) {
  if (token) {
    try {
      const response = await getAxiosInstance(token).head('/auth/session-check');
      return response.status === 200;
    } catch (error) {
      if (error.name === 'Error' && error.message.includes('401')) {
        localStorage.clear();
        location.reload();
      }
    }
  }
  return false;
}

export function state() {
  const token = localStorage.getItem('token');
  validateToken(token);
  return {
    token,
    loggedIn: !!token,
    user: decode(token) || {}
  }
}

export const mutations = {
  setToken(state, token) {
    if (token) {
      localStorage.setItem('token', token);
      window.$axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.clear();
    }
    state.loggedIn = !!token;
    state.token = token;
    state.user = decode(token);
  }
};

export const getters = {};
export const actions = {
  logout({ commit }) {
    commit('setToken', null);
  },
  async changePassword(_, data) {
    const resp = await getAxiosInstance().post('/auth/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
    return resp.status === 201;
  },
  async login({ commit, state }, data) {
    try {
      const resp = await getAxiosInstance().post('/auth/login', data);
      const isValid = await validateToken(resp.data.data.token);
      if (resp.status === 200 && isValid) {
        commit('setToken', resp.data.data.token);
        if (state.user.role === 'reader') {
          console.error(`User is a reader, can't login.`);
          commit('setToken', null);
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};
