import Filters from "./filters";
import Directives from "./directives";
import Directive from "./directive";

const prefix = "s";

export default class Sarah {
  constructor(options = {}) {
    if (typeof options.el === "string") {
      this.el = document.querySelector(options.el);
    } else {
      this.el = options.el;
    }

    const root = this.el;
    this._options = options;
    this._bindings = {}; // 收集指令所依赖的数据
    this.scope = {};

    // 处理节点
    this._compileNode(root);
    // init data
    for (let key in this._bindings) {
      this.scope[key] = options.scope[key];
    }
  }

  _compileNode(node) {
    if (node.nodeType === 3) {
      // text node
      this._compileTextNode(node);
    } else if (node.attributes && node.attributes.length) {
      cloneAttributes(node.attributes).forEach(attr => {
        const directive = Directive.parse(attr, prefix);
        if (directive) {
          this._bind(node, directive);
        }
      });
    }
    if (!node["s-block"] && node.childNodes.length) {
      [].forEach.call(node.childNodes, child => {
        this._compileNode(child);
      });
    }
  }

  _compileTextNode(node) {}

  _bind(node, directive) {
    directive.vm = this;
    directive.el = node;

    node.removeAttribute(directive.attr.name);

    let key = directive.key;
    const epr = this._options.eachPrefixRE;
    if (epr) {
      key = key.replace(epr, "");
    }
    const binding = this._bindings[key] || this._createBinding(key);
    binding.directives.push(directive);
    if (directive.bind) {
      directive.bind.call(directive, binding.value);
    }
  }

  _createBinding(key) {
    const binding = {
      value: void 0,
      directives: []
    };
    this._bindings[key] = binding;
    Object.defineProperty(this.scope, key, {
      get() {
        return binding.value;
      },
      set(value) {
        binding.value = value;
        binding.directives.forEach(directive => {
          directive.update(value);
        });
      }
    });
    return binding;
  }

  // lifecycle
  dump() {
    const data = {};
    for (let key in this._bindings) {
      data[key] = this._bindings[key].value;
    }
    return data;
  }
  destroy() {
    for (let key in this._bindings) {
      this._bindings[key].directives.forEach(unbind);
    }
    this.el.parentNode.removeChild(this.el);
    function unbind(directive) {
      directive.unbind && directive.unbind();
    }
  }
}

// clone attributes, so they don't change
function cloneAttributes(attributes) {
  return [].map.call(attributes, attr => ({
    name: attr.name,
    value: attr.value
  }));
}
