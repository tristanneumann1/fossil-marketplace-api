/* eslint-disable*/
function dbWithAccountAndItem(accountId, fossilId, itemId) {
  return JSON.stringify([
    {"id":"3db37518-3efb-4e5a-8f3c-70e50741afa8","name":"AccountWasCreated","aggregateName":"Account","aggregateId":accountId,"payload":{},"metaData":{"createdAt":1592514006982}},
    {"id":"2786825b-ea1c-4b2e-8855-1eea1ec4da2f","name":"ItemWasListed","aggregateName":"Fossil","aggregateId":itemId,"payload":{"fossilId":fossilId,"accountId":accountId,"sellerId":accountId,"itemId":itemId},"metaData":{"createdAt":1592514006982}}
  ]);
}

module.exports = {dbWithAccountAndItem};
