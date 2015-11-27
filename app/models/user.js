var azure = require('azure-storage');
var uuid = require('node-uuid');
var bcrypt   = require('bcrypt-nodejs');
var entityGen = azure.TableUtilities.entityGenerator;
var crypto = require('crypto');

module.exports = User;

function User(storageClient) {
  this.storageClient = storageClient;
  this.tableName = 'users';
  this.storageClient.createTableIfNotExists(this.tableName, function tableCreated(error) {
    if(error) {
      throw error;
    }
    
  });
};

User.prototype = {
  findById: function(id, callback) {
    self = this;
    // TODO: partitionKey ('test') ...
    self.storageClient.retrieveEntity(this.tableName, 'test', id, function(error, result, response){
      if(error) {
        callback(error);
      } else {
        callback(null, toDto(result));
      }
    });
  },
  
  findByToken: function(token, callback) {
    self = this;
    var query = new azure.TableQuery()
      .top(1)
      .where('PartitionKey eq ? and token eq ?', 'test', token);
    self.storageClient.queryEntities(this.tableName, query, null, function(error, result, response) {
      if(error) {
        callback(error);
      } else {
        if(result.entries && result.entries.length > 0) callback(null, toDto(result.entries[0]));
        else callback(null, null);
      }
    });
  },
  
  findByEmail: function(email, callback) {
    self = this;
    var query = new azure.TableQuery()
      .top(1)
      .where('PartitionKey eq ? and email eq ?', 'test', email);
    self.storageClient.queryEntities(this.tableName, query, null, function(error, result, response) {
      if(error) {
        callback(error);
      } else {
        if(result.entries && result.entries.length > 0) callback(null, toDto(result.entries[0]));
        else callback(null, null);
      }
    });
  },
  
  create: function(email, password, callback) {
    self = this;
    
    var sha256 = crypto.createHash("sha256");
    sha256.update(password, "utf8");
    var pwhash = sha256.digest("base64");
    
    var token = email; // temporary
    var id = uuid();
    
    var itemDescriptor = {
      PartitionKey: entityGen.String('test'),
      RowKey: entityGen.String(id),
      email: entityGen.String(email),
      password: entityGen.String(pwhash),
      token: entityGen.String(token),
      
      // localEmail: entityGen.String(user.localEmail),
      // localPassword: entityGen.String(user.localPassword),
      // facebookId: entityGen.String(user.facebookId),
      // facebookToken: entityGen.String(user.facebookToken),
      // facebookEmail: entityGen.String(user.facebookEmail),
      // facebookName: entityGen.String(user.facebookName),
      // twitterId: entityGen.String(user.twitterId),
      // twitterToken: entityGen.String(user.twitterToken),
      // twitterDisplayName: entityGen.String(user.twitterDisplayName),
      // twitterUserName: entityGen.String(user.twitterUserName),
      // googleId: entityGen.String(user.googleId),
      // googleToken: entityGen.String(user.googleToken),
      // googleEmail: entityGen.String(user.googleEmail),
      // googleName: entityGen.String(user.googleName),
    };
    self.storageClient.insertEntity(this.tableName, itemDescriptor, function entityInserted(error) {
      if(error){  
        callback(error);
      }
      callback({ id: id, email: email, token: token });
    });
  },
  
  login: function(email, password, callback) {
    self = this;
    
    var sha256 = crypto.createHash("sha256");
    sha256.update(password, "utf8");
    var pwhash = sha256.digest("base64");
    
    var query = new azure.TableQuery()
      .top(1)
      .where('PartitionKey eq ? and email eq ?', 'test', email);
    self.storageClient.queryEntities(this.tableName, query, null, function(error, result, response) {
      if(error) {
        callback(error);
      } else {
        if(result.entries && result.entries.length > 0) {
          var user = toDto(result.entries[0]);
          if(result.entries[0].password["_"] === pwhash)
            callback(null, user);
          else
            callback(null, null);
        }
        else 
        {
          callback(null, null);
        }
      }
    });
  }

};  
  
  
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
    id: obj.id,
    email: obj.email,
    token: obj.token
  };
}