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
  // async register({ state, commit }, { accountId }) {
  //   const client = new ApiClient(state.accountId);
  //   const response = await .post(
  //     '/create-account',
  //     { email: accountId + '@example.com' },
  //     {
  //       headers: { userToken: accountId },
  //     },
  //   );
  //   if (response) {
  //     commit('SET_ACCOUNT_ID', accountId);
  //   }
  // },
  async listItem({ state }, { fossilId }) {
    const client = new ApiClient(state.accountId);
    return await client.listItem(fossilId);
  },
};
