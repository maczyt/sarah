import watchArray from "./watchArray";
import Sarah from "./sarah";

export default {
  text(value) {
    this.el.textContent = value || "";
  },
  class(value) {
    this.el.classList[value ? "add" : "remove"](this.arg);
  },
  show(value) {
    this.el.style.display = value ? "" : "none";
  },
  repeat: {
    bind() {
      this.el["s-block"] = true;
      this.prefixRE = new RegExp("^" + this.arg + ".");
      const ctn = (this.container = this.el.parentNode);
      this.marker = document.createComment("s-repeat-" + this.arg + "-marker");
      ctn.insertBefore(this.marker, this.el);
      ctn.removeChild(this.el);
      this.childSarahs = [];
    },
    update(collection) {
      watchArray(collection, this.mutate.bind(this));
      collection.forEach((item, i) => {
        this.childSarahs.push(this.buildItem(item, i, collection));
      });
    },
    mutate(mutation, h, w, k) {
      console.log(mutation);
    },
    buildItem(data, index, collection) {
      const node = this.el.cloneNode(true);
      const spore = new Sarah({
        el: node,
        scope: data,
        eachPrefixRE: this.prefixRE,
        parentScope: this.vm.scope
      });
      this.container.insertBefore(node, this.marker);
      collection[index] = spore.scope;
      return spore;
    }
  },
  on: {
    update(el, handler, event, directive) {
      if (!directive.handlers) {
        directive.handlers = {};
      }
      const handlers = directive.handlers;
      if (handlers[event]) {
        el.removeEventListener(event, handlers[event]);
      }
      if (handler) {
        handler = handler.bind(el);
        el.addEventListener(event, handler);
        handlers[event] = handler;
      }
    },
    unbind(el, event, directive) {
      if (directive.handlers) {
        el.removeEventListener(event, directive.handlers[event]);
      }
    }
  }
};
