import virtualTreeSelect from "../packages/virtualTreeSelect/index.vue";
import gxTreeSelect from "../packages/gxTreeSelect/index.vue";
import virtualTree from "../packages/virtualTree/index.vue";
const packageInfo = require("../package.json");
const components = [virtualTreeSelect, gxTreeSelect, virtualTree];

const install = function (Vue, opts = {}) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
};

/* istanbul ignore if */
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  version: packageInfo.version,
  install,
};

export { virtualTreeSelect, gxTreeSelect, virtualTree };
