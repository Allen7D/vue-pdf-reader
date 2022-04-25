import { throttle } from "throttle-debounce";

function inserted(el, binding) {
  const callback = binding.value;
  if (binding.modifiers.immediate) {
    callback();
  }
  const throttledScroll = throttle(300, callback);
  el.addEventListener("scroll", throttledScroll, true);
}

export default {
  inserted
};
