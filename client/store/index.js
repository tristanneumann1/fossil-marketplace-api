import ApiClient from './apiClient';

export function state() {
  return {
    accountId: null,
  };
}

export const mutations = {
  SET_ACCOUNT_ID(state, accountId) {
    state.accountId = accountId;
  },
};

export const actions = {
  async register({ commit }, { accountId }) {
    const client = new ApiClient(accountId);
    client.createAccount({ accountId, email: accountId + '@example.com' });
    commit('SET_ACCOUNT_ID', accountId);
  },
  async listItem({ state }, { fossilId }) {
    const client = new ApiClient(state.accountId);
    return await client.listItem(fossilId);
  },
};
