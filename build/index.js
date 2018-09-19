/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 44);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var Buff = __webpack_require__(1);

exports.buildStartEndAddress = function buildStartEndAddress(start, end) {
	var buffer = Buff.alloc(4);

	buffer.writeUInt16BE(start, 0);
	buffer.writeUInt16BE(end - start + 1, 2);

	return buffer;
};

exports.buildAddressQuantity = function buildAddressQuantity(address, quantity) {
	var buffer = Buff.alloc(4);

	buffer.writeUInt16BE(address, 0);
	buffer.writeUInt16BE(quantity, 2);

	return buffer;
};

exports.buildEmpty = function buildEmpty() {
	return Buff.alloc(0);
};

exports.parseStartEndAddress = function parseStartEndAddress(buffer) {
	if (buffer.length < 4) return null;

	return {
		start : buffer.readUInt16BE(0),
		end   : buffer.readUInt16BE(0) + buffer.readUInt16BE(2) - 1
	};
};

exports.parseAddressQuantity = function parseAddressQuantity(buffer) {
	if (buffer.length < 4) return null;

	return {
		address  : buffer.readUInt16BE(0),
		quantity : buffer.readUInt16BE(2)
	};
};

exports.parseAddressValue = function parseAddressValue(buffer) {
	if (buffer.length < 4) return null;

	return {
		address : buffer.readUInt16BE(0),
		value   : buffer.slice(2, 4)
	};
};

exports.parseEmpty = function parseEmpty() {
	return {};
};

exports.numberToBuffer = function numberToBuffer(number) {
	if (number instanceof Buffer) {
		return number;
	}

	var buffer = Buff.alloc(2);

	buffer.writeUInt16BE(number, 0);

	return buffer;
}

exports.bitsToBuffer = function bitsToBuffer(bits) {
	if (bits == null || bits.length > 2040) {
		throw new Error("Buffer overflow, bit length is out of bounds");
	}

	var buffer = Buff.alloc(Math.ceil(bits.length / 8) + 1);
	var i;

	buffer.fill(0x00);
	buffer[0] = buffer.length - 1;

	for (var index = 0; index < bits.length; index++) {
		i = Math.floor(index / 8) + 1;

		buffer[i] >>= 1;
		if (bits[index]) {
			buffer[i] |= 0x80;
		}
	}

	i = bits.length - (Math.floor(bits.length / 8) * 8);
	if (i > 0) {
		i = 8 - i;
		while (i > 0) {
			buffer[buffer.length - 1] >>= 1;
			i -= 1;
		}
	}

	return buffer;
};

exports.blocksToBuffer = function blocksToBuffer(blocks) {
	if (Buffer.isBuffer(blocks)) {
		var buffer = Buff.alloc(blocks.length + 1);

		buffer[0] = blocks.length;

		blocks.copy(buffer, 1);

		return buffer;
	}

	var buffer = Buff.alloc((blocks.length * 2) + 1);

	buffer.writeUInt8(blocks.length * 2, 0);

	for (var i = 0; i < blocks.length; i++) {
		if (blocks[i].length < 2) {
			buffer[(i * 2) + 1] = 0;
			buffer[(i * 2) + 2] = 0;
		}

		blocks[i].copy(buffer, (i * 2) + 1, 0, 2);
	}

	return buffer;
};

exports.bufferToBits = function bufferToBits(buffer) {
	var bits = [];

	for (var i = 1; i < Math.min(buffer.length, buffer[0] + 1); i++) {
		for (var j = 0; j < 8; j++) {
			bits.push((buffer[i] & (1 << j)) ? 1 : 0);
		}
	}

	return bits;
};

exports.bufferToBlocks = function bufferToBlocks(buffer) {
	if (buffer.length === 0) return null;

	var total  = buffer.readUInt8(0) / 2;
	var blocks = [];

	for (var i = 0; i < total; i++) {
		blocks.push(Buff.from([ buffer[(i * 2) + 1], buffer[(i * 2) + 2] ]));
	}

	return blocks;
};

exports.copyBufferBlocks = function copyBufferBlocks(buffer, values, offset) {
	for (var i = 0; i < values.length; i++) {
		values[i].copy(buffer, offset + (i * 2), 0, 2);
	}
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

exports.alloc = function (size) {
	if (typeof Buffer.alloc == "function") {
		return Buffer.alloc(size);
	}

	return new Buffer(size);
};

exports.from = function (data, encoding) {
	if (typeof Buffer.from == "function") {
		return Buffer.from(data, encoding);
	}

	return new Buffer(data, encoding);
};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__dirname) {var fs        = __webpack_require__(6);
var util      = __webpack_require__(2);
var path      = __webpack_require__(16);
var Exception = __webpack_require__(47);
var Helpers   = __webpack_require__(0);
var Buff      = __webpack_require__(1);

load();

exports.Exception = Exception;
exports.Package   = function (fcode, data) {
	var buffer = Buff.alloc(data.length + 1);

	buffer.writeUInt8(fcode, 0);
	Buff.from(data).copy(buffer, 1);

	return buffer;
};

exports.Helpers = {
	blocksToBuffer : Helpers.blocksToBuffer,
	bitsToBuffer   : Helpers.bitsToBuffer,

	bufferToBlocks : Helpers.bufferToBlocks,
	bufferToBits   : Helpers.bufferToBits,
};

Exception.load(exports);

function load() {
	var files = fs.readdirSync(path.resolve(__dirname, "protocol"));

	files.map(function (file) {
		if (file.substr(file.length - 3) !== ".js") return;

		var funct     = __webpack_require__(48)("./" + file);
		var camelName = file[0].toUpperCase() + file.substr(1, file.length - 4).toLowerCase().replace(/_(\w)/g, function (m, c) {
			return c.toUpperCase();
		});

		exports[camelName] = {
			Code     : funct.code,
			Request  : {
				build : proxy(funct, "buildRequest"),
				parse : function (buffer) {
					// byte 1 is function code
					return funct.parseRequest(buffer.slice(1));
				}
			},
			Response : {
				build : proxy(funct, "buildResponse"),
				parse : function (buffer) {
					// byte 1 is function code
					return funct.parseResponse(buffer.slice(1));
				}
			}
		};
	});

	exports.Request = function (buffer) {
		var code = buffer.readUInt8(0);

		for (var k in exports) {
			if (typeof exports[k] === "object" && exports[k].Code === code) {
				var data = exports[k].Request.parse(buffer);

				if (typeof data === "object" && !util.isArray(data) && data !== null) {
					data.code = k;
				} else {
					data = { code: k, data: data };
				}

				return data;
			}
		}

		return {
			code : buffer[0],
			data : buffer.slice(1)
		};
	};

	exports.Response = function (buffer) {
		var code = buffer.readUInt8(0);

		if (code & 0x80) {
			return Exception.parse(buffer);
		}

		for (var k in exports) {
			if (typeof exports[k] === "object" && exports[k].Code === code) {
				var data = exports[k].Response.parse(buffer);

				if (typeof data === "object" && !util.isArray(data) && data !== null) {
					data.code = k;
				} else {
					data = { code: k, data: data };
				}

				return data;
			}
		}

		return {
			code : buffer[0],
			data : buffer.slice(1)
		};
	};
}

function proxy(funct, method) {
	return function () {
		var stream = funct[method].apply(funct, arguments);
		var buffer = Buff.alloc(stream.length + 1);

		buffer[0] = funct.code;

		stream.copy(buffer, 1);

		return buffer;
	};
}

/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

exports.alloc = function (size) {
	if (typeof Buffer.alloc == "function") {
		return Buffer.alloc(size);
	}

	return new Buffer(size);
};

exports.from = function (data, encoding) {
	if (typeof Buffer.from == "function") {
		return Buffer.from(data, encoding);
	}

	return new Buffer(data, encoding);
};

exports.values = function (buf) {
	var v = [];

	for (var i = 0; i < buf.length; i++) {
		v.push(buf[i]);
	}

	return v;
};

exports.concat = function (list) {
	return Buffer.concat(list);
};

exports.indexOf = function (buf, val, offset) {
	if (typeof buf.indexOf === "function") {
		return buf.indexOf(val, offset);
	}

	for (var i = (offset || 0); i < buf.length - val.length + 1; i++) {
		if (buf[i] != val[0]) continue;

		for (var j = 1; j < val.length; j++) {
			if (buf[i + j] != val[j]) break;
		}

		if (j == val.length) return i;
	}

	return -1;
};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */
if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
  module.exports = __webpack_require__(61);
} else {
  module.exports = __webpack_require__(63);
}



/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__filename) {
/**
 * Module dependencies.
 */

var fs = __webpack_require__(6)
  , path = __webpack_require__(16)
  , join = path.join
  , dirname = path.dirname
  , exists = ((fs.accessSync && function (path) { try { fs.accessSync(path); } catch (e) { return false; } return true; })
      || fs.existsSync || path.existsSync)
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }

  // maps `defaults` onto `opts` object
  Object.keys(defaults).map(function(i) {
    if (!(i in opts)) opts[i] = defaults[i];
  });

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? /*require.resolve*/(!(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())) : !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, "/index.js"))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var util         = __webpack_require__(2);
var buffer       = __webpack_require__(5);
var EventEmitter = __webpack_require__(11).EventEmitter;

function Stream(transport, options) {
	EventEmitter.call(this);

	options = options || {};

	this.transport = transport;

	var stream = this;

	if (options.debug !== null) {
		this.debugger = function (mode, data) {
			var bytes = buffer.values(data);

			if (options.debugdate === false) {
				process.stderr.write(util.format("%s %s 0x[ %s ]\n", mode, options.debug, bytes.map(function (byte) { return padStart(byte.toString(16).toUpperCase(), 2, "0"); }).join(", ") ));
			} else {
				process.stderr.write(util.format("%s %s %s 0x[ %s ]\n", (new Date).toISOString(), mode, options.debug, bytes.map(function (byte) { return padStart(byte.toString(16).toUpperCase(), 2, "0"); }).join(", ") ));
			}
		};

		this.transport.on("incoming-data", function (data) {
			stream.debugger(options.debuginvert ? "<<" : ">>", data);
		});
		this.transport.on("outgoing-data", function (data) {
			stream.debugger(options.debuginvert ? ">>" : "<<", data);
		});
	} else {
		this.debugger = false;
	}

	this.transport.on("error", function (error) {
		stream.emit("error", error);
	});

	this.transport.on("close", function () {
		stream.emit("close");
	});

	this.transport.on("request", function (fcode, req, reply) {
		stream.emit(fcode, req, reply);
	});
}
util.inherits(Stream, EventEmitter);

Stream.prototype.close = function (next) {
	this.transport.close(next);
};

Stream.prototype.write = function (data, options, next) {
	if (typeof options == "function") {
		next    = options;
		options = {};
	}

	this.transport.write(this.transport.wrap(data, options, next));
};
// function code 0x01
Stream.prototype.readCoils = function (options, next) {
	options = options || {};

	var address  = (typeof options.address != "undefined" ? options.address : 0);
	var quantity = (typeof options.quantity != "undefined" ? options.quantity : 1);
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadCoils", extra, next, address, quantity);
};
// function code 0x02
Stream.prototype.readDiscreteInputs = function (options, next) {
	options = options || {};

	var address  = (typeof options.address != "undefined" ? options.address : 0);
	var quantity = (typeof options.quantity != "undefined" ? options.quantity : 1);
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadDiscreteInputs", extra, next, address, quantity);
};
// function code 0x03
Stream.prototype.readHoldingRegisters = function (options, next) {
	options = options || {};

	var address  = (typeof options.address != "undefined" ? options.address : 0);
	var quantity = (typeof options.quantity != "undefined" ? options.quantity : 1);
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadHoldingRegisters", extra, next, address, quantity);
};
// function code 0x04
Stream.prototype.readInputRegisters = function (options, next) {
	options = options || {};

	var address  = (typeof options.address != "undefined" ? options.address : 0);
	var quantity = (typeof options.quantity != "undefined" ? options.quantity : 1);
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadInputRegisters", extra, next, address, quantity);
};
// function code 0x05
Stream.prototype.writeSingleCoil = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var value   = (typeof options.value != "undefined" ? options.value : 0);
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("WriteSingleCoil", extra, next, address, value);
};
// function code 0x06
Stream.prototype.writeSingleRegister = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var value   = (typeof options.value != "undefined" ? options.value : buffer.from([ 0, 0 ]));
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("WriteSingleRegister", extra, next, address, value);
};
// function code 0x07
Stream.prototype.readExceptionStatus = function (options, next) {
	options = options || {};

	var extra = options.extra || {};
	var next  = next || null;

	this.transport.send("ReadExceptionStatus", extra, next);
};
// function code 0x0B
Stream.prototype.getCommEventCounter = function (options, next) {
	options = options || {};

	var extra = options.extra || {};
	var next  = next || null;

	this.transport.send("GetCommEventCounter", extra, next);
};
// function code 0x0C
Stream.prototype.getCommEventLog = function (options, next) {
	options = options || {};

	var extra = options.extra || {};
	var next  = next || null;

	this.transport.send("GetCommEventLog", extra, next);
};
// function code 0x0F
Stream.prototype.writeMultipleCoils = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var values  = (typeof options.values != "undefined" ? options.values : []);
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("WriteMultipleCoils", extra, next, address, values);
};
// function code 0x10
Stream.prototype.writeMultipleRegisters = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var values  = (typeof options.values != "undefined" ? options.values : buffer.from([ 0, 0 ]));
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("WriteMultipleRegisters", extra, next, address, values);
};
// function code 0x14
Stream.prototype.readFileRecord = function (options, next) {
	options = options || {};

	var requests = options.requests || [];
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadFileRecord", extra, next, requests);
};
// function code 0x15
Stream.prototype.writeFileRecord = function (options, next) {
	options = options || {};

	var requests = options.requests || [];
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("WriteFileRecord", extra, next, requests);
};
// function code 0x16
Stream.prototype.maskWriteRegister = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var andmask = (typeof options.andmask != "undefined" ? options.andmask : 0xFFFF);
	var ormask  = (typeof options.ormask != "undefined" ? options.ormask : 0x0000);
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("MaskWriteRegister", extra, next, address, andmask, ormask);
};
// function code 0x17
Stream.prototype.readWriteMultipleRegisters = function (options, next) {
	options = options || {};

	var read_address  = (typeof options.read_address != "undefined" ? options.read_address : 0);
	var read_quantity = (typeof options.read_quantity != "undefined" ? options.read_quantity : 1);
	var write_address = (typeof options.write_address != "undefined" ? options.write_address : 0);
	var values        = (typeof options.values != "undefined" ? options.values : buffer.from([ 0, 0 ]));
	var extra         = options.extra || {};
	var next          = next || null;

	this.transport.send("ReadWriteMultipleRegisters", extra, next, read_address, read_quantity, write_address, values);
};
// function code 0x18
Stream.prototype.readFifoQueue = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("ReadFifoQueue", extra, next, address);
};
// function code 0x2B / 0x0E
Stream.prototype.readDeviceIdentification = function (options, next) {
	options = options || {};

	var type  = (typeof options.type != "undefined" ? options.type : "BasicDeviceIdentification");
	var id    = (typeof options.id != "undefined" ? options.id : "ProductName");
	var extra = options.extra || {};
	var next  = next || null;

	this.transport.send("ReadDeviceIdentification", extra, next, type, id);
};

module.exports = Stream;

