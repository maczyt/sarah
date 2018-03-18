(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _directives = require("./directives");

var _directives2 = _interopRequireDefault(_directives);

var _filters = require("./filters");

var _filters2 = _interopRequireDefault(_filters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KEY_RE = /^[^\|]+/;
var FILTERS_RE = /\|[^\|]+/g;

var Directive = function () {
  function Directive(def, attr, arg, key) {
    _classCallCheck(this, Directive);

    if (typeof def === "function") {
      this._update = def;
    } else {
      for (var prop in def) {
        if (prop === "update") {
          this._update = def.update;
          continue;
        }
        this[prop] = def[prop];
      }
    }
    this.attr = attr;
    this.arg = arg;
    this.key = key;
    var filters = attr.value.match(FILTERS_RE);
    if (filters) {}
  }

  _createClass(Directive, [{
    key: "update",
    value: function update(value) {
      this._update(value);
    }
  }]);

  return Directive;
}();

exports.default = {
  parse: function parse(attr, prefix) {
    if (!attr.name.startsWith(prefix)) {
      return null;
    }
    var noprefix = attr.name.slice(prefix.length + 1);
    var argIndex = noprefix.indexOf("-");
    var arg = argIndex === -1 ? null : noprefix.slice(argIndex + 1);
    var name = arg ? noprefix.slice(0, argIndex) : noprefix;
    var def = _directives2.default[name];
    var key = attr.value.match(KEY_RE);

    return def ? new Directive(def, attr, arg, key[0].trim()) : null;
  }
};

},{"./directives":2,"./filters":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _watchArray = require("./watchArray");

var _watchArray2 = _interopRequireDefault(_watchArray);

var _sarah = require("./sarah");

var _sarah2 = _interopRequireDefault(_sarah);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mutationHandlers = {
  push: function push(m) {
    var _this = this;

    m.args.forEach(function (data, i) {
      var sarah = _this.buildItem(data, _this.collection.length + i);
      _this.container.insertBefore(sarah.el, _this.marker);
    });
  }
};

exports.default = {
  text: function text(value) {
    this.el.textContent = value || "";
  },
  class: function _class(value) {
    this.el.classList[value ? "add" : "remove"](this.arg);
  },
  show: function show(value) {
    this.el.style.display = value ? "" : "none";
  },

  repeat: {
    bind: function bind() {
      this.el["s-block"] = true;
      this.prefixRE = new RegExp("^" + this.arg + ".");
      var ctn = this.container = this.el.parentNode;
      this.marker = document.createComment("s-repeat-" + this.arg + "-marker");
      ctn.insertBefore(this.marker, this.el);
      ctn.removeChild(this.el);
      this.childSarahs = [];
    },
    update: function update(collection) {
      var _this2 = this;

      this.collection = collection;
      (0, _watchArray2.default)(collection, this.mutate.bind(this));
      collection.forEach(function (item, i) {
        _this2.childSarahs.push(_this2.buildItem(item, i));
      });
    },
    mutate: function mutate(mutation) {
      mutationHandlers[mutation.event].call(this, mutation);
      // console.log("mutation", mutation);
    },
    buildItem: function buildItem(data, index) {
      var node = this.el.cloneNode(true);
      var spore = new _sarah2.default({
        el: node,
        scope: data,
        eachPrefixRE: this.prefixRE,
        parentScope: this.vm.scope
      });
      this.container.insertBefore(node, this.marker);
      this.collection[index] = spore.scope;
      return spore;
    }
  },
  on: {
    update: function update(handler) {
      var event = this.arg;
      var handlers = this.handlers = this.handlers || {};
      if (handlers[event]) {
        this.el.removeEventListener(event, handlers[event]);
      }
      if (handler) {
        handler = handler.bind(this.vm);
        this.el.addEventListener(event, handler);
        handlers[event] = handler;
      }
    },
    unbind: function unbind() {
      var event = this.arg;
      if (this.handlers) {
        this.el.removeEventListener(event, this.handlers[event]);
      }
    }
  }
};

},{"./sarah":5,"./watchArray":6}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  capitalize: function capitalize(value) {
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
};

},{}],4:[function(require,module,exports){
"use strict";

var _sarah = require("./sarah");

var _sarah2 = _interopRequireDefault(_sarah);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.Sarah = _sarah2.default;

},{"./sarah":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _filters = require("./filters");

var _filters2 = _interopRequireDefault(_filters);

var _directives = require("./directives");

var _directives2 = _interopRequireDefault(_directives);

var _directive = require("./directive");

var _directive2 = _interopRequireDefault(_directive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var prefix = "s";

var Sarah = function () {
  function Sarah() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Sarah);

    if (typeof options.el === "string") {
      this.el = document.querySelector(options.el);
    } else {
      this.el = options.el;
    }

    var root = this.el;
    this._options = options;
    this._bindings = {}; // 收集指令所依赖的数据
    this.scope = {};

    // 处理节点
    this._compileNode(root);
    // init data
    for (var key in this._bindings) {
      this.scope[key] = options.scope[key];
    }
  }

  _createClass(Sarah, [{
    key: "_compileNode",
    value: function _compileNode(node) {
      var _this = this;

      if (node.nodeType === 3) {
        // text node
        this._compileTextNode(node);
      } else if (node.attributes && node.attributes.length) {
        cloneAttributes(node.attributes).forEach(function (attr) {
          var directive = _directive2.default.parse(attr, prefix);
          if (directive) {
            _this._bind(node, directive);
          }
        });
      }
      if (!node["s-block"] && node.childNodes.length) {
        [].forEach.call(node.childNodes, function (child) {
          _this._compileNode(child);
        });
      }
    }
  }, {
    key: "_compileTextNode",
    value: function _compileTextNode(node) {}
  }, {
    key: "_bind",
    value: function _bind(node, directive) {
      directive.vm = this;
      directive.el = node;

      node.removeAttribute(directive.attr.name);

      var key = directive.key;
      var epr = this._options.eachPrefixRE;
      if (epr) {
        key = key.replace(epr, "");
      }
      var binding = this._bindings[key] || this._createBinding(key);
      binding.directives.push(directive);
      if (directive.bind) {
        directive.bind.call(directive, binding.value);
      }
    }
  }, {
    key: "_createBinding",
    value: function _createBinding(key) {
      var binding = {
        value: void 0,
        directives: []
      };
      this._bindings[key] = binding;
      Object.defineProperty(this.scope, key, {
        get: function get() {
          return binding.value;
        },
        set: function set(value) {
          binding.value = value;
          binding.directives.forEach(function (directive) {
            directive.update(value);
          });
        }
      });
      return binding;
    }

    // lifecycle

  }, {
    key: "dump",
    value: function dump() {
      var data = {};
      for (var key in this._bindings) {
        data[key] = this._bindings[key].value;
      }
      return data;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      for (var key in this._bindings) {
        this._bindings[key].directives.forEach(unbind);
      }
      this.el.parentNode.removeChild(this.el);
      function unbind(directive) {
        directive.unbind && directive.unbind();
      }
    }
  }]);

  return Sarah;
}();

// clone attributes, so they don't change


exports.default = Sarah;
function cloneAttributes(attributes) {
  return [].map.call(attributes, function (attr) {
    return {
      name: attr.name,
      value: attr.value
    };
  });
}

},{"./directive":1,"./directives":2,"./filters":3}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ArrayProto = Array.prototype;
var mutatorMethods = ["push", "unshift", "pop", "shift", "splice", "reverse", "sort"];

exports.default = function (arr, callback) {
  mutatorMethods.forEach(function (method) {
    arr[method] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      ArrayProto[method].apply(this, args);
      callback({
        event: method,
        args: args,
        array: arr
      });
    };
  });
};

},{}]},{},[4]);
