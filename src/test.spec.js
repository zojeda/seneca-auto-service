'use strict';

import SenecaService from './SenecaService';
var sinon = require('sinon');

@SenecaService({role: "some.api"})
class AClassWithColaborators {
  constructor(colaborator1, colaborator2) {
    this.colaborator1 = colaborator1;
    this.colaborator1.log("constructorCall1");
    this.colaborator2 = colaborator2;
    this.colaborator2.log2("constructorCall2");
  }
  withNoArgs() {
    this.colaborator2.log2('withNoArgs');
  }
  withOneArg(someArg) {
    this.colaborator2.log2('withOneArg');
  }
  withOneArgAndCallback(someArg, callback) {
    this.colaborator2.log2('withOneArgAndCallback');
    callback(null, someArg);
  }
  withOneArgAndCallbackError(someArg, callback) {
    this.colaborator2.log2('withOneArgAndCallbackError');
    callback("error");
  }

}

describe('Seneca Service Decorator', () => {
  var colaborator1 = {
    log: sinon.spy()
  };
  var colaborator2 = {
    log2: sinon.spy()
  };
  describe('Decorated Class', () => {
    it('shoud have a seneca service registration function', () => {
      AClassWithColaborators.senecaService.should.be.ok;
    });
    var senecaService = AClassWithColaborators.senecaService(colaborator1, colaborator2);
    it('the registration function should properly create an instance', () => {
      colaborator1.log.should.have.been.calledWith("constructorCall1");
      colaborator2.log2.should.have.been.calledWith("constructorCall2");
    });
    describe('Seneca Integration', () => {
      var seneca;

      beforeEach(function() {
        seneca = require('seneca')({log: "quiet"});
        colaborator1.log = sinon.spy();
        colaborator2.log2 = sinon.spy();
        seneca.use(senecaService);
      });
      it('the service should respond on seneca act invocations withOneArgAndCallback (arg, callback)', () => {
        seneca.act('role:some.api,action:withOneArgAndCallback,args:anyArg', (err, result) => {
          colaborator2.log2.should.have.been.calledWith("withOneArgAndCallback");
          result.data.should.be.equal('anyArg');
        });
      });
      it('the service should respond on seneca act invocations withOneArgAndCallbackError (arg, callback)', () => {
        seneca.act('role:some.api,action:withOneArgAndCallbackError,args:anyArg', (err, result) => {
          colaborator2.log2.should.have.been.calledWith("withOneArgAndCallbackError");
          err.should.be.equal('error');
          result.should.not.be.ok;
        });
      });
      it('the service should respond on seneca act invocations withOneArg (arg)', () => {
        seneca.act('role:some.api,action:withOneArg,args:anyArg', (err, result) => {
          colaborator2.log2.should.have.been.calledWith("withOneArg");
          result.data.should.be.equal('OK');
        });
      });
      it('the service should respond on seneca act invocations withNoArgs ()', () => {
        seneca.act('role:some.api,action:withNoArgs', (err, result) => {
          colaborator2.log2.should.have.been.calledWith("withNoArgs");
          result.data.should.be.equal('OK');
        });
      });
    });
  });
});
