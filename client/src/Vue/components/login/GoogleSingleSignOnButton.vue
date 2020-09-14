<template>
	<div id="google-login" />
</template>

<script lang="ts">
import {defineComponent, onMounted} from '@vue/composition-api'
import Notifications from '@/utils/Notifications'
import axios from 'axios'
import store from '@/Vue/store'

export default defineComponent({
	setup() {
		onMounted(() => {
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
				await store.dispatch.loginWithSingleSignOn()
			} catch (error) {
				console.error(error)
				Notifications.error('Token validation failed!')
			}
		}
		const onGoogleSignInError = (): void => {
			Notifications.error('Unable to login with Google!')
		}

		return {
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
