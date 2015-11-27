/* jshint -W101, -W106 */

var dispatcher,
    callbackA,
    callbackB;

var mockCallback = function( name ) {
    var funcs = {};
    funcs[name] = [];
    var func = function( payload ) {
        funcs[name].push( payload );
    };
    func.calls = funcs[name];
    func.reset = function(){
        this.calls = [];
    };
    return func;
};

var stringMockCallback = function(action, name) {

    var funcs = {};
    funcs[name] = {};
    funcs[name][action] = [];

    var func = function(payload) {
        if (payload.type === action && funcs[name][action]) {
            funcs[name][action].push(payload);
        }
    };

    func.calls = funcs[name][action];
    func.reset = function() {
        this.calls = [];
    };

    return func;
};

var setup = function() {
    dispatcher = new MeteorFlux.Dispatcher();
    callbackA = mockCallback("A");
    callbackB = mockCallback("B");
};

var stringSetup = function() {
    dispatcher = new MeteorFlux.Dispatcher();
    callbackA = stringMockCallback("actionA", "A");
    callbackB = stringMockCallback("actionB", "B");
};

var teardown = function() {
    dispatcher = null;
    callbackA = null;
    callbackB = null;
};

Tinytest.add('MeteorFlux - Tests - Test mock callback functions', function(test) {
    setup();

    test.equal( typeof callbackA, "function");
    test.equal( typeof callbackA.calls, "object");

    var payload = {};
    callbackA(payload);
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);

    var payload_2 = {};
    callbackA(payload_2);
    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], payload_2);

    callbackA.reset();
    test.equal(callbackA.calls.length, 0);

    teardown();
});

Tinytest.add('MeteorFlux - Tests - Test mock string callback functions', function(test) {
    stringSetup();

    test.equal( typeof callbackA, "function");
    test.equal( typeof callbackA.calls, "object");

    var payload = {type: 'actionA'};
    callbackA(payload);
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);

    var payload_2 = {type: 'actionA'};
    callbackA(payload_2);
    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], payload_2);

    callbackA.reset();
    test.equal(callbackA.calls.length, 0);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should be prototype of dispatcher', function (test) {
    setup();

    test.isTrue(MeteorFlux.Dispatcher.prototype.isPrototypeOf(dispatcher));

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should reset correctly', function (test) {
    setup();

    dispatcher._callbacks[0] = 1;
    dispatcher._isPending[0] = 1;
    dispatcher._isHandled[0] = 1;
    dispatcher._isDispatching = true;
    dispatcher._pendingPayload = 1;

    test.equal(dispatcher._callbacks[0], 1);
    test.equal(dispatcher._isPending[0], 1);
    test.equal(dispatcher._isHandled[0], 1);
    test.equal(dispatcher._isDispatching, true);
    test.equal(dispatcher._pendingPayload, 1);

    dispatcher.reset();

    test.equal(dispatcher._callbacks[0], undefined);
    test.equal(dispatcher._isPending[0], undefined);
    test.equal(dispatcher._isHandled[0], undefined);
    test.equal(dispatcher._isDispatching, false);
    test.equal(dispatcher._pendingPayload, null);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should execute all subscriber callbacks', function (test) {
    setup();

    dispatcher.register(callbackA);
    dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch(payload);

    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);

    test.equal(callbackB.calls.length, 1);
    test.equal(callbackB.calls[0], payload);

    var payload_2 = {};
    dispatcher.dispatch(payload_2);

    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], payload_2);

    test.equal(callbackB.calls.length, 2);
    test.equal(callbackB.calls[1], payload_2);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should execute all subscriber callbacks -String call', function (test) {
    stringSetup();

    dispatcher.register(callbackA);
    dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch('actionA', payload);

    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);

    test.equal(callbackB.calls.length, 0);

    var payload_2 = {};
    dispatcher.dispatch('actionA', payload_2);

    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], payload_2);

    test.equal(callbackB.calls.length, 0);

    var payload_3 = {};
    dispatcher.dispatch('actionB', payload_3);

    test.equal(callbackA.calls.length, 2);

    test.equal(callbackB.calls.length, 1);
    test.equal(callbackB.calls[0], payload_3);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should wait for callbacks registered earlier', function (test) {
    setup();

    var tokenA = dispatcher.register(callbackA);

    dispatcher.register(function(payload) {
      dispatcher.waitFor([tokenA]);

      test.equal(callbackA.calls.length, 1);
      test.equal(callbackA.calls[0], payload);

      callbackB(payload);
    });

    var payload = {};
    dispatcher.dispatch(payload);

    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);

    test.equal(callbackB.calls.length, 1);
    test.equal(callbackB.calls[0], payload);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should wait for callbacks registered later', function (test) {
    setup();

    dispatcher.register(function(payload) {
      dispatcher.waitFor([tokenB]);

      test.equal(callbackB.calls.length, 1);
      test.equal(callbackB.calls[0], payload);

      callbackA(payload);
    });

    var tokenB = dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch(payload);

    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);

    test.equal(callbackB.calls.length, 1);
    test.equal(callbackB.calls[0], payload);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should throw if dispatch() while dispatching', function (test) {
    setup();

    dispatcher.register(function(payload) {
      dispatcher.dispatch(payload);
      callbackA();
    });

    var payload = {};
    var error = false;

    try {
        (function() { dispatcher.dispatch(payload); }());
    } catch( e ) {
        error = e.error;
    }

    test.notEqual(error, false);
    test.equal(error, 'dispatcher-cant-dispatch-while-dispatching');

    test.equal(callbackA.calls.length, 0);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should throw if waitFor() with invalid token', function (test) {
    setup();

    var invalidToken = 1337;

    dispatcher.register(function() {
      dispatcher.waitFor([invalidToken]);
    });

    var payload = {};
    var error = false;

    try {
        (function() { dispatcher.dispatch(payload); }());
    } catch( e ) {
        error = e.error;
    }

    test.notEqual(error, false);
    test.equal(error, 'dispatcher-waitfor-invalid-token');

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should throw on self-circular dependencies', function (test) {
    setup();

    var tokenA = dispatcher.register(function(payload) {
      dispatcher.waitFor([tokenA]);
      callbackA(payload);
    });

    var payload = {};
    var error = false;

    try {
        (function() { dispatcher.dispatch(payload); }());
    } catch( e ) {
        error = e.error;
    }

    test.notEqual(error, false);
    test.equal(error, 'dispatcher-waitfor-circular-dependency');

    test.equal(callbackA.calls.length, 0);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should throw on multi-circular dependencies', function (test) {
    setup();

    var tokenA = dispatcher.register(function(payload) {
      dispatcher.waitFor([tokenB]);
      callbackA(payload);
    });

    var tokenB = dispatcher.register(function(payload) {
      dispatcher.waitFor([tokenA]);
      callbackB(payload);
    });

    var payload = {};
    var error = false;

    try {
        (function() { dispatcher.dispatch(payload); }());
    } catch( e ) {
        error = e.error;
    }

    test.notEqual(error, false);
    test.equal(error, 'dispatcher-waitfor-circular-dependency');

    test.equal(callbackA.calls.length, 0);
    test.equal(callbackB.calls.length, 0);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should remain in a consistent state after a failed dispatch', function (test) {
    setup();

    dispatcher.register(callbackA);
    dispatcher.register(function(payload) {
      if (payload.shouldThrow) {
        throw new Meteor.Error();
      }
      callbackB();
    });

    var error = false;

    try {
        (function() { dispatcher.dispatch({shouldThrow: true}); }());
    } catch( e ) {
        error = e;
    }

    test.notEqual(error, false);

    // Cannot make assumptions about a failed dispatch.
    var callbackACount = callbackA.calls.length;

    dispatcher.dispatch({shouldThrow: false});

    test.equal(callbackA.calls.length, callbackACount + 1);
    test.equal(callbackB.calls.length, 1);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should properly unregister callbacks', function (test) {
    setup();

    dispatcher.register(callbackA);

    var tokenB = dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch(payload);

    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);

    test.equal(callbackB.calls.length, 1);
    test.equal(callbackB.calls[0], payload);

    dispatcher.unregister(tokenB);

    var payload_2 = {};
    dispatcher.dispatch(payload_2);

    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], payload_2);

    test.equal(callbackB.calls.length, 1);

    teardown();
});


