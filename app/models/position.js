var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;
  
module.exports = Position;

function Position(storageClient) {
  this.storageClient = storageClient;
  this.tableName = 'positions';
  this.storageClient.createTableIfNotExists(this.tableName, function tableCreated(error) {
    if(error) {
      throw error;
    }
  });
};

Position.prototype = {
  find: function(id, callback) {
    self = this;
    // TODO: partitionKey ('test') should be dynamic and come from authenticated userId
    self.storageClient.retrieveEntity(this.tableName, 'test', id, function(error, result, response){
      if(error) {
        callback(error);
      } else {
        callback(null, toDto(result));
      }
    });
  },
  
  all: function(callback) {
    self = this;
    // TODO: partitionKey ('test') should be dynamic and come from authenticated userId
    var query = new azure.TableQuery().top(1000).where('PartitionKey eq ?', 'test');
    self.storageClient.queryEntities(this.tableName, query, null, function(error, result, response){
      if(error) {
        callback(error);
      } else {
        // if(result.continuationToken) results are paginated...
        callback(null, result.entries.map(toDto));
      }
    });
  },
  
  create: function(position, callback) {
    self = this;
    var itemDescriptor = {
      PartitionKey: entityGen.String('test'),
      RowKey: entityGen.String(uuid()),
      date: entityGen.DateTime(position.date),
      symbol: entityGen.String(position.symbol),
      price: entityGen.Double(position.price),
      commission: entityGen.Double(position.commission),
      quantity: entityGen.Double(position.quantity)
    };
    self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
      if(error){  
        callback(error);
      }
      callback(null);
    });
  }
}

//https://www.devtxt.com/blog/azure-table-storage-library-for-nodejs-frustrations
function toDto(azureTableEntity) 
{
  var obj = {};
  for (var propertyName in azureTableEntity) {
    if(["PartitionKey","Timestamp"].indexOf(propertyName)==-1) {
      if(propertyName === "RowKey") {
        obj.id = azureTableEntity[propertyName]["_"];
      } else {
        obj[propertyName] = azureTableEntity[propertyName]["_"];
      }
    }
  }
  return obj;
}