function padStart(str, len, c) {
	len = len >> 0;

	if (str.length > len) return str;

	if (typeof c == "undefined") c = " ";

	len = len - str.length;
	if (len > c.length) {
		c += c.repeat(len / c.length);
	}

	return c.slice(0, len) + str;
}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var pdu          = __webpack_require__(4);
var util         = __webpack_require__(2);
var buffer       = __webpack_require__(5);
var EventEmitter = __webpack_require__(11).EventEmitter;

function BaseTransport(stream, options) {
	EventEmitter.call(this);

	options = options || {};

	this.stream        = stream;
	this.retries       = (options.retries > 0 ? options.retries : 0);
	this.retry         = (options.retry > 0 ? options.retry : 500);
	this.beforerequest = (typeof options.beforerequest == "function" ? options.beforerequest : null);
	this.afterrequest  = (typeof options.afterrequest == "function" ? options.afterrequest : null);
	this.mutex         = (typeof options.mutex != "undefined" ? options.mutex : false);
	this.retryTimer    = {};
	this.closed        = false;

	this.stream.on("error", function (err) {
		this.emit("error", err);
	}.bind(this));

	setTimeout(function () {
		this.listen();
	}.bind(this), 0);
}
util.inherits(BaseTransport, EventEmitter);

BaseTransport.prototype.close = function (next) {
	this.closed = true;

	this.stream.close(next);
};

BaseTransport.prototype.write = function (data, next) {
	this.emit("outgoing-data", data);

	if (typeof this.stream.drain == "function") {
		this.stream.write(data);

		if (typeof next == "function") {
			this.stream.drain(next);
		}
	} else {
		this.stream.write(data, next);
	}
};

BaseTransport.prototype.send = function (fcode, extra, next) {
	if (this.closed) {
		var err = new Error("Transport stream has already been closed");
		err.code = "ECLOSED";

		return next(err);
	}

	var data = Array.prototype.slice.call(arguments, 3);

	if (this.mutex) {
		var transport = this;

		this.mutex.lock(function (unlock) {
			var done = function () {
				unlock();
				next.apply(null, arguments);
			};

			transport.retrySend(transport.wrap(pdu[fcode].Request.build.apply(pdu[fcode].Request, data), extra, done), transport.retries, transport.retry, done);
		})
	} else {
		this.retrySend(this.wrap(pdu[fcode].Request.build.apply(pdu[fcode].Request, data), extra, next), this.retries, this.retry, next);
	}
};

BaseTransport.prototype.retrySend = function (data, retries, retry, next) {
	var transport = this;

	call_queue(this.beforerequest, function () {
		transport.write(data, function () {
			call_queue(transport.afterrequest, function () {
				var k = data.__callback_key || "-";

				if (retries > 0) {
					transport.retryTimer[k] = setTimeout(function () {
						transport.clearSend();
						transport.retrySend(data, retries - 1, retry, next);
					}, retry);
				} else {
					transport.retryTimer[k] = setTimeout(function () {
						delete transport.retryTimer[k];

						return next(pdu.Exception.error("GatewayTargetDeviceFailedToRespond"));
					}, retry);
				}
			});
		});
	});
};

BaseTransport.prototype.clearSend = function () {
	// Transports should rewrite this method
	// if they need to reset anything before
	// retrying
};

BaseTransport.prototype.listen = function () {
	var transport = this;
	var handle    = function (data) {
		var req = transport.unwrap(data);

		// not complete
		if (req === false) return;

		var k = req.__callback_key || "-";

		if (typeof transport.retryTimer[k] != "undefined") {
			clearTimeout(transport.retryTimer[k]);
			delete transport.retryTimer[k];
		}

		if (typeof req.callback == "function") {
			try {
				req.response = pdu.Response(req.pdu);

				if (typeof req.response.exception != "undefined") {
					req.callback(new Error(req.response.exception), req);
				} else {
					req.callback(null, req);
				}

				delete req.callback;
			} catch (err) {
				transport.emit("error", err);
			}
		} else {
			try {
				req.request = pdu.Request(req.pdu);

				if (typeof req.request.code == "number") {
					// unknown function code
					transport.emit("request", req.request.code, req, function (err) {
						var data = Array.prototype.slice.call(arguments, 1);

						if (err instanceof Error) {
							return transport.write(transport.wrap(pdu.Exception.build(req.request.code, err.code || +err.message), req));
						} else if (typeof err == "string" && err.length > 0) {
							return transport.write(transport.wrap(pdu.Exception.build(req.request.code, pdu.Exception[err]), req));
						}

						transport.write(transport.wrap(buffer.concat([ buffer.from([ req.request.code ]) ].concat(data)), req));
					});
				} else {
					var event_name = req.request.code.replace(/(.)([A-Z])/g, function (m, b, l) { return b + "-" + l}).toLowerCase();

					transport.emit("request", event_name, req, function (err) {
						var data = Array.prototype.slice.call(arguments, 1);

						if (err instanceof Error) {
							return transport.write(transport.wrap(pdu[req.request.code].Exception.build(err.code || +err.message), req));
						} else if (typeof err == "string" && err.length > 0) {
							return transport.write(transport.wrap(pdu[req.request.code].Exception.build(pdu.Exception[err]), req));
						}

						transport.write(transport.wrap(pdu[req.request.code].Response.build.apply(pdu[req.request.code].Response, data), req));
					});
				}
			} catch (err) {
				transport.emit("error", err);
			}
		}

		// transport should expose this method if it can
		// handle data bursts with multiple packages
		if (typeof transport.pending == "function" && transport.pending()) {
			handle(buffer.alloc(0));
		}
	};

	this.stream.on("data", function (data) {
		transport.emit("incoming-data", data);

		handle(data);
	});
};

module.exports = BaseTransport;

function call_queue(fn, next) {
	if (typeof fn != "function") return next();

	return fn(next);
}


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("tty");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const os = __webpack_require__(58);
const hasFlag = __webpack_require__(59);

const env = process.env;

const support = level => {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
};

let supportLevel = (() => {
	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false')) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		return 1;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return 0;
	}

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return 0;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Hyper':
				return 3;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return 0;
	}

	return 0;
})();

if ('FORCE_COLOR' in env) {
	supportLevel = parseInt(env.FORCE_COLOR, 10) === 0 ? 0 : (supportLevel || 1);
}

module.exports = process && support(supportLevel);


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(65)('@serialport/binding-abstract')

/**
 * @name Binding
 * @type {AbstractBinding}
 * @since 5.0.0
 * @description The `Binding` is how Node-SerialPort talks to the underlying system. By default, we auto detect Windows, Linux and OS X, and load the appropriate module for your system. You can assign `SerialPort.Binding` to any binding you like. Find more by searching at [npm](https://npmjs.org/).
  Prevent auto loading the default bindings by requiring SerialPort with:
  ```js
  var SerialPort = require('@serialport/stream');
  SerialPort.Binding = MyBindingClass;
  ```
 */

/**
 * You never have to use `Binding` objects directly. SerialPort uses them to access the underlying hardware. This documentation is geared towards people who are making bindings for different platforms. This class can be inherited from to get type checking for each method.
 * @class AbstractBinding
 * @param {object} options options for the biding
 * @property {boolean} isOpen Required property. `true` if the port is open, `false` otherwise. Should be read-only.
 * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
 * @since 5.0.0
 */
class AbstractBinding {
  /**
   * Retrieves a list of available serial ports with metadata. The `comName` must be guaranteed, and all other fields should be undefined if unavailable. The `comName` is either the path or an identifier (eg `COM1`) used to open the serialport.
   * @returns {Promise} resolves to an array of port [info objects](#module_serialport--SerialPort.list).
   */
  static list() {
    debug('list')
    return Promise.resolve()
  }

  constructor(opt) {
    if (typeof opt !== 'object') {
      throw new TypeError('"options" is not an object')
    }
  }

