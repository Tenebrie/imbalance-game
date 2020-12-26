import Vue from 'vue'
import App from './Vue/App.vue'
import VueNoty from 'vuejs-noty'
import router from './Vue/router'
import store from './Vue/store'
import CompositionApi from '@vue/composition-api'
import Localization from '@/Pixi/Localization'
import GSignInButton from 'vue-google-signin-button'

Vue.config.productionTip = false

Vue.use(VueNoty, {
	layout: 'bottomLeft',
})
Vue.use(CompositionApi)
Vue.use(GSignInButton)

Vue.use({
	install: () => {
		Vue.prototype.$locale = Localization
	},
})

new Vue({
	router,
	store: store.original,
	render: (h) => h(App),
}).$mount('#app')
