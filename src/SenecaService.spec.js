'use strict';

import SenecaService from './SenecaService';
var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);
var expect = chai.expect;
sinon.assert.expose(chai.assert, { prefix: "" });

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
  withCallback(cb) {
    this.colaborator2.log2('withCallback');
    cb(null, 'withCallback');
  }
  withOneArgAndCallback(someArg, callback) {
    this.colaborator2.log2('withOneArgAndCallback');
    callback(null, someArg);
  }
  withOneArgAndCallbackError(someArg, callback) {
    this.colaborator2.log2('withOneArgAndCallbackError');
    callback('Some Error');
  }

}
/*
requiered in order to run all scenarios without
maxlisteners complain
*/
process.setMaxListeners(0);

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
    })

    it('the registration function should properly create an instance', () => {
      AClassWithColaborators.senecaService(colaborator1, colaborator2);

      colaborator1.log.should.have.been.calledWith("constructorCall1");;
      colaborator2.log2.should.have.been.calledWith("constructorCall2");
    })
    describe('Seneca Service', () => {
      var seneca, c1, c2, senecaError;
      beforeEach( (done) => {
        seneca = require('seneca')({log:'quiet', errhandler: (err)=>{senecaError=err; return false}});
        c1 = {log: sinon.spy()};
        c2 = {log2: sinon.spy()};
        seneca.use(AClassWithColaborators.senecaService(c1, c2));
        seneca.ready(()=>done());
      });
      afterEach( () => {
//        if (senecaError ) console.log(senecaError);
      });
      it('Should respond on seneca act invocations withOneArgAndCallback (arg, callback)', (done) => {
        seneca.act('role:some.api,action:withOneArgAndCallback,args:anyArg', (err, result) => {
          c2.log2.should.have.been.calledWith("withOneArgAndCallback");
          result.data.should.be.equal('anyArg');
          done();
        });
      });
      it('Should respond on seneca act invocations withOneArgAndCallbackError (arg, callback)', (done) => {
        seneca.act('role:some.api,action:withOneArgAndCallbackError,args:anyArg', (err, result) => {
          err.details['orig$'].code.should.be.equal('Some Error');
          c2.log2.should.have.been.calledWith("withOneArgAndCallbackError");
          done();
        })
      });
      it('Should respond on seneca act invocations withNoArgs ()', (done) => {
        seneca.act('role:some.api,action:withNoArgs', (err, result) => {
          c2.log2.should.have.been.calledWith("withNoArgs");
          done();
        })
      });
      it('Should respond on seneca act invocations withCallback(cb)', (done) => {
        seneca.act('role:some.api,action:withCallback', (err, result) => {
          c2.log2.should.have.been.calledWith("withCallback");
          result.data.should.be.equal('withCallback');
          done();
        })
      });

    });
    describe('Seenca Client proxy', () => {
      var seneca, client, c1, c2, senecaError;
      beforeEach( (done) => {
        seneca = require('seneca')({log:'quiet', errhandler: (err)=>{senecaError=err; return false}});
        c1 = {log: sinon.spy()};
        c2 = {log2: sinon.spy()};
        seneca.use(AClassWithColaborators.senecaService(c1, c2));
        client = AClassWithColaborators.client(seneca);
        seneca.ready(done);
      });
      afterEach( () => {
         //console.log(senecaError);
      });
      it('Should respond on seneca invocations withCallback(cb)', (done) => {
        client.withCallback((err, result) => {
          c2.log2.should.have.been.calledWith("withCallback");
          result.data.should.be.equal('withCallback');
          done();
        });
      });
      it('Should respond on seneca invocations withNoArgs ()', (done) => {
        client.withNoArgs((err, result) => {
          c2.log2.should.have.been.calledWith("withNoArgs");
          done();
        });
      });
      it('Should respond on seneca invocations withOneArgAndCallbackError (arg, callback)', (done) => {
        client.withOneArgAndCallbackError('anyArg', (err, result) => {
          err.details['orig$'].code.should.be.equal('Some Error');
          c2.log2.should.have.been.calledWith("withOneArgAndCallbackError");
          done();
        });
      });
      it('Should respond on seneca  invocations withOneArgAndCallback (arg, callback)', (done) => {
        client.withOneArgAndCallback('anyArg', (err, result) => {
          c2.log2.should.have.been.calledWith("withOneArgAndCallback");
          result.data.should.be.equal('anyArg');
          done();
        });
      });
    });
  });
});