  /**
   * Opens a connection to the serial port referenced by the path.
   * @param {string} path the path or com port to open
   * @param {openOptions} options openOptions for the serialport
   * @returns {Promise} Resolves after the port is opened and configured.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  open(path, options) {
    if (!path) {
      throw new TypeError('"path" is not a valid port')
    }

    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    debug('open')

    if (this.isOpen) {
      return Promise.reject(new Error('Already open'))
    }
    return Promise.resolve()
  }

  /**
   * Closes an open connection
   * @returns {Promise} Resolves once the connection is closed.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  close() {
    debug('close')
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }

  /**
   * Request a number of bytes from the SerialPort. This function is similar to Node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback) except it will always return at least one byte.

The in progress reads must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

   * @param {buffer} buffer Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @param {integer} offset The offset in the buffer to start writing at.
   * @param {integer} length Specifies the maximum number of bytes to read.
   * @returns {Promise} Resolves with the number of bytes read after a read operation.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  read(buffer, offset, length) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    if (typeof offset !== 'number') {
      throw new TypeError('"offset" is not an integer')
    }

    if (typeof length !== 'number') {
      throw new TypeError('"length" is not an integer')
    }

    debug('read')
    if (buffer.length < offset + length) {
      return Promise.reject(new Error('buffer is too small'))
    }

    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }

  /**
   * Write bytes to the SerialPort. Only called when there is no pending write operation.

The in progress writes must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

   * @param {buffer} buffer - Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @returns {Promise} Resolves after the data is passed to the operating system for writing.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  write(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    debug('write', buffer.length, 'bytes')
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }

  /**
   * Changes connection settings on an open port. Only `baudRate` is supported.
   * @param {object=} options Only supports `baudRate`.
   * @param {number=} [options.baudRate] If provided a baud rate that the bindings do not support, it should pass an error to the callback.
   * @returns {Promise} Resolves once the port's baud rate changes.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  update(options) {
    if (typeof options !== 'object') {
      throw TypeError('"options" is not an object')
    }

    if (typeof options.baudRate !== 'number') {
      throw new TypeError('"options.baudRate" is not a number')
    }

    debug('update')
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }

  /**
   * Set control flags on an open port.
   * @param {object=} options All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. All options are always provided.
   * @param {Boolean} [options.brk=false] flag for brk
   * @param {Boolean} [options.cts=false] flag for cts
   * @param {Boolean} [options.dsr=false] flag for dsr
   * @param {Boolean} [options.dtr=true] flag for dtr
   * @param {Boolean} [options.rts=true] flag for rts
   * @returns {Promise} Resolves once the port's flags are set.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  set(options) {
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    debug('set')
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }

  /**
   * Get the control flags (CTS, DSR, DCD) on the open port.
   * @returns {Promise} Resolves with the retrieved flags.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  get() {
    debug('get')
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }

  /**
   * Get the OS reported baud rate for the open port.
   * Used mostly for debugging custom baud rates.
   * @returns {Promise} Resolves with the current baud rate.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  getBaudRate() {
    debug('getBuadRate')
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }

  /**
   * Flush (discard) data received but not read, and written but not transmitted.
   * @returns {Promise} Resolves once the flush operation finishes.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  flush() {
    debug('flush')
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }

  /**
   * Drain waits until all output data is transmitted to the serial port. An in progress write should be completed before this returns.
   * @returns {Promise} Resolves once the drain operation finishes.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  drain() {
    debug('drain')
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'))
    }
    return Promise.resolve()
  }
}

module.exports = AbstractBinding


/***/ }),
/* 15 */
/***/ (function(module, exports) {

function promisify(func) {
  if (typeof func !== 'function') {
    throw new Error('"func" must be a function')
  }
  return function(...args) {
    return new Promise((resolve, reject) => {
      args.push((err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
      func(...args)
    })
  }
}

module.exports = {
  promisify,
}


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x0B;

exports.buildRequest = Helpers.buildEmpty;
exports.parseRequest = Helpers.parseEmpty;

exports.buildResponse = function (status, event_count) {
	return Buff.from([ status, event_count ]);
};
exports.parseResponse = function (buffer) {
	if (buffer.length < 2) return null;

	return {
		status      : buffer.readUInt8(0),
		event_count : buffer.readUInt8(1)
	};
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x0C;

exports.buildRequest = Helpers.buildEmpty;
exports.parseRequest = Helpers.parseEmpty;

exports.buildResponse = function (status, event_count, message_count, events) {
	var buffer = Buff.alloc(events.length + 7);

	buffer.writeUInt8(buffer.length - 1, 0);
	buffer.writeUInt16BE(status, 1);
	buffer.writeUInt16BE(event_count, 3);
	buffer.writeUInt16BE(message_count, 5);

	events.copy(buffer, 7);

	return buffer;
};
exports.parseResponse = function (buffer) {
	if (buffer.length < 7) return null;

	return {
		status        : buffer.readUInt16BE(1),
		event_count   : buffer.readUInt16BE(3),
		message_count : buffer.readUInt16BE(5),
		events        : buffer.slice(7, buffer.readUInt8(0) + 1)
	};
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x16;

exports.buildRequest = function (address, andmask, ormask) {
	var buffer = Buff.alloc(6);

	buffer.writeUInt16BE(address, 0);

	Helpers.numberToBuffer(andmask).copy(buffer, 2, 0, 2);
	Helpers.numberToBuffer(ormask).copy(buffer, 4, 0, 2);

	return buffer;
};
exports.parseRequest = function (buffer) {
	if (buffer.length < 6) return null;

	return {
		address : buffer.readUInt16BE(0),
		andmask : buffer.slice(2, 4),
		ormask  : buffer.slice(4, 6)
	};
};

exports.buildResponse = exports.buildRequest;
exports.parseResponse = exports.parseRequest;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);

exports.code = 0x01;

exports.buildRequest = Helpers.buildAddressQuantity;
exports.parseRequest = Helpers.parseAddressQuantity;

exports.buildResponse = Helpers.bitsToBuffer;
exports.parseResponse = Helpers.bufferToBits;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

const ObjectIds = {
	0 : "VendorName",
	1 : "ProductCode",
	2 : "MajorMinorRevision",
	3 : "VendorUrl",
	4 : "ProductName",
	5 : "ModelName",
	6 : "UserApplicationName"
};

const AccessTypes = {
	1 : "BasicDeviceIdentification",
	2 : "RegularDeviceIdentification",
	3 : "ExtendedDeviceIdentification",
	4 : "SpecificIdentificationObject"
};

exports.code = 0x2B;

exports.buildRequest = function (type, id) {
	var buffer = Buff.alloc(3);

	if (typeof type == "string") {
		for (var k in AccessTypes) {
			if (AccessTypes[k] == type) {
				type = k;
				break;
			}
		}
	}

	if (typeof id == "string") {
		for (var k in ObjectIds) {
			if (ObjectIds[k] == id) {
				id = k;
				break;
			}
		}
	}

	buffer.writeUInt8(0x0E, 0);
	buffer.writeUInt8(type, 1);
	buffer.writeUInt8(id, 2);

	return buffer;
};

exports.parseRequest = function (buffer) {
	if (buffer.length < 3) return null;

	var req = {
		type : buffer.readUInt8(1),
		id   : buffer.readUInt8(2)
	};

	if (AccessTypes.hasOwnProperty(req.type)) {
		req.type = AccessTypes[req.type];
	}

	if (ObjectIds.hasOwnProperty(req.id)) {
		req.id = ObjectIds[req.id];
	}

	return req;
};

exports.buildResponse = function (type, conformity, more, objects) {
	var object_len = objects.reduce(function (len, object) {
		return len + 2 + object.value.length;
	}, 0);
	var buffer  = Buff.alloc(6 + object_len);
	var offset  = 6;
	var next_id = 0;

	if (typeof type == "string") {
		for (var k in AccessTypes) {
			if (AccessTypes[k] == type) {
				type = k;
				break;
			}
		}
	}

	if (typeof conformity == "string") {
		for (var k in AccessTypes) {
			if (AccessTypes[k] == conformity) {
				conformity = k;
				break;
			}
		}
	}

	buffer.writeUInt8(0x0E, 0);
	buffer.writeUInt8(type, 1);
	buffer.writeUInt8(conformity, 2);
	buffer.writeUInt8(more ? 0xFF : 0x00, 3);
	// index 4 will be in the end
	buffer.writeUInt8(objects.length, 5);

	for (var i = 0; i < objects.length; i++) {
		// make a copy, don't change original
		var id = objects[i].id;

		if (typeof id == "string") {
			for (var k in ObjectIds) {
				if (ObjectIds[k] == id) {
					id = k;
					break;
				}
			}
		}
		buffer.writeUInt8(id, offset);
		buffer.writeUInt8(objects[i].value.length, offset + 1);

		objects[i].value.copy(buffer, offset + 2);

		offset += 2 + objects[i].value.length;
		next_id = id + 1;
	}

	buffer.writeUInt8(more ? next_id : 0x00, 4);

	return buffer;
};

exports.parseResponse = function (buffer) {
	if (buffer.length < 6) return null;

	var data = {
		type       : buffer.readUInt8(1),
		conformity : buffer.readUInt8(2),
		more       : !!buffer.readUInt8(3),
		next       : buffer.readUInt8(4),
		objects    : []
	};
	var total  = buffer.readUInt8(5);
	var offset = 6;

	if (AccessTypes.hasOwnProperty(data.type)) {
		data.type = AccessTypes[data.type];
	}

	if (AccessTypes.hasOwnProperty(data.conformity)) {
		data.conformity = AccessTypes[data.conformity];
	}

	for (var i = 0; i < total; i++) {
		var len = buffer.readUInt8(offset + 1);

		data.objects.push({
			id    : buffer.readUInt8(offset),
			value : buffer.slice(offset + 2, offset + 2 + len)
		});

		offset += 2 + len;
	}

	data.objects.map(function (object) {
		if (ObjectIds.hasOwnProperty(object.id)) {
			object.id = ObjectIds[object.id];
		}
	});

	return data;
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);

exports.code = 0x02;

exports.buildRequest = Helpers.buildAddressQuantity;
exports.parseRequest = Helpers.parseAddressQuantity;

exports.buildResponse = Helpers.bitsToBuffer;
exports.parseResponse = Helpers.bufferToBits;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x07;

exports.buildRequest = Helpers.buildEmpty;
exports.parseRequest = Helpers.parseEmpty;

exports.buildResponse = function (data) {
	return (Buffer.isBuffer(data) ? data.slice(0, 1) : Buff.from([ data ]));
};
exports.parseResponse = function (buffer) {
	if (buffer.length === 0) return null;

	return {
		data : buffer.readUInt8(0)
	};
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x18;

exports.buildRequest = function (address) {
	var buffer = Buff.alloc(2);

	buffer.writeUInt16BE(address, 0);

	return buffer;
};

exports.parseRequest = function (buffer) {
	if (buffer.length < 2) return null;

	return {
		address : buffer.readUInt16BE(0)
	};
};

exports.buildResponse = function (registers) {
	var buffer = Buff.alloc(4 + (registers.length * 2));

	buffer.writeUInt16BE(buffer.length - 2, 0);
	buffer.writeUInt16BE(registers.length, 2);

	Helpers.copyBufferBlocks(buffer, registers, 4);

	return buffer;
};

exports.parseResponse = function (buffer) {
	if (buffer.length < 4) return null;

	var total     = buffer.readUInt16BE(2);
	var registers = [];
	var offset    = 4;

	for (var i = 0; i < total; i++) {
		registers.push(buffer.slice(offset, offset + 2));

		offset += 2;
	}

	return registers;
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x14;

exports.buildRequest = function (requests) {
	var buffer = Buff.alloc(1 + (7 * requests.length));
	var offset = 1;

	buffer.writeUInt8(buffer.length - 1, 0);

	for (var i = 0; i < requests.length; i++) {
		buffer.writeUInt8(0x06, offset);
		buffer.writeUInt16BE(requests[i].file, offset + 1);
		buffer.writeUInt16BE(requests[i].address, offset + 3);
		buffer.writeUInt16BE(requests[i].length, offset + 5);

		offset += 7;
	}

	return buffer;
};
exports.parseRequest = function (buffer) {
	if (buffer.length < 7) return null;

	var data     = [];
	var offset   = 2;
	var requests = (buffer.length - 1) / 7;

	for (var i = 0; i < requests; i++) {
		data.push({
			file    : buffer.readUInt16BE(offset),
			address : buffer.readUInt16BE(offset + 2),
			length  : buffer.readUInt16BE(offset + 4)
		});

		offset += 7;
	}

	return data;
};

exports.buildResponse = function (responses) {
	var data_len = responses.reduce(function (len, response) {
		return len + (response.length * 2);
	}, 0);
	var buffer = Buff.alloc(1 + (responses.length * 2) + data_len);
	var offset = 1;

	buffer.writeUInt8(buffer.length - 1, 0);

	for (var i = 0; i < responses.length; i++) {
		buffer.writeUInt8(1 + (responses[i].length * 2), offset);
		buffer.writeUInt8(0x06, offset + 1);

		offset += 2;

		for (var j = 0; j < responses[i].length; j++) {
			responses[i][j].copy(buffer, offset, 0, 2);

			offset += 2;
		}
	}

	return buffer;
};

exports.parseResponse = function (buffer) {
	if (buffer.length === 0) return null;

	var responses = [];
	var len       = buffer.readUInt8(0);
	var offset    = 1;

	while (offset < len) {
		var total     = (buffer.readUInt8(offset) - 1) / 2;
		var registers = [];

		offset += 2;

		for (var i = 0; i < total; i++) {
			registers.push(buffer.slice(offset, offset + 2));

			offset += 2;
		}

		responses.push(registers);
	}

	return responses;
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);

exports.code = 0x03;

exports.buildRequest = Helpers.buildAddressQuantity;
exports.parseRequest = Helpers.parseAddressQuantity;

exports.buildResponse = Helpers.blocksToBuffer;
exports.parseResponse = Helpers.bufferToBlocks;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);

exports.code = 0x04;

exports.buildRequest = Helpers.buildAddressQuantity;
exports.parseRequest = Helpers.parseAddressQuantity;

exports.buildResponse = Helpers.blocksToBuffer;
exports.parseResponse = Helpers.bufferToBlocks;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x17;

exports.buildRequest = function (read_address, read_quantity, write_address, values) {
	var buffer = Buff.alloc(9 + (values.length * 2));

	buffer.writeUInt16BE(read_address, 0);
	buffer.writeUInt16BE(read_quantity, 2);
	buffer.writeUInt16BE(write_address, 4);
	buffer.writeUInt16BE(values.length, 6);
	buffer.writeUInt8(values.length * 2, 8);

	Helpers.copyBufferBlocks(buffer, values, 9);

	return buffer;
};
exports.parseRequest = function (buffer) {
	if (buffer.length < 8) return null;

	var blocks = buffer.readUInt8(8) / 2;
	var data   = {
		read_address  : buffer.readUInt16BE(0),
		read_quantity : buffer.readUInt16BE(2),
		write_address : buffer.readUInt16BE(4),
		values        : []
	};

	for (var i = 0; i < blocks; i++) {
		data.values.push(buffer.slice(9 + (i * 2), 11 + (i * 2)));
	}

	return data;
};

exports.buildResponse = function (values) {
	var buffer = Buff.alloc(values.length * 2 + 1);

	buffer.writeUInt8(values.length * 2, 0);

	Helpers.copyBufferBlocks(buffer, values, 1);

	return buffer;
};

exports.parseResponse = function (buffer) {
	if (buffer.length === 0) return null;

	var blocks = buffer.readUInt8(0) / 2;
	var values = [];

	for (var i = 0; i < blocks; i++) {
		values.push(buffer.slice(1 + (i * 2), 3 + (i * 2)));
	}

	return { values: values };
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x15;

exports.buildRequest = function (requests) {
	var data_len = requests.reduce(function (len, request) {
		return len + (request.values.length * 2);
	}, 0);
	var buffer = Buff.alloc(1 + (requests.length * 7) + data_len);
	var offset = 1;

	buffer.writeUInt8(buffer.length - 1, 0);

	for (var i = 0; i < requests.length; i++) {
		buffer.writeUInt8(0x06, offset);
		buffer.writeUInt16BE(requests[i].file, offset + 1);
		buffer.writeUInt16BE(requests[i].address, offset + 3);
		buffer.writeUInt16BE(requests[i].values.length * 2, offset + 5);

		offset += 7;

		for (var j = 0; j < requests[i].values.length; j++) {
			requests[i].values[j].copy(buffer, offset, 0, 2);

			offset += 2;
		}
	}

	return buffer;
};
exports.parseRequest = function (buffer) {
	if (buffer.length === 0) return null;

	var len      = buffer.readUInt8(0);
	var requests = [];
	var offset   = 1;

	while (offset < len) {
		offset += 1;

		var request = {
			file    : buffer.readUInt16BE(offset),
			address : buffer.readUInt16BE(offset + 2),
			values  : []
		};
		var total = buffer.readUInt16BE(offset + 4) / 2;

		offset += 6;

		for (var i = 0; i < total; i++) {
			request.values.push(buffer.slice(offset, offset + 2));

			offset += 2;
		}

		requests.push(request);
	}

	return requests;
};

exports.buildResponse = exports.buildRequest;
exports.parseResponse = exports.parseRequest;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x0F;

exports.buildRequest = function (address, values) {
	var data   = Helpers.bitsToBuffer(values);
	var buffer = Buff.alloc(data.length + 4);

	buffer.writeUInt16BE(address, 0);
	buffer.writeUInt16BE(values.length, 2);
	data.copy(buffer, 4);

	return buffer;
};
exports.parseRequest = function (buffer) {
	if (buffer.length < 5) return null;

	return {
		address  : buffer.readUInt16BE(0),
		quantity : buffer.readUInt16BE(2),
		values   : Helpers.bufferToBits(buffer.slice(4, 5 + buffer.readUInt8(4)))
	};
};

exports.buildResponse = Helpers.buildAddressQuantity;
exports.parseResponse = Helpers.parseAddressQuantity;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x10;

exports.buildRequest = function (address, values) {
	var buffer = Buff.alloc(5 + (values.length * 2));

	buffer.writeUInt16BE(address, 0);
	buffer.writeUInt16BE(values.length, 2);
	buffer.writeUInt8(values.length * 2, 4);

	Helpers.copyBufferBlocks(buffer, values, 5);

	return buffer;
};
exports.parseRequest = function (buffer) {
	if (buffer.length < 5) return null;

	var data = {
		address  : buffer.readUInt16BE(0),
		quantity : buffer.readUInt16BE(2),
		values   : []
	};

	var blocks = buffer.readUInt8(4) / 2;

	for (var i = 0; i < blocks; i++) {
		data.values.push(buffer.slice(5 + (i * 2), 7 + (i * 2)));
	}

	return data;
};

exports.buildResponse = Helpers.buildAddressQuantity;
exports.parseResponse = Helpers.parseAddressQuantity;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x05;

exports.buildRequest = function (address, value) {
	var buffer = Buff.alloc(4);

	buffer.writeUInt16BE(address, 0);

	buffer[2] = (value ? 0xFF : 0x00);
	buffer[3] = 0x00;

	return buffer;
};

exports.parseRequest = function (buffer) {
	var data = Helpers.parseAddressValue(buffer);

	if (data === null) return null;

	data.value = (data.value[0] == 0xFF && data.value[1] == 0x00 ? 1 : 0);

	return data;
};

exports.buildResponse = exports.buildRequest;
exports.parseResponse = exports.parseRequest;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var Helpers = __webpack_require__(0);
var Buff    = __webpack_require__(1);

exports.code = 0x06;

exports.buildRequest = function (address, value) {
	var buffer = Buff.alloc(4);

	buffer.writeUInt16BE(address, 0);
	value.copy(buffer, 2, 0, 2);

	return buffer;
};
exports.parseRequest = Helpers.parseAddressValue;

exports.buildResponse = exports.buildRequest;
exports.parseResponse = Helpers.parseAddressValue;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

const SerialPort = __webpack_require__(53)
const Binding = __webpack_require__(60)
const parsers = __webpack_require__(74)

/**
 * @type {AbstractBinding}
 */
SerialPort.Binding = Binding

/**
 * @type {Parsers}
 */
SerialPort.parsers = parsers

module.exports = SerialPort


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */
function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = __webpack_require__(56);
  Object.keys(env).forEach(function (key) {
    createDebug[key] = env[key];
  });
  /**
  * Active `debug` instances.
  */

  createDebug.instances = [];
  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];
  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */

  createDebug.formatters = {};
  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */

  function selectColor(namespace) {
    var hash = 0;

    for (var i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;
  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */

  function createDebug(namespace) {
    var prevTime;

    function debug() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // Disabled?
      if (!debug.enabled) {
        return;
      }

      var self = debug; // Set `diff` timestamp

      var curr = Number(new Date());
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      } // Apply any `formatters` transformations


      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return match;
        }

        index++;
        var formatter = createDebug.formatters[format];

        if (typeof formatter === 'function') {
          var val = args[index];
          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // Apply env-specific formatting (colors, etc.)

      createDebug.formatArgs.call(self, args);
      var logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = createDebug.enabled(namespace);
    debug.useColors = createDebug.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;
    debug.extend = extend; // Debug.formatArgs = formatArgs;
    // debug.rawLog = rawLog;
    // env-specific initialization logic for debug instances

    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    createDebug.instances.push(debug);
    return debug;
  }

  function destroy() {
    var index = createDebug.instances.indexOf(this);

    if (index !== -1) {
      createDebug.instances.splice(index, 1);
      return true;
    }

    return false;
  }

  function extend(namespace, delimiter) {
    return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  }
  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */


  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.names = [];
    createDebug.skips = [];
    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < createDebug.instances.length; i++) {
      var instance = createDebug.instances[i];
      instance.enabled = createDebug.enabled(instance.namespace);
    }
  }
  /**
  * Disable debug output.
  *
  * @api public
  */


  function disable() {
    createDebug.enable('');
  }
  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    var i;
    var len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */


  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }

  createDebug.enable(createDebug.load());
  return createDebug;
}

module.exports = setup;



/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */
function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = __webpack_require__(62);
  Object.keys(env).forEach(function (key) {
    createDebug[key] = env[key];
  });
  /**
  * Active `debug` instances.
  */

  createDebug.instances = [];
  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];
  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */

  createDebug.formatters = {};
  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */

  function selectColor(namespace) {
    var hash = 0;

    for (var i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;
  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */

  function createDebug(namespace) {
    var prevTime;

    function debug() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // Disabled?
      if (!debug.enabled) {
        return;
      }

      var self = debug; // Set `diff` timestamp

      var curr = Number(new Date());
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      } // Apply any `formatters` transformations


      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return match;
        }

        index++;
        var formatter = createDebug.formatters[format];

        if (typeof formatter === 'function') {
          var val = args[index];
          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // Apply env-specific formatting (colors, etc.)

      createDebug.formatArgs.call(self, args);
      var logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = createDebug.enabled(namespace);
    debug.useColors = createDebug.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;
    debug.extend = extend; // Debug.formatArgs = formatArgs;
    // debug.rawLog = rawLog;
    // env-specific initialization logic for debug instances

    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    createDebug.instances.push(debug);
    return debug;
  }

  function destroy() {
    var index = createDebug.instances.indexOf(this);

    if (index !== -1) {
      createDebug.instances.splice(index, 1);
      return true;
    }

    return false;
  }

  function extend(namespace, delimiter) {
    return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  }
  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */


  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.names = [];
    createDebug.skips = [];
    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < createDebug.instances.length; i++) {
      var instance = createDebug.instances[i];
      instance.enabled = createDebug.enabled(instance.namespace);
    }
  }
  /**
  * Disable debug output.
  *
  * @api public
  */


  function disable() {
    createDebug.enable('');
  }
  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    var i;
    var len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */


  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }

  createDebug.enable(createDebug.load());
  return createDebug;
}

