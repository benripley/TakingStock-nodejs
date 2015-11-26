var nconf = require('nconf');

function getOptionsFromConfiguration () { 
  // nconf will load the config from either environment variables or the config.json file
  nconf.env()
    .file({ file: '/config.json', search: true });
  
  return {
    accountName: nconf.get("STORAGE_NAME"),
    accountKey: nconf.get("STORAGE_KEY"),
    facebookAppId: nconf.get("FACEBOOK_APP_ID"),
    facebookAppSecret: nconf.get("FACEBOOK_APP_SECRET"),
    facebookCallbackUrl: nconf.get("FACEBOOK_CALLBACK_URL")
  };
}

module.exports = { CONFIG: getOptionsFromConfiguration ()}