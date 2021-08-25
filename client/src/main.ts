import { createApp } from 'vue'
import router from './Vue/router'
import Localization from '@/Pixi/Localization'
// @ts-ignore
import GSignInButton from 'vue-google-signin-button'
import App from '@/Vue/App.vue'

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
