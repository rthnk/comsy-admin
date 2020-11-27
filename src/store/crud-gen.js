import { getAxiosInstance } from './auth';

export function generateCrudState(resource) {
  const COLLECTION = resource;
  return {
    namespaced: true,
    state() {
      return {
        items: [],
        resourceInfo: {}
      }
    },
    mutations: {
      setItems(state, items) {
        state.items = items;
      },
      setResourceInfo(state, items) {
        state.resourceInfo = items;
      },
    },
    getters: {},
    actions: {
      async getResourceInfo({commit, state}) {
        try {
          const response = await getAxiosInstance().get(`/resources/${COLLECTION}`);
          if (response.status === 200) {
            commit('setResourceInfo', response.data.data.fields);
          }
        } catch (error) {
          return {
            status: error.response.status,
            message: error.response.data.errors.join('\n')
          };
        }
        return state.items;
      },
      async getItems({commit, state}) {
        try {
          const response = await getAxiosInstance().get(`/${COLLECTION}`);
          if (response.status === 200) {
            commit('setItems', response.data.data.values);
          }
        } catch (error) {
          if (error.response) {
            return {
              status: error.response.status,
              message: error.response.data.errors.join('\n')
            };
          } else {
            return {
              status: error.name,
              message: error.message
            };
          }
        }
        return state.items;
      },
      async getItem(_, item) {
        try {
          const response = await getAxiosInstance().get(`/${COLLECTION}/${item.id}`);
          if (response.status === 200) {
            return response.data;
          }
        } catch (error) {
          return {
            status: error.response.status,
            message: error.response.data.errors.join('\n')
          };
        }
      },
      async updateItem({dispatch}, item) {
        try {
          const response = await getAxiosInstance().put(`/${COLLECTION}/${item._id}`, item);
          if (response.status >= 200 && response.status < 300) {
            await dispatch('getItems');
            return response.data.data;
          }
        } catch (error) {
          return {
            status: error.response.status,
            message: error.response.data.errors.join('\n')
          };
        }
      },
      async addItem({dispatch}, item) {
        try {
          const response = await getAxiosInstance().post(`/${COLLECTION}`, item);
          if (response.status >= 200 && response.status < 300) {
            await dispatch('getItems');
            return response.data.data
          }
        } catch (error) {
          return {
            status: error.response.status,
            message: error.response.data.errors.join('\n')
          };
        }
      },
      async deleteItem({dispatch}, item) {
        try {
          const response = await getAxiosInstance().delete(`/${COLLECTION}/${item._id}`);
          if (response.status >= 200 && response.status < 300) {
            await dispatch('getItems');
          }
          return true;
        } catch (error) {
          return {
            status: error.response.status,
            message: error.response.data.errors.join('\n')
          };
        }
      }
    }
  };
}
