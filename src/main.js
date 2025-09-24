import Vue from 'vue'
import App from './index/App.vue'


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

