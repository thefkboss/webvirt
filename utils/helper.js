var Step
  , client
  , _
  , logger
  , bcrypt
  , scrypt
  , _helper;


var Helper = function () {

}

Helper.prototype.getDaemonsIp = function (cb) {
  console.log("getHostIps");

  var handleStepException = function (err) {
    logger.error(err, {file: __filename, line: __line});
    cb({err: 1});
  }

  Step([
    function getIps () {
      logger.info("getIps", {file: __filename, line: __line});
      client.keys("hosts:*", this);
    },

    function parseIps (err, keys) {
      logger.info("parseIps", {file: __filename, line: __line});
      var step = this;
      // Log error. Fire callback. Exit Step chain
      if (err) {
        logger.error(err, {file: __filename, line: __line});
        this.exitChain();
        cb(err, null);
        return;
      }
      var step = this;
      console.log("keys: ", keys);
      _.map(keys, function (key) {
        client.hget(key, "type", step.parallel(key.split(":")[1]));
      });

    },

   function queryIps () {
    var step = this;
    logger.info("queryIps", {file: __filename, line: __line});
    console.log("args: ", arguments);
    // Iterate on all the saved hosts
    var hosts =  _.without(_.map(arguments, function (host) {
      var ip    = host[0]
        , err   = host[1]
        , type  = host[2];
      
      // Type of the host. Default means it is not hosting libvirt.
      if (type !== "default") return host[0] ;
    }), undefined);

    console.log("hosts: ", hosts);

    cb(null, hosts); 
  },

  ], handleStepException, false);
}


Helper.prototype.addDaemon = function (opts, cb) {
  console.log("helper addDaemon");
  var ip = opts && opts.ip || null;

  var hashKey = "hosts:" + ip;
  client.multi()
    .hset(hashKey, "ip", ip)
    .hset(hashKey, "status", "on")
    .hset(hashKey, "type", "compute")
    .hset(hashKey, "lastOn", "timestamp")
    .exec(function () {
      console.log("args: ", arguments);
      var cmdResults = arguments[1] || []
        , cmdLength = cmdResults.length
        , err = 0;
      while (cmdLength--) {
        if (!cmdResults[cmdLength]) {
          logger.error("An error happened while adding a new daemon to the database", 
            {file: __filename, line: __line});
          err = 1;
        }
      }
      cb({err: err});
    });
};

Helper.prototype.deleteDaemon = function (opts, cb) {
  console.log("helper deleteDaemon");
  var ip = opts && opts.ip || null;
  
  var handleStepException = function (err) {
    logger.error(err, {file: __filename, line: __line});
    cb({err: 1});
  }

  var hashKey = "hosts:" + ip;
  console.log("hashKey: ", hashKey);
  Step([
    function deleteDaemon () {
      var step = this;
      client.del(hashKey, step);
    },

    function confirmDeletion (err, status) {
      console.log("args: ", arguments);
      if (err) {
        logger.error(err, {file: __filename, line: __line});
        this.exitChain();
        cb({err: 1});
        return;
      }

      cb({err: 0});
    }
  ], handleStepException);
};

Helper.prototype.validateIp = function (ip) {
  return ip && ip.match(/^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/);
};

Helper.prototype.handleStepException = function (msg, cb) {
  return function (fnName, err) {
    logger.error(err + " at " + fnName + " - " + msg);    
    cb({err: 1});    
  }
}

Helper.prototype.createUser = function (opts, cb) {
  var hashKey = opts.hashKey || null
    , password = opts.password || null
    , scryptConfig = opts.scryptConfig || {}
    , maxtime =  scryptConfig.maxtime
    , maxmem = scryptConfig.maxmem
    , maxmemfrac = scryptConfig.maxmemfrac

  bcrypt.genSalt(100, function (err, salt) {
    var saltLength = salt.length;
    var saltedPass = salt.slice(0,saltLength / 2) + password + salt.slice(saltLength / 2, saltLength);

    scrypt.passwordHash(saltedPass, maxtime, maxmem, maxmemfrac, function(err, scryptHash) {
      client.multi()
        .hset(hashKey, "password", scryptHash)
        .hset(hashKey, "salt", salt)
        .exec(function (err, status) {
          console.log("Step confirmCreation");
          cb(err, status);
        });
    });
  });
}


module.exports.inject = function(di) {
  if (!_helper) {
    logger = di.logger;
    Step = di.Step;
    _ = di._;
    client = di.client;
    bcrypt = di.bcrypt;
    scrypt = di.scrypt;
    _helper = new Helper();
  }

  return _helper;

}