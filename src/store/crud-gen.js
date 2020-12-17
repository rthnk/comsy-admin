import { getAxiosInstance } from './auth';

/**
 * Map a resource actions to be used from API
 * @param {string} resource resource to be mapped.
 */
export function generateCrudState(resource) {
  const COLLECTION = resource;
  return {
    namespaced: true,
    state() {
      return {
        items: [],
        resourceInfo: {},
        //////////////
        itemsPerPage: 0,
        totalItems: 0,
        pagesCount: 0,
        currentPage: 0,
        pages: {},
      }
    },
    mutations: {
      setItems(state, items) {
        state.items = items;
      },
      setPageItems(state, {data, meta} = {}) {
        if (!data) {
          return;
        }
        let collection = 'unknown';
        if (meta) {
          collection = meta.plural;
        }
        const { itemsPerPage, page, pages, count, values } = data; 
        state.itemsPerPage = itemsPerPage;
        state.totalItems = count;
        state.pagesCount = pages;
        state.currentPage = page;
        if (!state.pages[collection]) {
          state.pages[collection] = {};
        }
        state.pages[collection][page] = values;
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
            return state.resourceInfo;
          }
        } catch (error) {
          if (error.response) {
            return {
              status: error.response.status,
              message: Array.isArray(error.response.data.errors)
                ? error.response.data.errors.join('\n')
                : error.response.data.errors
            };
          }
          return {
            status: -1,
            message: error.message
          }
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
              message: Array.isArray(error.response.data.errors)
                ? error.response.data.errors.join('\n')
                : error.response.data.errors
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
      async getPaginatedItems({commit, state}, {page, itemsPerPage}={}) {
        try {
          const response = await getAxiosInstance().get(`/${COLLECTION}/paginated?pageCount=${itemsPerPage || 100}&page=${page || 1}`);
          if (response.status === 200) {
            commit('setPageItems', response.data);
            const { itemsPerPage, page, pages, count, values, totalCount } = response.data.data;
            return {
              itemsPerPage: itemsPerPage,
              count,
              totalCount,
              pagesCount: pages,
              currentPage: page,
              pageItems: values,
            };
          }
        } catch (error) {
          if (error.response) {
            return {
              status: error.response.status,
              message: Array.isArray(error.response.data.errors)
                ? error.response.data.errors.join('\n')
                : error.response.data.errors
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
          if (error.response) {
            return {
              status: error.response.status,
              message: Array.isArray(error.response.data.errors)
                ? error.response.data.errors.join('\n')
                : error.response.data.errors
            };
          }
          return {
            status: -1,
            message: error.message
          }
        }
      },
      async updateItem(_store, item) {
        try {
          const response = await getAxiosInstance().put(`/${COLLECTION}/${item._id}`, item);
          if (response.status >= 200 && response.status < 300) {
            // await dispatch('getItems');
            return {
              ...response.data.data,
              $meta: response.data.meta
            };
          }
        } catch (error) {
          if (error.response) {
            return {
              status: error.response.status,
              message: Array.isArray(error.response.data.errors)
                ? error.response.data.errors.join('\n')
                : error.response.data.errors
            };
          }
          return {
            status: -1,
            message: error.message
          }
        }
      },
      async addItem(_store, item) {
        try {
          const response = await getAxiosInstance().post(`/${COLLECTION}`, item);
          if (response.status >= 200 && response.status < 300) {
            // await dispatch('getItems');
            return {
              ...response.data.data,
              $meta: response.data.meta
            };
          }
        } catch (error) {
          if (error.response) {
            return {
              status: error.response.status,
              message: Array.isArray(error.response.data.errors)
                ? error.response.data.errors.join('\n')
                : error.response.data.errors
            };
          }
          return {
            status: -1,
            message: error.message
          }
        }
      },
      async deleteItem(_store, item) {
        try {
          const response = await getAxiosInstance().delete(`/${COLLECTION}/${item._id}`);
          // if (response.status >= 200 && response.status < 300) {
          //   await dispatch('getItems');
          // }
          return response.status >= 200 && response.status < 300;
        } catch (error) {
          if (error.response) {
            return {
              status: error.response.status,
              message: Array.isArray(error.response.data.errors)
                ? error.response.data.errors.join('\n')
                : error.response.data.errors
            };
          }
          return {
            status: -1,
            message: error.message
          }
        }
      }
    }
  };
}
