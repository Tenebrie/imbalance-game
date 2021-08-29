import { createApp } from 'vue'
// @ts-ignore
import GSignInButton from 'vue-google-signin-button'

import Localization from '@/Pixi/Localization'
import App from '@/Vue/App.vue'

import router from './Vue/router'

// @ts-ignore
createApp(App)
	.use(router)
	.mixin({
		created() {
			this.$locale = Localization
		},
	})
	.use(GSignInButton)
	.mount('#app')
