import Vue from 'vue'
import App from './App.vue'
import VTooltip from 'v-tooltip'
import VueTextareaAutosize from 'vue-textarea-autosize'

Vue.use(VTooltip)
Vue.use(VueTextareaAutosize)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
