'use strict';

module.exports = function(pattern) {
  return function decorator(target) {
    target.client = function(seneca) {
      var client = {};
      var serviceMethods = getServiceMethods(target);
      serviceMethods.forEach(function(method) {
        var actionPattern = JSON.parse(JSON.stringify(pattern));
        actionPattern.action = method.name;
        client[method.name] = function(args, cb){
          if(!cb) {
            cb=args;
            args = undefined;
          }
          if(args)
            actionPattern.args = args;
          seneca.act(actionPattern, cb);
        }
      });
      return client;
    };
    target.senecaService = function() {
      var args = [].slice.call(arguments);
      var instance = construct(target, args);

      return function(options) {
        var seneca = this;
        var serviceMethods = getServiceMethods(target);
        serviceMethods.forEach(function(method) {
          var actionPattern = JSON.parse(JSON.stringify(pattern));
          actionPattern.action = method.name;
          seneca.add(actionPattern, function(args, callback) {
            var instanceMethod = args.args ? method.bind(instance, args.args): method.bind(instance);
            if(method.length>0) {
              instanceMethod(function(err, value) {
                if(err) {
                  callback(err);
                } else
                  callback(null, {data: value});
              })
            } else {
              instanceMethod();
              callback(null, {data: "OK"});
            }
          });
        })
        return {name: target.name};
      }
    }
  }
}

function getServiceMethods(target) {
  var excludedMethods = [];
  excludedMethods.push('constructor');
  var methodNames = Object.getOwnPropertyNames(target.prototype);
  var serviceMethodNames = methodNames.filter(function(method) {
    return excludedMethods.indexOf(method) === -1;
  });
  return serviceMethodNames.map(function(methodName) {
    return target.prototype[methodName];
  })
}

function construct(constr, args) {
  var instance = Object.create(constr.prototype);
  var result = constr.apply(instance, args);
  return typeof result === 'object' ? result : instance;
}
