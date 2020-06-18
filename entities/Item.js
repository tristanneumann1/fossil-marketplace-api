class Item {
  constructor(itemId, payload) {
    this.itemId = itemId;
    this.fossilId = payload.fossilId;
    this.sellerId = null;
    this.buyerId = null;
  }
}

module.exports = Item;
