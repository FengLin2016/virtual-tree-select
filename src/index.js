import './reset.css';
import VtreeSelect from '../packages/vtreeselect/index.vue';

const components = [
  VtreeSelect
]

const install = function(Vue, opts = {}) {
  components.forEach(component => {
    Vue.component(component.name, component);
  })
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  version: '0.0.1',
  install,
  VtreeSelect
}