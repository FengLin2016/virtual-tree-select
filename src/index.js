import virtualTreeSelect from '../packages/VTreeSelect/index.vue';

const components = [
  virtualTreeSelect
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
  version: '0.0.3',
  install,
  virtualTreeSelect
}