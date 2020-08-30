import axios from 'axios';

export default class ApiClient {
  constructor(userToken) {
    this.client = axios.create({
      baseURL: 'https://wxnitk00ua.execute-api.us-east-1.amazonaws.com/production',
      headers: {
        userToken,
      },
    });
  }
  listItem(fossilId) {
    return this.client.post('/list-item', {
      fossilId,
    });
  }
  fossilCatalog() {
    return this.client.get('/fossil-catalog');
  }
}
