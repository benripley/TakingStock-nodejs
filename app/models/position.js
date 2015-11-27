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
  findById: function(partitionKey, id, callback) {
    self = this;
    self.storageClient.retrieveEntity(this.tableName, partitionKey, id, function(error, result, response){
      if(error) {
        callback(error);
      } else {
        callback(null, toDto(result));
      }
    });
  },
  
  all: function(partitionKey, callback) {
    self = this;
    var query = new azure.TableQuery().top(1000).where('PartitionKey eq ?', partitionKey);
    self.storageClient.queryEntities(this.tableName, query, null, function(error, result, response){
      if(error) {
        callback(error);
      } else {
        // if(result.continuationToken) results are paginated...
        callback(null, result.entries.map(toDto));
      }
    });
  },
  
  create: function(partitionKey, position, callback) {
    self = this;
    var itemDescriptor = {
      PartitionKey: entityGen.String(partitionKey),
      RowKey: entityGen.String(uuid()),
      Date: entityGen.DateTime(position.date),
      Symbol: entityGen.String(position.symbol),
      Price: entityGen.Double(position.price),
      Commission: entityGen.Double(position.commission),
      Quantity: entityGen.Double(position.quantity)
    };
    self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
      if(error){  
        callback(error);
      }
      callback(null);
    });
  },
  
  delete: function(partitionKey, id, callback) {
    self = this;
    var itemDescriptor = {
      PartitionKey: entityGen.String(partitionKey),
      RowKey: entityGen.String(id),
    };
    self.storageClient.deleteEntity(self.tableName, itemDescriptor, function(error, response){
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
  return {
    commission: obj.Commission,
    date: obj.Date,
    price: obj.Price,
    quantity: obj.Quantity,
    symbol: obj.Symbol,
    id: obj.id
  };
}