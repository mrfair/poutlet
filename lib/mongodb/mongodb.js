var MongoDB = require("mongodb");
var fs = require('fs');
var path = require('path');

var poutlet_config = {};

if(fs.existsSync(path.resolve('poutlet_config.json')) === true) {
  try {
    poutlet_config = JSON.parse(fs.readFileSync(path.resolve('poutlet_config.json'), {
      encoding: "utf8",
      flag: "r",
    }));

  } catch(e) {
    console.log(e);
  }
};

  
var ObjectId = (data) => {
  if (data)
    try {
      return MongoDB.ObjectId(data);
    } catch (e) {
      return data;
    }
  else return data;
};


var DB_GET = async () => {
  return await new Promise((resolve, reject) => {
    try {
      if(poutlet_config.mongodb && poutlet_config.mongodb.url && poutlet_config.mongodb.db) {
        MongoDB.MongoClient.connect(
          poutlet_config.mongodb.url
          ,
          {
            ssl: true,
            useUnifiedTopology: true,
            //replicaSet: 'rp0',
            useNewUrlParser: true,
            //sslValidate: true,
            //sslCA: fs.readFileSync(__dirname + '/assets/mongodb.pem')
          },
          (err, client) => {
            if (err !== null ) {
              console.log("Error mongod." + err.message);
  
              reject(err)
            } else {
              
              console.log("\x1b[33m%s\x1b[0m", `---> MONGO DB Connect! <---`);
  
              resolve(client.db());
            }
  
          }
        );

      } else {
        throw new Error('MongoDB not setup url and database')
      }

    } catch (e) {
      resolve(e);
    }
  });
};


module.exports = async function() {
  return {ObjectId, DB: await DB_GET()}
}