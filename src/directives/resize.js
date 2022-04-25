import { throttle } from "throttle-debounce";

const instances = new WeakMap();

function inserted(el, binding) {
  const callback = binding.value;
  const throttledCallback = throttle(300, callback);
  if (instances.has(el)) {
    throw new Error(`Tried to add multiple resize directives for ${el}`);
  }
  instances.set(el, throttledCallback);
  window.addEventListener("resize", throttledCallback, true);
}

function unbind(el) {
  if (instances.has(el)) {
    const callback = instances.get(el);
    instances.delete(el);
    window.removeEventListener("resize", callback, true);
  }
}

export default {
  inserted,
  unbind
};
