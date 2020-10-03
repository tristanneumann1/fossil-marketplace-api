import SignUp from './index.vue';
import { shallowMount } from 'vue-test-utils';

describe('Sign Up', () => {
  let wrapper;
  it('loads component', () => {
    wrapper = shallowMount(SignUp);
    expect(wrapper.vm).toBeDefined;
  });
});