Tinytest.add('MeteorFlux - Dispatcher - It could be called with string as first argument', function (test) {
    setup();

    dispatcher.register(callbackA);
    dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch('action', payload);

    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);
    test.equal(payload, { type: 'action' });

    test.equal(callbackB.calls.length, 1);
    test.equal(callbackB.calls[0], payload);

    var payload_2 = { data: 'data' };
    dispatcher.dispatch('action2', payload_2);

    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], payload_2);
    test.equal(payload_2, { data: 'data', type: 'action2' });

    test.equal(callbackB.calls.length, 2);
    test.equal(callbackB.calls[1], payload_2);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It could register with string as first argument', function (test) {
    setup();

    dispatcher.register('action', callbackA);
    dispatcher.register('action2', callbackB);

    var payload = {};
    dispatcher.dispatch('action', payload);

    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);

    test.equal(callbackB.calls.length, 0);

    var payload_2 = { data: 'data' };
    dispatcher.dispatch('action2', payload_2);

    test.equal(callbackA.calls.length, 1);

    test.equal(callbackB.calls.length, 1);
    test.equal(callbackB.calls[0], payload_2);

    teardown();
});

Tinytest.add('MeteorFlux - Dispatcher - It should only dipatch if next is called in every dispatch filter', function (test) {
    setup();

    dispatcher.register('action', callbackA);
    dispatcher.addDispatchFilter(function (dispatch) {
        return function (payload, next) {
            if (payload.skip !== true) {
                next(payload);
            }
        }
    });

    dispatcher.addDispatchFilter(function (dispatch) {
        return function (payload, next) {
            if (payload.abort !== true) {
                next(payload);
            }
        }
    });

    dispatcher.dispatch('action', { some: 'payload' });
    dispatcher.dispatch('action', { skip: true });
    dispatcher.dispatch('action', { abort: true });
    test.equal(callbackA.calls.length, 1);
});
