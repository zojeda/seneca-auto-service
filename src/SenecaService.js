module.exports = function(pattern) {
   return function decorator(target) {
      target.senecaService = function(excludedMethods) {
        var excludedMethods = excludedMethods || [];
        excludedMethods.push('constructor');
        var methodNames = Object.getOwnPropertyNames(target.prototype);
        var serviceMethods = methodNames.filter(function(method){
          return excludedMethods.indexOf(method) === -1;
        });
        serviceMethods.forEach(function(methodName) {
          var method = target.prototype[methodName];
          console.log(method);
        })
      }
   }
}
