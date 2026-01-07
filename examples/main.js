import Vue from 'vue'
import App from './App1.vue'
import element from 'element-ui';
import 'element-ui/lib/theme-chalk/icon.css';
// 导入组件库
import  virtualTreeSelect  from '../src'

// 注册组件库
Vue.use(element)
Vue.use(virtualTreeSelect)
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')