
var _lastID = 1;
var _prefix = 'ID_';

var invariant = function(condition, errorMessage, format, a, b, c, d, e, f) {
  if (!condition) {
    var error;
    if ((format === undefined)||(errorMessage === undefined)) {
      error = new Meteor.Error(
        'minified-exception',
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Meteor.Error(
        errorMessage,
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }
    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

/**
* MeteorFlux.Dispatcher is used to broadcast payloads to registered callbacks.
*/

MeteorFlux.Dispatcher = function(){
  this._callbacks = {};
  this._isPending = {};
  this._isHandled = {};
  this._isDispatching = false;
  this._dispatchFilters = [];
  this._registerFilters = [];
  this._pendingPayload = null;
};


/**
* Registers a callback to be invoked with every dispatched payload. Returns
* a token that can be used with `waitFor()`.
*
* @param {function} callback
* @return {string}
*/
MeteorFlux.Dispatcher.prototype.register = function(/* arguments */) {
  var callback = this._curateCallback.apply(this, arguments);

  var callbackChain = this._registerFilters.reduceRight(function (next, filter) {
    return function (payload) {
      return filter(payload, next);
    }
  }, callback);

  var id = _prefix + _lastID++;
  this._callbacks[id] = callbackChain;
  return id;
};

/**
* Removes a callback based on its token.
*
* @param {string} id
*/
MeteorFlux.Dispatcher.prototype.unregister = function(id) {
  invariant(
    this._callbacks[id],
    'dispatcher-unregister-not-map',
    'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
    id
  );
  delete this._callbacks[id];
};

/**
* Waits for the callbacks specified to be invoked before continuing execution
* of the current callback. This method should only be used by a callback in
* response to a dispatched payload.
*
* @param {array<string>} ids
*/
MeteorFlux.Dispatcher.prototype.waitFor = function(ids) {
  invariant(
    this._isDispatching,
    'dispatcher-waitfor-invoked-outside-dispatch',
    'Dispatcher.waitFor(...): Must be invoked while dispatching.'
  );
  for (var ii = 0; ii < ids.length; ii++) {
    var id = ids[ii];
    if (this._isPending[id]) {
      invariant(
        this._isHandled[id],
        'dispatcher-waitfor-circular-dependency',
        'Dispatcher.waitFor(...): Circular dependency detected while ' +
        'waiting for `%s`.',
        id
      );
      continue;
    }
    invariant(
      this._callbacks[id],
      'dispatcher-waitfor-invalid-token',
      'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
      id
    );
    this._invokeCallback(id);
  }
};

/**
* Dispatches a payload to all registered callbacks.
*
* @param {object} payload
*/
MeteorFlux.Dispatcher.prototype.dispatch = function(/* arguments */) {
  var payload = this._curatePayload.apply(this, arguments);
  var dispatch = this._dispatch;

  var dispatchChain = this._dispatchFilters.reduceRight(function (next, filter) {
    return function (dispatch) {
      return filter(payload, next);
    }
  }, this._dispatch.bind(this));

  dispatchChain(payload);
};

MeteorFlux.Dispatcher.prototype._dispatch = function(payload) {
  invariant(
    !this._isDispatching,
    'dispatcher-cant-dispatch-while-dispatching',
    'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
  );

  this._startDispatching(payload);
  try {
    for (var id in this._callbacks) {
      if (this._isPending[id]) {
        continue;
      }
      this._invokeCallback(id);
    }
  } finally {
    this._stopDispatching();
  }
};

/**
* Registers a filter to be invoked before the dispatch begins. It can alter
* the payload.
*
* @param {function} callback
*/
MeteorFlux.Dispatcher.prototype.addDispatchFilter = function(filter) {
  this._dispatchFilters.push(filter(this._dispatch.bind(this)));
};

/**
* Registers a filter to be invoked when the register is called. It can alter
* the callback.
*
* @param {function} callback
*/
MeteorFlux.Dispatcher.prototype.addRegisterFilter = function(filter) {
  this._registerFilters.push(filter);
};

/**
* Is this MeteorFlux.Dispatcher currently dispatching.
*
* @return {boolean}
*/
MeteorFlux.Dispatcher.prototype.isDispatching = function() {
  return this._isDispatching;
};

/**
* Call the callback stored with the given id. Also do some internal
* bookkeeping.
*
* @param {string} id
* @internal
*/
MeteorFlux.Dispatcher.prototype._invokeCallback = function(id) {
  this._isPending[id] = true;
  this._callbacks[id](this._pendingPayload);
  this._isHandled[id] = true;
};

/**
* Set up bookkeeping needed when dispatching.
*
* @param {object} payload
* @internal
*/
MeteorFlux.Dispatcher.prototype._startDispatching = function(payload) {

  for (var id in this._callbacks) {
    this._isPending[id] = false;
    this._isHandled[id] = false;
  }
  this._pendingPayload = payload;
  this._isDispatching = true;
};

/**
* Clear bookkeeping used for dispatching.
*
* @internal
*/
MeteorFlux.Dispatcher.prototype._stopDispatching = function() {
  this._pendingPayload = null;
  this._isDispatching = false;
};

/**
* Curate the payload. If the user uses the first argument as string, use it
* as action type and include it in the payload.
*
* @internal
*/
MeteorFlux.Dispatcher.prototype._curatePayload = function(/* arguments */) {
  if (typeof arguments[0] === 'string') {
    var action = arguments[1] || {};
    action.type = arguments[0];
    return action;
  } else {
    return arguments[0];
  }
};

/**
* Curate the payload. If the user uses the first argument as string, use it
* as action type and include it in the payload.
*
* @internal
*/
MeteorFlux.Dispatcher.prototype._curateCallback = function(/* arguments */) {
  if (typeof arguments[0] === 'string') {
    var type = arguments[0];
    var func = arguments[1];
    return function(action) {
      if (action.type === type)
        func(action);
    };
  } else {
    return arguments[0];
  }
};

/**
* Reset everything. Created for testing purposes
*
*/
MeteorFlux.Dispatcher.prototype.reset = function() {
  this._callbacks = {};
  this._isPending = {};
  this._isHandled = {};
  this._registerFilters = [];
  this._dispatchFilters = [];
  this._isDispatching = false;
  this._pendingPayload = null;
};

/**
* The main Dispatcher instance that clients will deal with
*
* @exports Dispatcher
*/

Dispatcher = new MeteorFlux.Dispatcher();
