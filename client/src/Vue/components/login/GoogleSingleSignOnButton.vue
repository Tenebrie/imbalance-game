<template>
	<div id="google-login" v-if="isButtonDisplayed" />
</template>

<script lang="ts">
import {computed, defineComponent, onMounted} from '@vue/composition-api'
import Notifications from '@/utils/Notifications'
import axios from 'axios'
import store from '@/Vue/store'

export default defineComponent({
	setup() {
		onMounted(() => {
			if (!isButtonDisplayed.value) {
				return
			}

			gapi.signin2.render('google-login', {
				'width': 256,
				'height': 38,
				'longtitle': true,
				'theme': 'dark',
				'onsuccess': onGoogleSignInSuccess,
				'onfailure': onGoogleSignInError,
			})
		})
		const onGoogleSignInSuccess = async (googleUser): Promise<void> => {
			try {
				await axios.post('/api/user/google', { token: googleUser.wc.id_token })
				const auth2 = gapi.auth2.getAuthInstance()
				await auth2.signOut()
				await store.dispatch.postLogin()
			} catch (error) {
				console.error(error)
				Notifications.error('Token validation failed!')
			}
		}
		const onGoogleSignInError = (): void => {
			Notifications.error('Unable to login with Google!')
		}

		const isButtonDisplayed = computed<boolean>(() => {
			return window.location.hostname.endsWith('tenebrie.com')
		})

		return {
			isButtonDisplayed,
			onGoogleSignInSuccess,
			onGoogleSignInError
		}
	},
})
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	#google-login {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 16px;
	}
</style>
