import Directives from "./directives";
import Filters from "./filters";

const KEY_RE = /^[^\|]+/;
const FILTERS_RE = /\|[^\|]+/g;

class Directive {
  constructor(def, attr, arg, key) {
    if (typeof def === "function") {
      this._update = def;
    } else {
      for (let prop in def) {
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
    const filters = attr.value.match(FILTERS_RE);
    if (filters) {
    }
  }

  update(value) {
    this._update(value);
  }
}
export default {
  parse(attr, prefix) {
    if (!attr.name.startsWith(prefix)) {
      return null;
    }
    const noprefix = attr.name.slice(prefix.length + 1);
    const argIndex = noprefix.indexOf("-");
    const arg = argIndex === -1 ? null : noprefix.slice(argIndex + 1);
    const name = arg ? noprefix.slice(0, argIndex) : noprefix;
    const def = Directives[name];
    const key = attr.value.match(KEY_RE);

    return def ? new Directive(def, attr, arg, key[0].trim()) : null;
  }
};
