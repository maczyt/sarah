const ArrayProto = Array.prototype;
const mutatorMethods = [
  "push",
  "unshift",
  "pop",
  "shift",
  "splice",
  "reverse",
  "sort"
];

export default (arr, callback) => {
  mutatorMethods.forEach(method => {
    arr[method] = function(...args) {
      ArrayProto[method].apply(this, args);
      callback({
        event: method,
        args,
        array: arr
      });
    };
  });
};
