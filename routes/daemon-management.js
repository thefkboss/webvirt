var client = require("./../db-conn").client
  , Step = require('step')
  , logger
  , helper;

var DaemonManagement = function (config) {
  console.log("DaemonManagement");

}


DaemonManagement.prototype.listDaemons = function (req, res) {
  console.log("DaemonManagement - listDaemons");

  var sendResponse = function (msg) {
    res.json(msg);
  }

  helper.getDaemonsIp(function (err, ips) {
    console.log("getDaemonsIp callback");
    if (err) {
      logger.error(err, {file: __filename, line: __line});
      sendResponse({err: true, daemons: null});
      return;
    }

    sendResponse({err: false, daemons: ips});
  });

};

DaemonManagement.prototype.addDaemon = function (req, res) {
  console.log("DaemonManagement - addDaemons");
  var body = req.body
    , ip = req.params['ip']
    , hashKey;


  // Check if ip is valid
  if (false) {
    logger.error("Trying to add an invalid IP - " + ip, 
      {file: __filename, line: __line});
    res.json({err: 1});
    return;
  }

  helper.addDaemon({ip: ip}, function (err) {
    res.json(err);
  });
  
};

DaemonManagement.prototype.updateDaemon = function (req, res) {
  console.log("DaemonManagement - updateDaemons");
  var body = req.body
    , ip = req.params['ip']
    , hashKey;


  // Check if ip is valid
  if (false) {
    logger.error("Trying to update an invalid IP - " + ip, 
      {file: __filename, line: __line});
    res.json({err: 1});
    return;
  }


  var handleStepException = function (err) {
    logger.error(err, {file: __filename, line: __line});
    res.json({err: true});
  }

  var sendResponse = function (msg) {
    res.json(msg);
  }

  hashKey = "hosts:" + ip;
  Step([
    function deleteDaemon () {
      helper.deleteDaemon({ip: ip}, this)
    },

    function updateDaemon (err) {
      if (err) {
        logger.error("Error deleting daemon with ip - " + ip,
          {file: __filename, line: __line});
        this.exitChain();
        sendResponse({err: 1});
        return;
      }

      helper.addDaemon({ip: ip}, this);

    },

    function confirm (err) {
      console.log("confirm");

      if (err) {
        logger.error("Error adding daemon with ip - " + ip,
          {file: __filename, line: __line});
        this.exitChain();
        sendResponse({err: 1});
        return;
      }

      sendResponse({err: 0});

    }
  ], handleStepException);
  
};

DaemonManagement.prototype.deleteDaemon = function (req, res) {
  console.log("DaemonManagement - deleteDaemons");

  var body = req.body
    , ip = req.params['ip']
    , hashKey;


  // Check if ip is valid
  if (false) {
    logger.error("Trying to update an invalid IP - " + ip, 
      {file: __filename, line: __line});
    res.json({err: 1});
    return;
  }

  helper.deleteDaemon({ip: ip}, function (err) {
    res.json(err);
  })
  
  
};

module.exports.inject = function(di) {
  logger = di.logger;
  helper = di.helper;
  logger.info("Daemon Management inject");
  return new DaemonManagement(di.config);
}