module.exports = setup;



/***/ }),
/* 37 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 37;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */
function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = __webpack_require__(67);
  Object.keys(env).forEach(function (key) {
    createDebug[key] = env[key];
  });
  /**
  * Active `debug` instances.
  */

  createDebug.instances = [];
  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];
  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */

  createDebug.formatters = {};
  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */

  function selectColor(namespace) {
    var hash = 0;

    for (var i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;
  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */

  function createDebug(namespace) {
    var prevTime;

    function debug() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // Disabled?
      if (!debug.enabled) {
        return;
      }

      var self = debug; // Set `diff` timestamp

      var curr = Number(new Date());
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      } // Apply any `formatters` transformations


      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return match;
        }

        index++;
        var formatter = createDebug.formatters[format];

        if (typeof formatter === 'function') {
          var val = args[index];
          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // Apply env-specific formatting (colors, etc.)

      createDebug.formatArgs.call(self, args);
      var logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = createDebug.enabled(namespace);
    debug.useColors = createDebug.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;
    debug.extend = extend; // Debug.formatArgs = formatArgs;
    // debug.rawLog = rawLog;
    // env-specific initialization logic for debug instances

    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    createDebug.instances.push(debug);
    return debug;
  }

  function destroy() {
    var index = createDebug.instances.indexOf(this);

    if (index !== -1) {
      createDebug.instances.splice(index, 1);
      return true;
    }

    return false;
  }

  function extend(namespace, delimiter) {
    return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  }
  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */


  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.names = [];
    createDebug.skips = [];
    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < createDebug.instances.length; i++) {
      var instance = createDebug.instances[i];
      instance.enabled = createDebug.enabled(instance.namespace);
    }
  }
  /**
  * Disable debug output.
  *
  * @api public
  */


  function disable() {
    createDebug.enable('');
  }
  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    var i;
    var len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */


  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }

  createDebug.enable(createDebug.load());
  return createDebug;
}

module.exports = setup;



/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(7)
const logger = debug('@serialport/bindings:poller')
const EventEmitter = __webpack_require__(11)
const FDPoller = __webpack_require__(8)('bindings.node').Poller

const EVENTS = {
  UV_READABLE: 1,
  UV_WRITABLE: 2,
  UV_DISCONNECT: 4,
}

function handleEvent(error, eventFlag) {
  if (error) {
    logger('error', error)
    this.emit('readable', error)
    this.emit('writable', error)
    this.emit('disconnect', error)
    return
  }
  if (eventFlag & EVENTS.UV_READABLE) {
    logger('received "readable"')
    this.emit('readable', null)
  }
  if (eventFlag & EVENTS.UV_WRITABLE) {
    logger('received "writable"')
    this.emit('writable', null)
  }
  if (eventFlag & EVENTS.UV_DISCONNECT) {
    logger('received "disconnect"')
    this.emit('disconnect', null)
  }
}

/**
 * Polls unix systems for readable or writable states of a file or serialport
 */
class Poller extends EventEmitter {
  constructor(fd) {
    logger('Creating poller')
    super()
    this.poller = new FDPoller(fd, handleEvent.bind(this))
  }
  /**
   * Wait for the next event to occur
   * @param {string} event ('readable'|'writable'|'disconnect')
   * @returns {Poller} returns itself
   */
  once(event) {
    switch (event) {
      case 'readable':
        this.poll(EVENTS.UV_READABLE)
        break
      case 'writable':
        this.poll(EVENTS.UV_WRITABLE)
        break
      case 'disconnect':
        this.poll(EVENTS.UV_DISCONNECT)
        break
    }
    return EventEmitter.prototype.once.apply(this, arguments)
  }

  /**
   * Ask the bindings to listen for an event, it is recommend to use `.once()` for easy use
   * @param {EVENTS} eventFlag polls for an event or group of events based upon a flag.
   * @returns {undefined}
   */
  poll(eventFlag) {
    eventFlag = eventFlag || 0

    if (eventFlag & EVENTS.UV_READABLE) {
      logger('Polling for "readable"')
    }
    if (eventFlag & EVENTS.UV_WRITABLE) {
      logger('Polling for "writable"')
    }
    if (eventFlag & EVENTS.UV_DISCONNECT) {
      logger('Polling for "disconnect"')
    }

    this.poller.poll(eventFlag)
  }

  /**
   * Stop listening for events and cancel all outstanding listening with an error
   * @returns {undefined}
   */
  stop() {
    logger('Stopping poller')
    this.poller.stop()
    this.emitCanceled()
  }

  destroy() {
    logger('Destroying poller')
    this.poller.destroy()
    this.emitCanceled()
  }

  emitCanceled() {
    const err = new Error('Canceled')
    err.canceled = true
    this.emit('readable', err)
    this.emit('writable', err)
    this.emit('disconnect', err)
  }
}

Poller.EVENTS = EVENTS

module.exports = Poller


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(6)
const debug = __webpack_require__(7)
const logger = debug('@serialport/bindings:unixRead')

module.exports = function unixRead(buffer, offset, length) {
  logger('Starting read')
  if (!this.isOpen) {
    return Promise.reject(new Error('Port is not open'))
  }
  return new Promise((resolve, reject) => {
    fs.read(this.fd, buffer, offset, length, null, (err, bytesRead) => {
      if (
        err &&
        (err.code === 'EAGAIN' ||
          err.code === 'EWOULDBLOCK' ||
          err.code === 'EINTR')
      ) {
        if (!this.isOpen) {
          return reject(new Error('Port is not open'))
        }
        logger('waiting for readable because of code:', err.code)
        this.poller.once('readable', err => {
          if (err) {
            return reject(err)
          }
          resolve(this.read(buffer, offset, length))
        })
        return
      }

      const disconnectError =
        err &&
        (err.code === 'EBADF' || // Bad file number means we got closed
        err.code === 'ENXIO' || // No such device or address probably usb disconnect
          err.code === 'UNKNOWN' ||
          err.errno === -1) // generic error

      if (disconnectError) {
        err.disconnect = true
        logger('disconnecting', err)
      }

      if (err) {
        return reject(err)
      }

      if (bytesRead === 0) {
        resolve(this.read(buffer, offset, length))
        return
      }

      logger('Finished read', bytesRead, 'bytes')
      resolve(bytesRead)
    })
  })
}


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(6)
const debug = __webpack_require__(7)
const logger = debug('@serialport/bindings:unixWrite')

module.exports = function unixWrite(buffer, offset) {
  offset = offset || 0
  const bytesToWrite = buffer.length - offset
  logger(
    'Starting write',
    buffer.length,
    'bytes offset',
    offset,
    'bytesToWrite',
    bytesToWrite
  )
  if (!this.isOpen) {
    return Promise.reject(new Error('Port is not open'))
  }
  return new Promise((resolve, reject) => {
    fs.write(this.fd, buffer, offset, bytesToWrite, (err, bytesWritten) => {
      logger('write returned', err, bytesWritten)
      if (
        err &&
        (err.code === 'EAGAIN' ||
          err.code === 'EWOULDBLOCK' ||
          err.code === 'EINTR')
      ) {
        if (!this.isOpen) {
          return reject(new Error('Port is not open'))
        }
        logger('waiting for writable because of code:', err.code)
        this.poller.once('writable', err => {
          if (err) {
            return reject(err)
          }
          resolve(unixWrite.call(this, buffer, offset))
        })
        return
      }

      const disconnectError =
        err &&
        (err.code === 'EBADF' || // Bad file number means we got closed
        err.code === 'ENXIO' || // No such device or address probably usb disconnect
          err.code === 'UNKNOWN' ||
          err.errno === -1) // generic error

      if (disconnectError) {
        err.disconnect = true
        logger('disconnecting', err)
      }

      if (err) {
        logger('error', err)
        return reject(err)
      }

      logger('wrote', bytesWritten, 'bytes')
      if (bytesWritten + offset < buffer.length) {
        if (!this.isOpen) {
          return reject(new Error('Port is not open'))
        }
        return resolve(unixWrite.call(this, buffer, bytesWritten + offset))
      }

      logger('Finished writing', bytesWritten + offset, 'bytes')
      resolve()
    })
  })
}


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

const DelimiterParser = __webpack_require__(43)

/**
 *  A transform stream that emits data after a newline delimiter is received.
 * @summary To use the `Readline` parser, provide a delimiter (defaults to `\n`). Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 * @extends DelimiterParser
 * @example
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
parser.on('data', console.log)
*/
class ReadLineParser extends DelimiterParser {
  constructor(options) {
    const opts = Object.assign(
      {
        delimiter: Buffer.from('\n', 'utf8'),
        encoding: 'utf8',
      },
      options
    )

    if (typeof opts.delimiter === 'string') {
      opts.delimiter = Buffer.from(opts.delimiter, opts.encoding)
    }

    super(opts)
  }
}

module.exports = ReadLineParser


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

const Transform = __webpack_require__(3).Transform

/**
 * A transform stream that emits data each time a byte sequence is received.
 * @extends Transform
 * @summary To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes. Runs in O(n) time.
 * @example
const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Delimiter({ delimiter: '\n' }))
parser.on('data', console.log)
 */
class DelimiterParser extends Transform {
  constructor(options = {}) {
    super(options)

    if (options.delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object')
    }

    if (options.delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length')
    }

    this.includeDelimiter =
      options.includeDelimiter !== undefined ? options.includeDelimiter : false
    this.delimiter = Buffer.from(options.delimiter)
    this.buffer = Buffer.alloc(0)
  }

  _transform(chunk, encoding, cb) {
    let data = Buffer.concat([this.buffer, chunk])
    let position
    while ((position = data.indexOf(this.delimiter)) !== -1) {
      this.push(
        data.slice(
          0,
          position + (this.includeDelimiter ? this.delimiter.length : 0)
        )
      )
      data = data.slice(position + this.delimiter.length)
    }
    this.buffer = data
    cb()
  }

  _flush(cb) {
    this.push(this.buffer)
    this.buffer = Buffer.alloc(0)
    cb()
  }
}

module.exports = DelimiterParser


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var modbus = __webpack_require__(45);

modbus.tcp.server({ debug: "server" }, (connection) => {
    connection.readCoils({ from: 3, to: 7 }, (err, info) => {
        console.log("response", info.response.data);
    });
}).listen(12345, () => {
    modbus.tcp.connect(12345, { debug: "client" }, (err, connection) => {
        connection.on("read-coils", (request, reply) => {
            reply(null, [ 1, 0, 1, 0, 1, 1, 0, 1 ]);
        });
    });
});


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

exports.transports = {
	tcp    : __webpack_require__(46),
	ascii  : __webpack_require__(49),
	serial : __webpack_require__(50)
};

exports.drivers = {
	serial : __webpack_require__(51),
	tcp    : __webpack_require__(79),
	udp    : __webpack_require__(81)
};

exports.stream = __webpack_require__(9);
exports.pdu    = __webpack_require__(4);

exports.tcp = {
	connect : function () {
		var port    = 502;
		var host    = "localhost";
		var options = {};
		var next    = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "number":
					port = arg;
					break;
				case "string":
					host = arg;
					break;
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		if (typeof options.retry == "undefined") {
			options.retry = 30000;
		}

		var socket = exports.drivers.tcp.connect(port, host, options);

		socket.attach(exports.transports.tcp.prepare(options), next);
	},
	server : function () {
		var options = {};
		var next    = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		if (typeof options.retry == "undefined") {
			options.retry = 30000;
		}

		return exports.drivers.tcp.server(options).attach(exports.transports.tcp.prepare(options), next);
	}
};

exports.udp = {
	connect : function () {
		var port    = 502;
		var host    = "localhost";
		var options = {};
		var next    = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "number":
					port = arg;
					break;
				case "string":
					host = arg;
					break;
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		if (typeof options.retry == "undefined") {
			options.retry = 3000;
		}

		var socket = exports.drivers.udp.connect(port, host, options);

		socket.attach(exports.transports.tcp.prepare(options), next);
	},
	server : function () {
		var options = {};
		var next    = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		if (typeof options.retry == "undefined") {
			options.retry = 3000;
		}

		return exports.drivers.udp.server(options).attach(exports.transports.tcp.prepare(options), next);
	}
};

