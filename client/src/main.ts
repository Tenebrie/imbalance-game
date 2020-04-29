import Vue from 'vue'
import App from './Vue/App.vue'
import VueNoty from 'vuejs-noty'
import router from './Vue/router'
import store from './Vue/store'

Vue.config.productionTip = false

Vue.use(VueNoty, {
	layout: 'bottomLeft'
})

new Vue({
	router,
	store: store.original,
	render: h => h(App)
}).$mount('#app')
