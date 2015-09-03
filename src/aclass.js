'use strict';
import SenecaService from './SenecaService';

@SenecaService({role: "some.api"})
class AClass {
    constructor () {
    }

    test (someArg) {
        console.log('a class test');
    }
}

export default AClass;
