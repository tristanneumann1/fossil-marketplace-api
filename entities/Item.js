class Item {
  constructor(itemId, payload) {
    this.itemId = itemId;
    this.fossilId = payload.fossilId;
    this.sellerId = payload.sellerId || null;
    this.buyerId = payload.buyerId || null;
  }
}

module.exports = Item;
