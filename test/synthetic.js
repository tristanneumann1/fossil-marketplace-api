/* eslint-disable*/
const axios = require('axios');
const {v4} = require('uuid');
const prefix = v4();
console.log(prefix);
const endpoint = 'https://wxnitk00ua.execute-api.us-east-1.amazonaws.com/production/';
// const endpoint = 'http://localhost:3000/dev/';

async function synthetic() {
  await axios.post(
    endpoint + 'create-account',
    { email: prefix + '@example.com' },
    { headers: { userToken: prefix + 'seller' } },
  ).catch(console.error);
  
  await axios.post(
    endpoint + 'create-account',
    { email: prefix + '@example.com' },
    { headers: { userToken: prefix + 'buyer' } },
  ).catch(console.error);
  
  await axios.post(
    endpoint + 'list-item',
    { fossilId: prefix + 'fossil' },
    { headers: { userToken: prefix + 'seller' } },
  ).catch(console.error);

  await axios.post(
    endpoint + 'desire-item',
    { fossilId: prefix + 'fossil' },
    { headers: { userToken: prefix + 'buyer' } },
  ).catch(console.error);
}

synthetic();
