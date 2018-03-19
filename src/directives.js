import watchArray from "./watchArray";
import Sarah from "./sarah";

const mutationHandlers = {
  push(m) {
    m.args.forEach((data, i) => {
      const sarah = this.buildItem(data, this.collection.length + i);
      this.container.insertBefore(sarah.el, this.marker);
    });
  }
};

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
  model: {
    bind() {
      this.change = () => {
        this.vm.scope[this.key] = this.el.value;
      };
      this.el.addEventListener("keyup", this.change);
    },
    update(value = "") {
      this.el.value = value;
    },
    unbind() {
      this.el.removeEventListener("keyup", this.change);
    }
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
      this.childSarahs.forEach(child => {
        child.destroy();
      });
      this.childSarahs = [];
      this.collection = collection;
      watchArray(collection, this.mutate.bind(this));
      collection.forEach((item, i) => {
        this.childSarahs.push(this.buildItem(item, i));
      });
    },
    mutate(mutation) {
      mutationHandlers[mutation.event].call(this, mutation);
      // console.log("mutation", mutation);
    },
    buildItem(data, index) {
      const node = this.el.cloneNode(true);
      const spore = new Sarah({
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
    update(handler) {
      const event = this.arg;
      const handlers = (this.handlers = this.handlers || {});
      if (handlers[event]) {
        this.el.removeEventListener(event, handlers[event]);
      }
      if (handler) {
        handler = handler.bind(this.vm);
        this.el.addEventListener(event, handler);
        handlers[event] = handler;
      }
    },
    unbind() {
      const event = this.arg;
      if (this.handlers) {
        this.el.removeEventListener(event, this.handlers[event]);
      }
    }
  }
};
