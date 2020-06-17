const {v4} = require('uuid');

class Item {
  constructor(itemId) {
    this.itemId = itemId;
    this.id = v4();
    this.requested = false;
    this.sold = false;
  }
  request() {
    if (this.requested || this.sold) {
      return;
    }
    this.requested = true;
  }
  sell() {
    if (this.sold) {
      return;
    }
    this.requested = false;
    this.sold = true;
  }
}

module.exports = Item;