exports.serial = {
	connect : function () {
		var possible_options = [ "retries", "retry", "beforerequest", "afterrequest", "mutex", "maxDataInterval", "slaveId" ];
		var device           = "/dev/ttyS0";
		var options          = {};
		var serial_options   = {};
		var next             = noop;

		Array.prototype.slice.apply(arguments).map(function (arg) {
			switch (typeof arg) {
				case "string":
					device = arg;
					break;
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		possible_options.map(function (option) {
			if (typeof options[option] != "undefined") {
				serial_options[option] = options[option];
				delete options[option];
			}
		});

		var stream = exports.drivers.serial.connect(device, options);

		if (options.mode === "ascii") {
			stream.attach(exports.transports.ascii.prepare(serial_options), next);
		} else {
			stream.attach(exports.transports.serial.prepare(serial_options), next);
		}
	}
};

function noop() {}


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var util          = __webpack_require__(2);
var buffer        = __webpack_require__(5);
var BaseTransport = __webpack_require__(10);

function Transport(stream, options) {
	options = options || {};

	BaseTransport.call(this, stream, options);

	var transport     = this;

	this.transactionId = (typeof options.transactionId != "undefined" ? options.transactionId : 1) - 1;
	this.unitId        = (typeof options.unitId != "undefined" ? options.unitId : 1);
	this.protocol      = (typeof options.protocol != "undefined" ? options.protocol : 0);
	this.callbacks     = {};
	this.buffer        = null;

	this.stream.on("end", function () {
		transport.emit("close");
	});
}
util.inherits(Transport, BaseTransport);

Transport.prototype.wrap = function (pdu, options, next) {
	options = options || {};
	next    = next || null;

	var unitId        = (typeof options.unitId != "undefined" ? options.unitId : this.unitId);
	var transactionId = (typeof options.transactionId != "undefined" ? options.transactionId : null);
	var data          = buffer.alloc(pdu.length + 7);

	if (transactionId !== null) {
		data.writeUInt16BE(transactionId, 0);
	} else {
		this.transactionId += 1;

		if (this.transactionId > 65535) {
			this.transactionId = 1;
		}

		data.writeUInt16BE(this.transactionId, 0);
	}

	if (typeof next == "function") {
		var key = [ data.readUInt16BE(0), unitId, pdu.readUInt8(0) ].join(":");

		this.callbacks[key] = next;

		data.__callback_key = key;
	}

	data.writeUInt16BE(this.protocol, 2);
	data.writeUInt16BE(pdu.length + 1, 4);
	data.writeUInt8(unitId, 6);

	pdu.copy(data, 7);

	return data;
};

Transport.prototype.close = function (next) {
	this.closed = true;

	this.stream.end(next);
};

Transport.prototype.pending = function () {
	return (this.buffer !== null && this.buffer.length);
};

Transport.prototype.unwrap = function (data) {
	this.buffer = (this.buffer === null ? data : buffer.concat([ this.buffer, data ]));

	// not enough data to see package length
	if (this.buffer.length < 6) return false;

	var length = this.buffer.readUInt16BE(4);

	if (this.buffer.length < length + 6) return false;

	var unwrapped = {
		transactionId : this.buffer.readUInt16BE(0),
		protocol      : this.buffer.readUInt16BE(2),
		length        : length,
		unitId        : this.buffer.readUInt8(6),
		pdu           : this.buffer.slice(7, length + 6),
		stream        : this.stream
	};
	unwrapped.__callback_key = [ unwrapped.transactionId, unwrapped.unitId, unwrapped.pdu.readUInt8(0) & 0x7F ].join(":");

	if (typeof this.callbacks[unwrapped.__callback_key] == "function") {
		unwrapped.callback = this.callbacks[unwrapped.__callback_key];
		delete this.callbacks[unwrapped.__callback_key];
	}

	this.buffer = (this.buffer.length > length + 6 ? this.buffer.slice(length + 6) : null);

	return unwrapped;
};

Transport.prepare = function (options) {
	return function (stream) {
		return new Transport(stream, options);
	};
};

module.exports = Transport;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

var Modbus = __webpack_require__(4);
var Buff    = __webpack_require__(1);

exports.IllegalFunction                    = 0x01;
exports.IllegalDataAddress                 = 0x02;
exports.IllegalDataValue                   = 0x03;
exports.ServerDeviceFailure                = 0x04;
exports.Aknowledge                         = 0x05;
exports.ServerDeviceBusy                   = 0x06;
exports.MemoryParityError                  = 0x08;
exports.GatewayPathUnavailable             = 0x0A;
exports.GatewayTargetDeviceFailedToRespond = 0x0B;

exports.load = function (functs) {
	for (var f in functs) {
		if (typeof functs[f] != "object" || !functs[f].hasOwnProperty("Code")) continue;

		functs[f].Exception = prepareException(f, functs[f]);
	}
};

exports.error = function (reason) {
	if (typeof reason == "string") {
		var err = new Error(reason);
		err.code = exports[reason];

		return err;
	}

	for (var k in exports) {
		if (typeof exports[k] != "number") continue;
		if (exports[k] != reason) continue

		var err = new Error(k);
		err.code = exports[k];

		return err;
	}

	return new Error("" + reason);
};

exports.build = function (fcode, code) {
	return Buff.from([ fcode | 0x80, (typeof code == "string" ? exports[code] : code) ]);
};

exports.parse = function (buffer) {
	var data = {
		code      : buffer[0] & 0x7F,
		exception : buffer[1]
	};

	for (var k in Modbus) {
		if (typeof Modbus[k] == "object" && Modbus[k].Code == data.code) {
			data.code = k;
			break;
		}
	}

	for (var k in exports) {
		if (exports[k] == data.exception) {
			data.exception = k;
			break;
		}
	}

	return data;
};

function prepareException(name, funct) {
	return {
		build: function (code) {
			return Buff.from([ funct.Code | 0x80, code ]);
		},
		parse: function (buffer) {
			var exception = buffer[buffer.length - 1];

			for (var k in exports) {
				if (exports[k] == exception) {
					exception = k;
					break;
				}
			}

			return exception;
		}
	};
}


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./GET_COMM_EVENT_COUNTER": 17,
	"./GET_COMM_EVENT_COUNTER.js": 17,
	"./GET_COMM_EVENT_LOG": 18,
	"./GET_COMM_EVENT_LOG.js": 18,
	"./MASK_WRITE_REGISTER": 19,
	"./MASK_WRITE_REGISTER.js": 19,
	"./READ_COILS": 20,
	"./READ_COILS.js": 20,
	"./READ_DEVICE_IDENTIFICATION": 21,
	"./READ_DEVICE_IDENTIFICATION.js": 21,
	"./READ_DISCRETE_INPUTS": 22,
	"./READ_DISCRETE_INPUTS.js": 22,
	"./READ_EXCEPTION_STATUS": 23,
	"./READ_EXCEPTION_STATUS.js": 23,
	"./READ_FIFO_QUEUE": 24,
	"./READ_FIFO_QUEUE.js": 24,
	"./READ_FILE_RECORD": 25,
	"./READ_FILE_RECORD.js": 25,
	"./READ_HOLDING_REGISTERS": 26,
	"./READ_HOLDING_REGISTERS.js": 26,
	"./READ_INPUT_REGISTERS": 27,
	"./READ_INPUT_REGISTERS.js": 27,
	"./READ_WRITE_MULTIPLE_REGISTERS": 28,
	"./READ_WRITE_MULTIPLE_REGISTERS.js": 28,
	"./WRITE_FILE_RECORD": 29,
	"./WRITE_FILE_RECORD.js": 29,
	"./WRITE_MULTIPLE_COILS": 30,
	"./WRITE_MULTIPLE_COILS.js": 30,
	"./WRITE_MULTIPLE_REGISTERS": 31,
	"./WRITE_MULTIPLE_REGISTERS.js": 31,
	"./WRITE_SINGLE_COIL": 32,
	"./WRITE_SINGLE_COIL.js": 32,
	"./WRITE_SINGLE_REGISTER": 33,
	"./WRITE_SINGLE_REGISTER.js": 33
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 48;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var util          = __webpack_require__(2);
var buffer        = __webpack_require__(5);
var BaseTransport = __webpack_require__(10);

var MESSAGE_START = buffer.from([ 0x3A ]);
var MESSAGE_END   = buffer.from([ 0x0D, 0x0A ]);

function Transport(stream, options) {
	options = options || {};

	BaseTransport.call(this, stream, options);

	this.callback        = null;
	this.callbackSlaveId = null;
	this.buffer          = null;
};
util.inherits(Transport, BaseTransport);

Transport.prototype.wrap = function (pdu, options, next) {
	options = options || {};
	next    = next || null;

	var slaveId = (typeof options.slaveId != "undefined" ? options.slaveId : 1);
	var data    = buffer.alloc((pdu.length + 1) * 2 + 2 + MESSAGE_START.length + MESSAGE_END.length);

	MESSAGE_START.copy(data, 0);
	MESSAGE_END.copy(data, data.length - MESSAGE_END.length);

	writeAscii(data, buffer.from([ slaveId ]), MESSAGE_START.length);
	writeAscii(data, pdu, MESSAGE_START.length + 2);

	if (typeof next == "function") {
		this.callback        = next;
		this.callbackSlaveId = slaveId;
	}

	writeAscii(data, Transport.lrc(Buffer.concat([ buffer.from([ slaveId ]), pdu ])), data.length - MESSAGE_END.length - 2);

	return data;
};

Transport.prototype.unwrap = function (data) {
	this.buffer = (this.buffer === null ? data : Buffer.concat([ this.buffer, data ]));

	if (buffer.length < MESSAGE_START.length + MESSAGE_END.length + 3) return false;

	var start = buffer.indexOf(this.buffer, MESSAGE_START);

	if (start == -1) return false;

	start += MESSAGE_START.length;

	var end = buffer.indexOf(this.buffer, MESSAGE_END, start);

	if (end == -1) return false;

	var temp      = buffer.from(this.buffer.slice(start, end).toString(), "hex");
	var unwrapped = {
		slaveId      : temp.readUInt8(0),
		crc          : temp.readUInt8(temp.length - 1),
		expected_crc : Transport.lrc(temp.slice(0, temp.length - 1)).readUInt8(0),
		pdu          : temp.slice(1, temp.length - 1),
		stream       : this.stream
	};

	if (typeof this.callback == "function") {
		if (unwrapped.slaveId != this.callbackSlaveId) return false;

		unwrapped.callback = this.callback;
		this.callback      = null;
	}

	end += MESSAGE_END.length;

	this.buffer = (end >= this.buffer.length ? null : this.buffer.slice(end));

	return unwrapped;
};

Transport.lrc = function (data) {
	var lrc = 0;

	for (var i = 0; i < data.length; i++) {
		lrc += data[i];
	}

	return buffer.from([ (0xFF - lrc + 1) ]);
};

Transport.prepare = function (options) {
	return function (stream) {
		return new Transport(stream, options);
	};
};

module.exports = Transport;

function writeAscii(buffer, block, offset) {
	for (var i = 0; i < block.length; i++) {
		var char = block[i].toString(16).toUpperCase();

		if (char.length < 2) {
			char = "0" + char;
		}

		buffer.writeUInt8(char.charCodeAt(0), offset + (i * 2));
		buffer.writeUInt8(char.charCodeAt(1), offset + (i * 2) + 1);
	}
}


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

var util          = __webpack_require__(2);
var buffer        = __webpack_require__(5);
var BaseTransport = __webpack_require__(10);

function Transport(stream, options) {
	options = options || {};

	BaseTransport.call(this, stream, options);

	this.callback        = null;
	this.callbackSlaveId = null;
	this.queued          = null;
	this.lastData        = null;
	this.maxDataInterval = options.maxDataInterval || 100;
	this.slaveId         = (typeof options.slaveId != "undefined" ? options.slaveId : 1);

	var transport = this;

	this.stream.on("close", function () {
		transport.emit("close");
	});
};
util.inherits(Transport, BaseTransport);

Transport.prototype.wrap = function (pdu, options, next) {
	options = options || {};
	next    = next || null;

	var slaveId = (typeof options.slaveId != "undefined" ? options.slaveId : this.slaveId);
	var data    = buffer.alloc(pdu.length + (options.crc === false ? 1 : 3));

	data.writeUInt8(slaveId, 0);

	if (typeof next == "function") {
		this.callbackSlaveId = slaveId;
		this.callback        = next;
	}

	pdu.copy(data, 1);

	if (options.crc !== false) {
		data.writeUInt16LE(Transport.crc16(data.slice(0, data.length - 2)), pdu.length + 1);
	}

	return data;
};

Transport.prototype.unwrap = function (data) {
	if (this.queued !== null && this.lastData !== null && Date.now() - this.lastData > this.maxDataInterval) {
		this.queued = null;
	}

	this.lastData = Date.now();

	if (this.queued !== null) {
		data = buffer.concat([ this.queued, data ]);
	}

	if (data.length <= 3) {
		this.queued = data;
		return false;
	}

	var unwrapped = {
		slaveId      : data.readUInt8(0),
		crc          : data.readUInt16LE(data.length - 2),
		expected_crc : Transport.crc16(data.slice(0, data.length - 2)),
		pdu          : data.slice(1, data.length - 2),
		stream       : this.stream
	};

	if (unwrapped.crc != unwrapped.expected_crc) {
		this.queued = data;
		return false;
	}

	this.queued = null;

	if (typeof this.callback == "function") {
		if (unwrapped.slaveId != this.callbackSlaveId) return false;

		unwrapped.callback = this.callback;
		this.callback      = null;
	}

	return unwrapped;
};

Transport.prototype.clearSend = function () {
	this.queued   = null;
	this.lastData = null;
};

Transport.crc16 = function (buffer) {
	var crc = 0xFFFF;

	for (var i = 0; i < buffer.length; i++) {
		crc ^= buffer[i];

		for (var j = 8; j != 0; j--) {
			if ((crc & 0x0001) != 0) {
				crc >>= 1;
				crc ^= 0xA001;
			} else {
				crc >>= 1;
			}
		}
	}

	return crc;
};

Transport.prepare = function (options) {
	return function (stream) {
		return new Transport(stream, options);
	};
};

module.exports = Transport;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

var serialport = (__webpack_require__(52).version.split(".")[0] > 3 ? __webpack_require__(34) : __webpack_require__(34).SerialPort);
var stream     = __webpack_require__(9);
var pdu        = __webpack_require__(4);

function Driver() {

}

Driver.connect = function (device, options) {
	options = options || {};

	options.autoOpen = false;
	options.baudRate = options.baudRate || 9600;
	options.dataBits = options.dataBits || 8;
	options.stopBits = options.stopBits || 1;
	options.parity   = options.parity || "none";

	var port = new serialport(device || "/dev/ttyS0", options);

	return {
		attach : function (transport, next) {
			port.on("error", function () {});

			port.open(function (err) {
				if (err) return next(pdu.Exception.error("GatewayPathUnavailable"));

				return next(null, new stream(transport(port, options), options));
			});

			return port;
		}
	}
};

module.exports = Driver;


/***/ }),
/* 52 */
/***/ (function(module, exports) {

module.exports = {"name":"serialport","version":"7.0.2","description":"Node.js package to access serial ports. Linux, OSX and Windows. Welcome your robotic JavaScript overlords. Better yet, program them!","main":"lib","repository":{"type":"git","url":"git://github.com/node-serialport/node-serialport.git"},"keywords":["ccTalk","com port","data logging","hardware","iot","johnny-five","modem","nodebots","RFID","robotics","sensor","serial port","serial","serialport","sms gateway","sms","stream","tty","UART"],"maintainers":[{"name":"Francis Gulotta","email":"wizard@roborooter.com","url":"https://www.roborooter.com"},{"name":"Maybe you? Come and help out!","url":"https://github.com/node-serialport"}],"dependencies":{"@serialport/binding-mock":"^2.0.1","@serialport/bindings":"^2.0.2","@serialport/parser-byte-length":"^2.0.1","@serialport/parser-cctalk":"^2.0.1","@serialport/parser-delimiter":"^2.0.1","@serialport/parser-readline":"^2.0.1","@serialport/parser-ready":"^2.0.1","@serialport/parser-regex":"^2.0.1","@serialport/stream":"^2.0.1","commander":"^2.13.0","debug":"^3.1.0","promirepl":"^1.0.1","prompt-list":"^3.2.0"},"engines":{"node":">=6.0.0"},"bin":{"serialport-list":"./bin/list.js","serialport-repl":"./bin/repl.js","serialport-term":"./bin/terminal.js"},"license":"MIT","scripts":{"repl":"node bin/repl.js","terminal":"node bin/terminal.js"},"gitHead":"4017f61620a845713f711576ba05bd47ae7601b6"}

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

const stream = __webpack_require__(3)
const util = __webpack_require__(2)
const debug = __webpack_require__(54)('@serialport/stream')

//  VALIDATION
const DATABITS = Object.freeze([5, 6, 7, 8])
const STOPBITS = Object.freeze([1, 1.5, 2])
const PARITY = Object.freeze(['none', 'even', 'mark', 'odd', 'space'])
const FLOWCONTROLS = Object.freeze(['xon', 'xoff', 'xany', 'rtscts'])

const defaultSettings = Object.freeze({
  autoOpen: true,
  baudRate: 9600,
  dataBits: 8,
  hupcl: true,
  lock: true,
  parity: 'none',
  rtscts: false,
  stopBits: 1,
  xany: false,
  xoff: false,
  xon: false,
  highWaterMark: 64 * 1024,
})

const defaultSetFlags = Object.freeze({
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true,
})

function allocNewReadPool(poolSize) {
  const pool = Buffer.allocUnsafe(poolSize)
  pool.used = 0
  return pool
}

/**
 * A callback called with an error or null.
 * @typedef {function} errorCallback
 * @param {?error} error
 */

/**
 * A callback called with an error or an object with the modem line values (cts, dsr, dcd).
 * @typedef {function} modemBitsCallback
 * @param {?error} error
 * @param {?object} status
 * @param {boolean} [status.cts=false]
 * @param {boolean} [status.dsr=false]
 * @param {boolean} [status.dcd=false]
 */

/**
 * @typedef {Object} openOptions
 * @property {boolean} [autoOpen=true] Automatically opens the port on `nextTick`.
 * @property {number=} [baudRate=9600] The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
 * @property {number} [dataBits=8] Must be one of these: 8, 7, 6, or 5.
 * @property {number} [highWaterMark=65536] The size of the read and write buffers defaults to 64k.
 * @property {boolean} [lock=true] Prevent other processes from opening the port. Windows does not currently support `false`.
 * @property {number} [stopBits=1] Must be one of these: 1 or 2.
 * @property {string} [parity=none] Must be one of these: 'none', 'even', 'mark', 'odd', 'space'.
 * @property {boolean} [rtscts=false] flow control setting
 * @property {boolean} [xon=false] flow control setting
 * @property {boolean} [xoff=false] flow control setting
 * @property {boolean} [xany=false] flow control setting
 * @property {object=} bindingOptions sets binding-specific options
 * @property {Binding=} Binding The hardware access binding. `Bindings` are how Node-Serialport talks to the underlying system. By default we auto detect Windows (`WindowsBinding`), Linux (`LinuxBinding`) and OS X (`DarwinBinding`) and load the appropriate module for your system.
 * @property {number} [bindingOptions.vmin=1] see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding
 * @property {number} [bindingOptions.vtime=0] see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding
 */

/**
 * Create a new serial port object for the `path`. In the case of invalid arguments or invalid options, when constructing a new SerialPort it will throw an error. The port will open automatically by default, which is the equivalent of calling `port.open(openCallback)` in the next tick. You can disable this by setting the option `autoOpen` to `false`.
 * @class SerialPort
 * @param {string} path - The system path of the serial port you want to open. For example, `/dev/tty.XXX` on Mac/Linux, or `COM1` on Windows.
 * @param {openOptions=} options - Port configuration options
 * @param {errorCallback=} openCallback - Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event. The callback will NOT be called if `autoOpen` is set to `false` in the `openOptions` as the open will not be performed.
 * @property {number} baudRate The port's baudRate. Use `.update` to change it. Read-only.
 * @property {object} binding The binding object backing the port. Read-only.
 * @property {boolean} isOpen `true` if the port is open, `false` otherwise. Read-only. (`since 5.0.0`)
 * @property {string} path The system path or name of the serial port. Read-only.
 * @throws {TypeError} When given invalid arguments, a `TypeError` will be thrown.
 * @emits open
 * @emits data
 * @emits close
 * @emits error
 * @alias module:serialport
 */
function SerialPort(path, options, openCallback) {
  if (!(this instanceof SerialPort)) {
    return new SerialPort(path, options, openCallback)
  }

  if (options instanceof Function) {
    openCallback = options
    options = {}
  }

  const settings = Object.assign({}, defaultSettings, options)

  stream.Duplex.call(this, {
    highWaterMark: settings.highWaterMark,
  })

  const Binding = settings.binding || SerialPort.Binding

  if (!Binding) {
    throw new TypeError(
      '"Bindings" is invalid pass it as `options.binding` or set it on `SerialPort.Binding`'
    )
  }

  if (!path) {
    throw new TypeError(`"path" is not defined: ${path}`)
  }

  if (settings.baudrate) {
    throw new TypeError(
      `"baudrate" is an unknown option, did you mean "baudRate"?`
    )
  }

  if (typeof settings.baudRate !== 'number') {
    throw new TypeError(`"baudRate" must be a number: ${settings.baudRate}`)
  }

  if (DATABITS.indexOf(settings.dataBits) === -1) {
    throw new TypeError(`"databits" is invalid: ${settings.dataBits}`)
  }

  if (STOPBITS.indexOf(settings.stopBits) === -1) {
    throw new TypeError(`"stopbits" is invalid: ${settings.stopbits}`)
  }

  if (PARITY.indexOf(settings.parity) === -1) {
    throw new TypeError(`"parity" is invalid: ${settings.parity}`)
  }

  FLOWCONTROLS.forEach(control => {
    if (typeof settings[control] !== 'boolean') {
      throw new TypeError(`"${control}" is not boolean: ${settings[control]}`)
    }
  })

  const binding = new Binding({
    bindingOptions: settings.bindingOptions,
  })

  Object.defineProperties(this, {
    binding: {
      enumerable: true,
      value: binding,
    },
    path: {
      enumerable: true,
      value: path,
    },
    settings: {
      enumerable: true,
      value: settings,
    },
  })

  this.opening = false
  this.closing = false
  this._pool = allocNewReadPool(this.settings.highWaterMark)
  this._kMinPoolSpace = 128

  if (this.settings.autoOpen) {
    this.open(openCallback)
  }
}

util.inherits(SerialPort, stream.Duplex)

Object.defineProperties(SerialPort.prototype, {
  isOpen: {
    enumerable: true,
    get() {
      return this.binding.isOpen && !this.closing
    },
  },
  baudRate: {
    enumerable: true,
    get() {
      return this.settings.baudRate
    },
  },
})

/**
 * The `error` event's callback is called with an error object whenever there is an error.
 * @event error
 */

SerialPort.prototype._error = function(error, callback) {
  if (callback) {
    callback.call(this, error)
  } else {
    this.emit('error', error)
  }
}

SerialPort.prototype._asyncError = function(error, callback) {
  process.nextTick(() => this._error(error, callback))
}

/**
 * The `open` event's callback is called with no arguments when the port is opened and ready for writing. This happens if you have the constructor open immediately (which opens in the next tick) or if you open the port manually with `open()`. See [Useage/Opening a Port](#opening-a-port) for more information.
 * @event open
 */

/**
 * Opens a connection to the given serial port.
 * @param {errorCallback=} openCallback - Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event.
 * @emits open
 * @returns {undefined}
 */
SerialPort.prototype.open = function(openCallback) {
  if (this.isOpen) {
    return this._asyncError(new Error('Port is already open'), openCallback)
  }

  if (this.opening) {
    return this._asyncError(new Error('Port is opening'), openCallback)
  }

  this.opening = true
  debug('opening', `path: ${this.path}`)
  this.binding.open(this.path, this.settings).then(
    () => {
      debug('opened', `path: ${this.path}`)
      this.opening = false
      this.emit('open')
      if (openCallback) {
        openCallback.call(this, null)
      }
    },
    err => {
      this.opening = false
      debug('Binding #open had an error', err)
      this._error(err, openCallback)
    }
  )
}

/**
 * Changes the baud rate for an open port. Throws if you provide a bad argument. Emits an error or calls the callback if the baud rate isn't supported.
 * @param {object=} options Only supports `baudRate`.
 * @param {number=} [options.baudRate] The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
 * @param {errorCallback=} [callback] Called once the port's baud rate changes. If `.update` is called without a callback, and there is an error, an error event is emitted.
 * @returns {undefined}
 */
SerialPort.prototype.update = function(options, callback) {
  if (typeof options !== 'object') {
    throw TypeError('"options" is not an object')
  }

  if (!this.isOpen) {
    debug('update attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  const settings = Object.assign({}, defaultSettings, options)
  this.settings.baudRate = settings.baudRate

  debug('update', `baudRate: ${settings.baudRate}`)
  this.binding.update(this.settings).then(
    () => {
      debug('binding.update', 'finished')
      if (callback) {
        callback.call(this, null)
      }
    },
    err => {
      debug('binding.update', 'error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Writes data to the given serial port. Buffers written data if the port is not open.

The write operation is non-blocking. When it returns, data might still not have been written to the serial port. See `drain()`.

Some devices, like the Arduino, reset when you open a connection to them. In such cases, immediately writing to the device will cause lost data as they wont be ready to receive the data. This is often worked around by having the Arduino send a "ready" byte that your Node program waits for before writing. You can also often get away with waiting around 400ms.

If a port is disconnected during a write, the write will error in addition to the `close` event.

From the [stream docs](https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback) write errors don't always provide the error in the callback, sometimes they use the error event.
> If an error occurs, the callback may or may not be called with the error as its first argument. To reliably detect write errors, add a listener for the 'error' event.

In addition to the usual `stream.write` arguments (`String` and `Buffer`), `write()` can accept arrays of bytes (positive numbers under 256) which is passed to `Buffer.from([])` for conversion. This extra functionality is pretty sweet.
 * @method SerialPort.prototype.write
 * @param  {(string|array|buffer)} data Accepts a [`Buffer` ](http://nodejs.org/api/buffer.html) object, or a type that is accepted by the `Buffer` constructor (e.g. an array of bytes or a string).
 * @param  {string=} encoding The encoding, if chunk is a string. Defaults to `'utf8'`. Also accepts `'ascii'`, `'base64'`, `'binary'`, and `'hex'` See [Buffers and Character Encodings](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings) for all available options.
 * @param  {function=} callback Called once the write operation finishes. Data may not yet be flushed to the underlying port. No arguments.
 * @returns {boolean} `false` if the stream wishes for the calling code to wait for the `'drain'` event to be emitted before continuing to write additional data; otherwise `true`.
 * @since 5.0.0
 */
const superWrite = SerialPort.prototype.write
SerialPort.prototype.write = function(data, encoding, callback) {
  if (Array.isArray(data)) {
    data = Buffer.from(data)
  }
  return superWrite.call(this, data, encoding, callback)
}

SerialPort.prototype._write = function(data, encoding, callback) {
  if (!this.isOpen) {
    return this.once('open', function afterOpenWrite() {
      this._write(data, encoding, callback)
    })
  }
  debug('_write', `${data.length} bytes of data`)
  this.binding.write(data).then(
    () => {
      debug('binding.write', 'write finished')
      callback(null)
    },
    err => {
      debug('binding.write', 'error', err)
      if (!err.canceled) {
        this._disconnected(err)
      }
      callback(err)
    }
  )
}

SerialPort.prototype._writev = function(data, callback) {
  debug('_writev', `${data.length} chunks of data`)
  const dataV = data.map(write => write.chunk)
  this._write(Buffer.concat(dataV), null, callback)
}

/**
 * Request a number of bytes from the SerialPort. The `read()` method pulls some data out of the internal buffer and returns it. If no data is available to be read, null is returned. By default, the data is returned as a `Buffer` object unless an encoding has been specified using the `.setEncoding()` method.
 * @method SerialPort.prototype.read
 * @param {number=} size Specify how many bytes of data to return, if available
 * @returns {(string|Buffer|null)} The data from internal buffers
 * @since 5.0.0
 */

/**
 * Listening for the `data` event puts the port in flowing mode. Data is emitted as soon as it's received. Data is a `Buffer` object with a varying amount of data in it. The `readLine` parser converts the data into string lines. See the [parsers](https://node-serialport.github.io/node-serialport/global.html#Parsers) section for more information on parsers, and the [Node.js stream documentation](https://nodejs.org/api/stream.html#stream_event_data) for more information on the data event.
 * @event data
 */

SerialPort.prototype._read = function(bytesToRead) {
  if (!this.isOpen) {
    debug('_read', 'queueing _read for after open')
    this.once('open', () => {
      this._read(bytesToRead)
    })
    return
  }

  if (
    !this._pool ||
    this._pool.length - this._pool.used < this._kMinPoolSpace
  ) {
    debug('_read', 'discarding the read buffer pool')
    this._pool = allocNewReadPool(this.settings.highWaterMark)
  }

  // Grab another reference to the pool in the case that while we're
  // in the thread pool another read() finishes up the pool, and
  // allocates a new one.
  const pool = this._pool
  // Read the smaller of rest of the pool or however many bytes we want
  const toRead = Math.min(pool.length - pool.used, bytesToRead)
  const start = pool.used

  // the actual read.
  debug('_read', `reading`)
  this.binding.read(pool, start, toRead).then(
    bytesRead => {
      debug('binding.read', `finished`)
      // zero bytes means read means we've hit EOF? Maybe this should be an error
      if (bytesRead === 0) {
        debug('binding.read', 'Zero bytes read closing readable stream')
        this.push(null)
        return
      }
      pool.used += bytesRead
      this.push(pool.slice(start, start + bytesRead))
    },
    err => {
      debug('binding.read', `error`, err)
      if (!err.canceled) {
        this._disconnected(err)
      }
      this._read(bytesToRead) // prime to read more once we're reconnected
    }
  )
}

SerialPort.prototype._disconnected = function(err) {
  if (!this.isOpen) {
    debug('disconnected aborted because already closed', err)
    return
  }
  debug('disconnected', err)
  err.disconnected = true
  this.close(null, err)
}

/**
 * The `close` event's callback is called with no arguments when the port is closed. In the case of a disconnect it will be called with a Disconnect Error object (`err.disconnected == true`). In the event of a close error (unlikely), an error event is triggered.
 * @event close
 */

/**
 * Closes an open connection.
 *
 * If there are in progress writes when the port is closed the writes will error.
 * @param {errorCallback} callback Called once a connection is closed.
 * @param {Error} disconnectError used internally to propagate a disconnect error
 * @emits close
 * @returns {undefined}
 */
SerialPort.prototype.close = function(callback, disconnectError) {
  disconnectError = disconnectError || null

  if (!this.isOpen) {
    debug('close attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  this.closing = true
  debug('#close')
  this.binding.close().then(
    () => {
      this.closing = false
      debug('binding.close', 'finished')
      this.emit('close', disconnectError)
      if (callback) {
        callback.call(this, disconnectError)
      }
    },
    err => {
      this.closing = false
      debug('binding.close', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Set control flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for OS X and Linux.
 * @param {object=} options All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options is used.
 * @param {Boolean} [options.brk=false] sets the brk flag
 * @param {Boolean} [options.cts=false] sets the cts flag
 * @param {Boolean} [options.dsr=false] sets the dsr flag
 * @param {Boolean} [options.dtr=true] sets the dtr flag
 * @param {Boolean} [options.rts=true] sets the rts flag
 * @param {errorCallback=} callback Called once the port's flags have been set.
 * @since 5.0.0
 * @returns {undefined}
 */
SerialPort.prototype.set = function(options, callback) {
  if (typeof options !== 'object') {
    throw TypeError('"options" is not an object')
  }

  if (!this.isOpen) {
    debug('set attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  const settings = Object.assign({}, defaultSetFlags, options)
  debug('#set', settings)
  this.binding.set(settings).then(
    () => {
      debug('binding.set', 'finished')
      if (callback) {
        callback.call(this, null)
      }
    },
    err => {
      debug('binding.set', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Returns the control flags (CTS, DSR, DCD) on the open port.
 * Uses [`GetCommModemStatus`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363258(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.
 * @param {modemBitsCallback=} callback Called once the modem bits are retrieved.
 * @returns {undefined}
 */
SerialPort.prototype.get = function(callback) {
  if (!this.isOpen) {
    debug('get attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  debug('#get')
  this.binding.get().then(
    status => {
      debug('binding.get', 'finished')
      if (callback) {
        callback.call(this, null, status)
      }
    },
    err => {
      debug('binding.get', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Flush discards data received but not read, and written but not transmitted by the operating system. For more technical details, see [`tcflush(fd, TCIOFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.
 * @param  {errorCallback=} callback Called once the flush operation finishes.
 * @returns {undefined}
 */
SerialPort.prototype.flush = function(callback) {
  if (!this.isOpen) {
    debug('flush attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  debug('#flush')
  this.binding.flush().then(
    () => {
      debug('binding.flush', 'finished')
      if (callback) {
        callback.call(this, null)
      }
    },
    err => {
      debug('binding.flush', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Waits until all output data is transmitted to the serial port. After any pending write has completed it calls [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) to ensure it has been written to the device.
 * @param {errorCallback=} callback Called once the drain operation returns.
 * @returns {undefined}
 * @example
Write the `data` and wait until it has finished transmitting to the target serial port before calling the callback. This will queue until the port is open and writes are finished.

```js
function writeAndDrain (data, callback) {
  port.write(data);
  port.drain(callback);
}
```
 */
SerialPort.prototype.drain = function(callback) {
  debug('drain')
  if (!this.isOpen) {
    debug('drain queuing on port open')
    return this.once('open', () => {
      this.drain(callback)
    })
  }
  this.binding.drain().then(
    () => {
      debug('binding.drain', 'finished')
      if (callback) {
        callback.call(this, null)
      }
    },
    err => {
      debug('binding.drain', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * The `pause()` method causes a stream in flowing mode to stop emitting 'data' events, switching out of flowing mode. Any data that becomes available remains in the internal buffer.
 * @method SerialPort.prototype.pause
 * @see resume
 * @since 5.0.0
 * @returns `this`
 */

/**
 * The `resume()` method causes an explicitly paused, `Readable` stream to resume emitting 'data' events, switching the stream into flowing mode.
 * @method SerialPort.prototype.resume
 * @see pause
 * @since 5.0.0
 * @returns `this`
 */

/**
 * This callback type is called `requestCallback`.
 * @callback listCallback
 * @param {?error} error
 * @param {array} ports an array of objects with port info
 */

/**
 * Retrieves a list of available serial ports with metadata. Only the `comName` is guaranteed. If unavailable the other fields will be undefined. The `comName` is either the path or an identifier (eg `COM1`) used to open the SerialPort.
 *
 * We make an effort to identify the hardware attached and have consistent results between systems. Linux and OS X are mostly consistent. Windows relies on 3rd party device drivers for the information and is unable to guarantee the information. On windows If you have a USB connected device can we provide a serial number otherwise it will be `undefined`. The `pnpId` and `locationId` are not the same or present on all systems. The examples below were run with the same Arduino Uno.
 * @type {function}
 * @param {listCallback=} callback Called with a list of available serial ports.
 * @returns {Promise} Resolves with the list of available serial ports.
 * @example
```js
// OSX example port
{
  comName: '/dev/tty.usbmodem1421',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: undefined,
  locationId: '14500000',
  productId: '0043',
  vendorId: '2341'
}

// Linux example port
{
  comName: '/dev/ttyACM0',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: 'usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00',
  locationId: undefined,
  productId: '0043',
  vendorId: '2341'
}

// Windows example port
{
  comName: 'COM3',
  manufacturer: 'Arduino LLC (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: 'USB\\VID_2341&PID_0043\\752303138333518011C1',
  locationId: 'Port_#0003.Hub_#0001',
  productId: '0043',
  vendorId: '2341'
}
```

```js
var SerialPort = require('serialport');
// callback approach
SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});

// promise approach
SerialPort.list()
  .then(ports) {...});
  .catch(err) {...});
```
 */
SerialPort.list = function(callback) {
  if (!SerialPort.Binding) {
    throw new TypeError('No Binding set on `SerialPort.Binding`')
  }
  debug('.list')
  const promise = SerialPort.Binding.list()
  if (typeof callback === 'function') {
    promise.then(ports => callback(null, ports), err => callback(err))
  }
  return promise
}

module.exports = SerialPort


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */
if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
  module.exports = __webpack_require__(55);
} else {
  module.exports = __webpack_require__(57);
}



/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
/**
 * Colors.
 */

exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
// eslint-disable-next-line complexity

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  } // Internet Explorer and Edge do not support colors.


  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  } // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into

  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if (match === '%%') {
      return;
    }

    index++;

    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}
/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */


function log() {
  var _console;

  // This hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return (typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && (_console = console).log.apply(_console, arguments);
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  var r;

  try {
    r = exports.storage.getItem('debug');
  } catch (error) {} // Swallow
  // XXX (@Qix-) should we be logging these?
  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */


function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

module.exports = __webpack_require__(35)(exports);
var formatters = module.exports.formatters;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};



/***/ }),
/* 56 */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */
var tty = __webpack_require__(12);

var util = __webpack_require__(2);
/**
 * This is the Node.js implementation of `debug()`.
 */


exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
  // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
  // eslint-disable-next-line import/no-extraneous-dependencies
  var supportsColor = __webpack_require__(13);

  if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
    exports.colors = [20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221];
  }
} catch (error) {} // Swallow - we only care if `supports-color` is available; it doesn't have to be.

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */


exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // Camel-case
  var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function (_, k) {
    return k.toUpperCase();
  }); // Coerce string value into JS value

  var val = process.env[key];

  if (/^(yes|on|true|enabled)$/i.test(val)) {
    val = true;
  } else if (/^(no|off|false|disabled)$/i.test(val)) {
    val = false;
  } else if (val === 'null') {
    val = null;
  } else {
    val = Number(val);
  }

  obj[prop] = val;
  return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  var name = this.namespace,
      useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var colorCode = "\x1B[3" + (c < 8 ? c : '8;5;' + c);
    var prefix = "  ".concat(colorCode, ";1m").concat(name, " \x1B[0m");
    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + "\x1B[0m");
  } else {
    args[0] = getDate() + name + ' ' + args[0];
  }
}

function getDate() {
  if (exports.inspectOpts.hideDate) {
    return '';
  }

  return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */


function log() {
  return process.stderr.write(util.format.apply(util, arguments) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  if (namespaces) {
    process.env.DEBUG = namespaces;
  } else {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  return process.env.DEBUG;
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */


function init(debug) {
  debug.inspectOpts = {};
  var keys = Object.keys(exports.inspectOpts);

  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

module.exports = __webpack_require__(35)(exports);
var formatters = module.exports.formatters;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts).replace(/\s*\n\s*/g, ' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */


formatters.O = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};



/***/ }),
/* 58 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function (flag, argv) {
	argv = argv || process.argv;

	var terminatorPos = argv.indexOf('--');
	var prefix = /^-{1,2}/.test(flag) ? '' : '--';
	var pos = argv.indexOf(prefix + flag);

	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(7)('@serialport/bindings')

switch (process.platform) {
  case 'win32':
    debug('loading WindowsBinding')
    module.exports = __webpack_require__(64)
    break
  case 'darwin':
    debug('loading DarwinBinding')
    module.exports = __webpack_require__(70)
    break
  default:
    debug('loading LinuxBinding')
    module.exports = __webpack_require__(71)
}


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
/**
 * Colors.
 */

exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
// eslint-disable-next-line complexity

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  } // Internet Explorer and Edge do not support colors.


  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  } // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into

  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if (match === '%%') {
      return;
    }

    index++;

    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}
/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */


function log() {
  var _console;

  // This hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return (typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && (_console = console).log.apply(_console, arguments);
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  var r;

  try {
    r = exports.storage.getItem('debug');
  } catch (error) {} // Swallow
  // XXX (@Qix-) should we be logging these?
  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */


function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

module.exports = __webpack_require__(36)(exports);
var formatters = module.exports.formatters;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};



/***/ }),
/* 62 */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */
var tty = __webpack_require__(12);

var util = __webpack_require__(2);
/**
 * This is the Node.js implementation of `debug()`.
 */


exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
  // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
  // eslint-disable-next-line import/no-extraneous-dependencies
  var supportsColor = __webpack_require__(13);

  if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
    exports.colors = [20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221];
  }
} catch (error) {} // Swallow - we only care if `supports-color` is available; it doesn't have to be.

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */


exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // Camel-case
  var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function (_, k) {
    return k.toUpperCase();
  }); // Coerce string value into JS value

  var val = process.env[key];

  if (/^(yes|on|true|enabled)$/i.test(val)) {
    val = true;
  } else if (/^(no|off|false|disabled)$/i.test(val)) {
    val = false;
  } else if (val === 'null') {
    val = null;
  } else {
    val = Number(val);
  }

  obj[prop] = val;
  return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  var name = this.namespace,
      useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var colorCode = "\x1B[3" + (c < 8 ? c : '8;5;' + c);
    var prefix = "  ".concat(colorCode, ";1m").concat(name, " \x1B[0m");
    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + "\x1B[0m");
  } else {
    args[0] = getDate() + name + ' ' + args[0];
  }
}

function getDate() {
  if (exports.inspectOpts.hideDate) {
    return '';
  }

  return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */


function log() {
  return process.stderr.write(util.format.apply(util, arguments) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  if (namespaces) {
    process.env.DEBUG = namespaces;
  } else {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  return process.env.DEBUG;
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */


function init(debug) {
  debug.inspectOpts = {};
  var keys = Object.keys(exports.inspectOpts);

  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

module.exports = __webpack_require__(36)(exports);
var formatters = module.exports.formatters;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts).replace(/\s*\n\s*/g, ' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */


formatters.O = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};



/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

const binding = __webpack_require__(8)('bindings.node')
const AbstractBinding = __webpack_require__(14)
const promisify = __webpack_require__(15).promisify
const serialNumParser = __webpack_require__(69)

/**
 * The Windows binding layer
 */
class WindowsBinding extends AbstractBinding {
  static list() {
    return promisify(binding.list)().then(ports => {
      // Grab the serial number from the pnp id
      ports.forEach(port => {
        if (port.pnpId && !port.serialNumber) {
          const serialNumber = serialNumParser(port.pnpId)
          if (serialNumber) {
            port.serialNumber = serialNumber
          }
        }
      })
      return ports
    })
  }

  constructor(opt) {
    super(opt)
    this.bindingOptions = Object.assign({}, opt.bindingOptions || {})
    this.fd = null
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  open(path, options) {
    return super
      .open(path, options)
      .then(() => {
        this.openOptions = Object.assign({}, this.bindingOptions, options)
        return promisify(binding.open)(path, this.openOptions)
      })
      .then(fd => {
        this.fd = fd
      })
  }

  close() {
    return super.close().then(() => {
      const fd = this.fd
      this.fd = null
      return promisify(binding.close)(fd)
    })
  }

  read(buffer, offset, length) {
    return super
      .read(buffer, offset, length)
      .then(() => promisify(binding.read)(this.fd, buffer, offset, length))
      .catch(err => {
        if (!this.isOpen) {
          err.canceled = true
        }
        throw err
      })
  }

  write(buffer) {
    this.writeOperation = super
      .write(buffer)
      .then(() => promisify(binding.write)(this.fd, buffer))
      .then(() => {
        this.writeOperation = null
      })
    return this.writeOperation
  }

  update(options) {
    return super
      .update(options)
      .then(() => promisify(binding.update)(this.fd, options))
  }

  set(options) {
    return super
      .set(options)
      .then(() => promisify(binding.set)(this.fd, options))
  }

  get() {
    return super.get().then(() => promisify(binding.get)(this.fd))
  }

  getBaudRate() {
    return super.get().then(() => promisify(binding.getBaudRate)(this.fd))
  }

  drain() {
    return super
      .drain()
      .then(() => Promise.resolve(this.writeOperation))
      .then(() => promisify(binding.drain)(this.fd))
  }

  flush() {
    return super.flush().then(() => promisify(binding.flush)(this.fd))
  }
}

module.exports = WindowsBinding


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */
if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
  module.exports = __webpack_require__(66);
} else {
  module.exports = __webpack_require__(68);
}



/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
/**
 * Colors.
 */

exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
// eslint-disable-next-line complexity

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  } // Internet Explorer and Edge do not support colors.


  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  } // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into

  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if (match === '%%') {
      return;
    }

    index++;

    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}
/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */


function log() {
  var _console;

  // This hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return (typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && (_console = console).log.apply(_console, arguments);
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  var r;

  try {
    r = exports.storage.getItem('debug');
  } catch (error) {} // Swallow
  // XXX (@Qix-) should we be logging these?
  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */


function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

module.exports = __webpack_require__(38)(exports);
var formatters = module.exports.formatters;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};



/***/ }),
/* 67 */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */
var tty = __webpack_require__(12);

var util = __webpack_require__(2);
/**
 * This is the Node.js implementation of `debug()`.
 */


exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
  // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
  // eslint-disable-next-line import/no-extraneous-dependencies
  var supportsColor = __webpack_require__(13);

  if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
    exports.colors = [20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221];
  }
} catch (error) {} // Swallow - we only care if `supports-color` is available; it doesn't have to be.

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */


exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // Camel-case
  var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function (_, k) {
    return k.toUpperCase();
  }); // Coerce string value into JS value

  var val = process.env[key];

  if (/^(yes|on|true|enabled)$/i.test(val)) {
    val = true;
  } else if (/^(no|off|false|disabled)$/i.test(val)) {
    val = false;
  } else if (val === 'null') {
    val = null;
  } else {
    val = Number(val);
  }

  obj[prop] = val;
  return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  var name = this.namespace,
      useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var colorCode = "\x1B[3" + (c < 8 ? c : '8;5;' + c);
    var prefix = "  ".concat(colorCode, ";1m").concat(name, " \x1B[0m");
    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + "\x1B[0m");
  } else {
    args[0] = getDate() + name + ' ' + args[0];
  }
}

function getDate() {
  if (exports.inspectOpts.hideDate) {
    return '';
  }

  return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */


function log() {
  return process.stderr.write(util.format.apply(util, arguments) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  if (namespaces) {
    process.env.DEBUG = namespaces;
  } else {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  return process.env.DEBUG;
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */


function init(debug) {
  debug.inspectOpts = {};
  var keys = Object.keys(exports.inspectOpts);

  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

module.exports = __webpack_require__(38)(exports);
var formatters = module.exports.formatters;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts).replace(/\s*\n\s*/g, ' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */


formatters.O = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};



/***/ }),
/* 69 */
/***/ (function(module, exports) {

const PARSERS = [/USB\\(?:.+)\\(.+)/, /FTDIBUS\\(?:.+)\+(.+?)A?\\.+/]

module.exports = function(pnpId) {
  if (!pnpId) {
    return null
  }
  for (let index = 0; index < PARSERS.length; index++) {
    const parser = PARSERS[index]
    const sn = pnpId.match(parser)
    if (sn) {
      return sn[1]
    }
  }
  return null
}


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

const binding = __webpack_require__(8)('bindings.node')
const AbstractBinding = __webpack_require__(14)
const Poller = __webpack_require__(39)
const promisify = __webpack_require__(15).promisify
const unixRead = __webpack_require__(40)
const unixWrite = __webpack_require__(41)

const defaultBindingOptions = Object.freeze({
  vmin: 1,
  vtime: 0,
})

/**
 * The Darwin binding layer for OSX
 */
class DarwinBinding extends AbstractBinding {
  static list() {
    return promisify(binding.list)()
  }

  constructor(opt) {
    super(opt)
    this.bindingOptions = Object.assign(
      {},
      defaultBindingOptions,
      opt.bindingOptions || {}
    )
    this.fd = null
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  open(path, options) {
    return super
      .open(path, options)
      .then(() => {
        this.openOptions = Object.assign({}, this.bindingOptions, options)
        return promisify(binding.open)(path, this.openOptions)
      })
      .then(fd => {
        this.fd = fd
        this.poller = new Poller(fd)
      })
  }

  close() {
    return super.close().then(() => {
      const fd = this.fd
      this.poller.stop()
      this.poller.destroy()
      this.poller = null
      this.openOptions = null
      this.fd = null
      return promisify(binding.close)(fd)
    })
  }

  read(buffer, offset, length) {
    return super
      .read(buffer, offset, length)
      .then(() => unixRead.call(this, buffer, offset, length))
  }

  write(buffer) {
    this.writeOperation = super
      .write(buffer)
      .then(() => unixWrite.call(this, buffer))
      .then(() => {
        this.writeOperation = null
      })
    return this.writeOperation
  }

  update(options) {
    return super
      .update(options)
      .then(() => promisify(binding.update)(this.fd, options))
  }

  set(options) {
    return super
      .set(options)
      .then(() => promisify(binding.set)(this.fd, options))
  }

  get() {
    return super.get().then(() => promisify(binding.get)(this.fd))
  }

  getBaudRate() {
    return super.get().then(() => promisify(binding.getBaudRate)(this.fd))
  }

  drain() {
    return super
      .drain()
      .then(() => Promise.resolve(this.writeOperation))
      .then(() => promisify(binding.drain)(this.fd))
  }

  flush() {
    return super.flush().then(() => promisify(binding.flush)(this.fd))
  }
}

module.exports = DarwinBinding


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

const binding = __webpack_require__(8)('bindings.node')
const AbstractBinding = __webpack_require__(14)
const linuxList = __webpack_require__(72)
const Poller = __webpack_require__(39)
const promisify = __webpack_require__(15).promisify
const unixRead = __webpack_require__(40)
const unixWrite = __webpack_require__(41)

const defaultBindingOptions = Object.freeze({
  vmin: 1,
  vtime: 0,
})
/**
 * The linux binding layer
 */
class LinuxBinding extends AbstractBinding {
  static list() {
    return linuxList()
  }

  constructor(opt) {
    super(opt)
    this.bindingOptions = Object.assign(
      {},
      defaultBindingOptions,
      opt.bindingOptions || {}
    )
    this.fd = null
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  open(path, options) {
    return super
      .open(path, options)
      .then(() => {
        this.openOptions = Object.assign({}, this.bindingOptions, options)
        return promisify(binding.open)(path, this.openOptions)
      })
      .then(fd => {
        this.fd = fd
        this.poller = new Poller(fd)
      })
  }

  close() {
    return super.close().then(() => {
      const fd = this.fd
      this.poller.stop()
      this.poller.destroy()
      this.poller = null
      this.openOptions = null
      this.fd = null
      return promisify(binding.close)(fd)
    })
  }

  read(buffer, offset, length) {
    return super
      .read(buffer, offset, length)
      .then(() => unixRead.call(this, buffer, offset, length))
  }

  write(buffer) {
    this.writeOperation = super
      .write(buffer)
      .then(() => unixWrite.call(this, buffer))
      .then(() => {
        this.writeOperation = null
      })
    return this.writeOperation
  }

  update(options) {
    return super
      .update(options)
      .then(() => promisify(binding.update)(this.fd, options))
  }

  set(options) {
    return super
      .set(options)
      .then(() => promisify(binding.set)(this.fd, options))
  }

  get() {
    return super.get().then(() => promisify(binding.get)(this.fd))
  }

  getBaudRate() {
    return super
      .getBaudRate()
      .then(() => promisify(binding.getBaudRate)(this.fd))
  }

  drain() {
    return super
      .drain()
      .then(() => Promise.resolve(this.writeOperation))
      .then(() => promisify(binding.drain)(this.fd))
  }

  flush() {
    return super.flush().then(() => promisify(binding.flush)(this.fd))
  }
}

module.exports = LinuxBinding


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

const childProcess = __webpack_require__(73)
const Readline = __webpack_require__(42)

// get only serial port names
function checkPathOfDevice(path) {
  return /(tty(S|ACM|USB|AMA|MFD|O)|rfcomm)/.test(path) && path
}

function propName(name) {
  return {
    DEVNAME: 'comName',
    ID_VENDOR_ENC: 'manufacturer',
    ID_SERIAL_SHORT: 'serialNumber',
    ID_VENDOR_ID: 'vendorId',
    ID_MODEL_ID: 'productId',
    DEVLINKS: 'pnpId',
  }[name.toUpperCase()]
}

function decodeHexEscape(str) {
  return str.replace(/\\x([a-fA-F0-9]{2})/g, (a, b) => {
    return String.fromCharCode(parseInt(b, 16))
  })
}

function propVal(name, val) {
  if (name === 'pnpId') {
    const match = val.match(/\/by-id\/([^\s]+)/)
    return (match && match[1]) || undefined
  }
  if (name === 'manufacturer') {
    return decodeHexEscape(val)
  }
  if (/^0x/.test(val)) {
    return val.substr(2)
  }
  return val
}

function listLinux() {
  return new Promise((resolve, reject) => {
    const ports = []
    const ude = childProcess.spawn('udevadm', ['info', '-e'])
    const lines = ude.stdout.pipe(new Readline())
    ude.on('error', reject)
    lines.on('error', reject)

    let port = {}
    let skipPort = false
    lines.on('data', line => {
      const lineType = line.slice(0, 1)
      const data = line.slice(3)
      // new port entry
      if (lineType === 'P') {
        port = {
          manufacturer: undefined,
          serialNumber: undefined,
          pnpId: undefined,
          locationId: undefined,
          vendorId: undefined,
          productId: undefined,
        }
        skipPort = false
        return
      }

      if (skipPort) {
        return
      }

      // Check dev name and save port if it matches flag to skip the rest of the data if not
      if (lineType === 'N') {
        if (checkPathOfDevice(data)) {
          ports.push(port)
        } else {
          skipPort = true
        }
        return
      }

      // parse data about each port
      if (lineType === 'E') {
        const keyValue = data.match(/^(.+)=(.*)/)
        if (!keyValue) {
          return
        }
        const key = propName(keyValue[1])
        if (!key) {
          return
        }
        port[key] = propVal(key, keyValue[2])
      }
    })

    lines.on('finish', () => resolve(ports))
  })
}

module.exports = listLinux


/***/ }),
/* 73 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Parsers are collection of transform streams to processes incoming data
 * @summary The default `Parsers` are [Transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform) that process incoming data. To use the parsers, you must create them and then pipe the Serialport to the parser. Be careful to only write to the SerialPort object and not the parser.
 * @typedef {Object} Parsers
 * @property {Transform} ByteLength
 * @property {Transform} CCtalk
 * @property {Transform} Delimiter
 * @property {Transform} Readline
 * @property {Transform} Ready
 * @property {Transform} Regex

 * @since 5.0.0
 * @example
```js
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = new Readline();
port.pipe(parser);
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');

// Creating the parser and piping can be shortened to
// const parser = port.pipe(new Readline());
```
 */

module.exports = {
  ByteLength: __webpack_require__(75),
  CCTalk: __webpack_require__(76),
  Delimiter: __webpack_require__(43),
  Readline: __webpack_require__(42),
  Ready: __webpack_require__(77),
  Regex: __webpack_require__(78),
}


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

const Transform = __webpack_require__(3).Transform

/**
 * Emit data every number of bytes
 * @extends Transform
 * @param {Object} options parser options object
 * @param {Number} options.length the number of bytes on each data event
 * @summary A transform stream that emits data as a buffer after a specific number of bytes are received. Runs in O(n) time.
 * @example
const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new ByteLength({length: 8}))
parser.on('data', console.log) // will have 8 bytes per data event
 */
class ByteLengthParser extends Transform {
  constructor(options = {}) {
    super(options)

    if (typeof options.length !== 'number') {
      throw new TypeError('"length" is not a number')
    }

    if (options.length < 1) {
      throw new TypeError('"length" is not greater than 0')
    }

    this.length = options.length
    this.position = 0
    this.buffer = Buffer.alloc(this.length)
  }

  _transform(chunk, encoding, cb) {
    let cursor = 0
    while (cursor < chunk.length) {
      this.buffer[this.position] = chunk[cursor]
      cursor++
      this.position++
      if (this.position === this.length) {
        this.push(this.buffer)
        this.buffer = Buffer.alloc(this.length)
        this.position = 0
      }
    }
    cb()
  }

  _flush(cb) {
    this.push(this.buffer.slice(0, this.position))
    this.buffer = Buffer.alloc(this.length)
    cb()
  }
}

module.exports = ByteLengthParser


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

const Transform = __webpack_require__(3).Transform

/**
 * Parse the CCTalk protocol
 * @extends Transform
 * @summary A transform stream that emits CCTalk packets as they are received.
 * @example
const SerialPort = require('serialport')
const CCTalk = require('@serialport/parser-cctalk')
const port = new SerialPort('/dev/ttyUSB0')
const parser = port.pipe(new CCtalk())
parser.on('data', console.log)
 */
class CCTalkParser extends Transform {
  constructor() {
    super()
    this.array = []
    this.cursor = 0
  }
  _transform(buffer, _, cb) {
    this.cursor += buffer.length
    // TODO: Better Faster es7 no supported by node 4
    // ES7 allows directly push [...buffer]
    // this.array = this.array.concat(Array.from(buffer)) //Slower ?!?
    Array.from(buffer).map(byte => this.array.push(byte))
    while (this.cursor > 1 && this.cursor >= this.array[1] + 5) {
      // full frame accumulated
      // copy command from the array
      const FullMsgLength = this.array[1] + 5

      const frame = Buffer.from(this.array.slice(0, FullMsgLength))
      // Preserve Extra Data
      this.array = this.array.slice(frame.length, this.array.length)
      this.cursor -= FullMsgLength
      this.push(frame)
    }
    cb()
  }
}

module.exports = CCTalkParser


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

const Transform = __webpack_require__(3).Transform

/**
 * A transform stream that waits for a sequence of "ready" bytes before emitting a ready event and emitting data events
 * @summary To use the `Ready` parser provide a byte start sequence. After the bytes have been received a ready event is fired and data events are passed through.
 * @extends Transform
 * @example
const SerialPort = require('serialport')
const Ready = require('@serialport/parser-ready')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Ready({ delimiter: 'READY' }))
parser.on('ready', () => console.log('the ready byte sequence has been received'))
parser.on('data', console.log) // all data after READY is received
 */
class ReadyParser extends Transform {
  /**
   *
   * @param {object} options options for the parser
   * @param {string|Buffer|array} options.delimiter data to look for before emitted "ready"
   */
  constructor(options = {}) {
    if (options.delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object')
    }

    if (options.delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length')
    }

    super(options)
    this.delimiter = Buffer.from(options.delimiter)
    this.readOffset = 0
    this.ready = false
  }

  _transform(chunk, encoding, cb) {
    if (this.ready) {
      this.push(chunk)
      return cb()
    }
    const delimiter = this.delimiter
    let chunkOffset = 0
    while (this.readOffset < delimiter.length && chunkOffset < chunk.length) {
      if (delimiter[this.readOffset] === chunk[chunkOffset]) {
        this.readOffset++
      } else {
        this.readOffset = 0
      }
      chunkOffset++
    }
    if (this.readOffset === delimiter.length) {
      this.ready = true
      this.emit('ready')
      const chunkRest = chunk.slice(chunkOffset)
      if (chunkRest.length > 0) {
        this.push(chunkRest)
      }
    }
    cb()
  }
}

module.exports = ReadyParser


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

const Transform = __webpack_require__(3).Transform

/**
 * A transform stream that uses a regular expression to split the incoming text upon.
 *
 * To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 * @extends Transform
 * @example
const SerialPort = require('serialport')
const Regex = require('@serialport/parser-regex')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Regex({ regex: /[\r\n]+/ }))
parser.on('data', console.log)
 */
class RegexParser extends Transform {
  constructor(options) {
    const opts = Object.assign(
      {
        encoding: 'utf8',
      },
      options
    )

    if (opts.regex === undefined) {
      throw new TypeError(
        '"options.regex" must be a regular expression pattern or object'
      )
    }

    if (!(opts.regex instanceof RegExp)) {
      opts.regex = new RegExp(opts.regex)
    }
    super(opts)

    this.regex = opts.regex
    this.data = ''
  }

  _transform(chunk, encoding, cb) {
    const data = this.data + chunk
    const parts = data.split(this.regex)
    this.data = parts.pop()

    parts.forEach(part => {
      this.push(part)
    })
    cb()
  }

  _flush(cb) {
    this.push(this.data)
    this.data = ''
    cb()
  }
}

module.exports = RegexParser


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

var net    = __webpack_require__(80);
var pdu    = __webpack_require__(4);
var stream = __webpack_require__(9);

function Driver() {

}

Driver.connect = function (port, host, options) {
	if (typeof host == "object") {
		options = host;
		host    = "localhost";
	}

	port    = port || 502;
	host    = host || "localhost";
	options = options || {};

	return {
		attach : function (transport, next) {
			if (typeof options == "function") {
				next    = options;
				options = {};
			}

			var onError = function () {
				return next(pdu.Exception.error("GatewayPathUnavailable"));
			};

			var onTimeout = function () {
				// destroy here instead of end, otherwise we end up still getting the system's ETIMEDOUT onError
				socket.destroy();
				return next(pdu.Exception.error("GatewayPathUnavailable"));
			};

			var socket = net.connect(port, host, function () {
				socket.removeListener("error", onError);
				// remove this listener, otherwise it will also act as an inactivity timeout, not just connecting timeout.
				socket.removeListener("timeout", onTimeout);

				return next(null, new stream(transport(socket, options), options));
			});

			if (typeof options.connectTimeout == "undefined") {
				options.connectTimeout = 10000; // 10 secs
			}
			if (options.connectTimeout > 0) {
				socket.setTimeout(options.connectTimeout);
			}

			socket.on("error", onError);
			socket.on("timeout", onTimeout);

			return socket;
		}
	};
};

Driver.server = function (options) {
	options = options || {};

	return {
		attach : function (transport, next) {
			if (typeof options == "function") {
				next    = options;
				options = {};
			}

			var server = net.createServer(function (socket) {
				return next(new stream(transport(socket), options));
			});

			return server;
		}
	};
};

module.exports = Driver;


/***/ }),
/* 80 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var dgram    = __webpack_require__(82);
var Readable = __webpack_require__(3).Readable;
var util     = __webpack_require__(2);
var pdu      = __webpack_require__(4);
var stream   = __webpack_require__(9);

function Driver() {

}

Driver.connect = function (port, host, options) {
	if (typeof host == "object") {
		options = host;
		host    = "localhost";
	}

	port    = port || 502;
	host    = host || "localhost";
	options = options || {};

	return {
		attach : function (transport, next) {
			if (typeof options == "function") {
				next    = options;
				options = {};
			}

			var socket = dgram.createSocket("udp4");

			socket.write = function (data, next) {
				return socket.send(data, 0, data.length, port, host, next);
			};

			socket.on("message", function (msg, info) {
				socket.emit("data", msg);
			});

			setTimeout(function () {
				next(null, new stream(transport(socket, options), options));
			}, 0);

			return socket;
		}
	};
};

Driver.server = function (options) {
	options = options || {};

	return {
		attach : function (transport, next) {
			if (typeof options == "function") {
				next    = options;
				options = {};
			}

			var server = dgram.createSocket("udp4");

			server.on("message", function (msg, rinfo) {
				return next(new stream(transport(new UdpStream(msg, rinfo), options), options));
			});

			return server;
		}
	};
};

function UdpStream(msg, info) {
	Readable.call(this);

	this.msg  = msg;
	this.info = info;
}

util.inherits(UdpStream, Readable);

UdpStream.prototype._read = function (size) {
	this.push(this.msg.slice(0, size));

	this.msg = this.msg.slice(size);

	if (this.msg.length === 0) {
		this.push(null);
	}
};

UdpStream.prototype.write = function (data, next) {
	var socket = dgram.createSocket("udp4");

	socket.send(data, 0, data.length, this.info.port, this.info.address, next);
};

module.exports = Driver;


/***/ }),
/* 82 */
/***/ (function(module, exports) {

module.exports = require("dgram");

/***/ })
/******/ ]);