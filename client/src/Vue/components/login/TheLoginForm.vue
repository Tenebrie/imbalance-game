<template>
	<div ref="rootRef" class="the-login-form">
		<div class="form">
			<div class="input">
				<input id="tenebrieEmail" type="text" :placeholder="Localization.get('ui.auth.email')" v-model="email" autofocus />
			</div>
			<div class="input">
				<input id="tenebriePassword" type="password" :placeholder="Localization.get('ui.auth.password')" v-model="password" />
			</div>
			<div class="status">
				<span ref="messageRef"> </span>
			</div>
			<div class="submit">
				<button @click="onLogin" class="primary">{{ $locale.get('ui.auth.login') }}</button>
			</div>
			<div class="to-register">
				<span class="info-text">{{ $locale.get('ui.auth.moveToRegister') }} </span>
				<router-link class="register-link" :to="{ name: 'register' }">{{ $locale.get('ui.auth.createAccount') }}</router-link>
			</div>
			<div class="guest-login">
				<span class="info-text">Alternatively, you can</span>
				<button @click="onGuestLogin" class="guest-login-button">Login as Guest</button>
			</div>
			<google-single-sign-on-button />
		</div>
	</div>
</template>

<script lang="ts">
import UserLoginErrorCode from '@shared/enums/UserLoginErrorCode'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import Localization from '@/Pixi/Localization'
import GoogleSingleSignOnButton from '@/Vue/components/login/GoogleSingleSignOnButton.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		GoogleSingleSignOnButton,
	},

	setup() {
		const rootRef = ref<HTMLDivElement>()
		const messageRef = ref<HTMLSpanElement>()

		const email = ref<string>('')
		const password = ref<string>('')

		watch(
			() => [email.value, password.value],
			() => {
				clearMessage()
			}
		)

		onMounted(() => {
			rootRef.value!.addEventListener('keydown', onKeyDown)
		})

		onBeforeUnmount(() => {
			rootRef.value!.removeEventListener('keydown', onKeyDown)
		})

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Enter') {
				onLogin()
			}
		}

		const onLogin = async (): Promise<void> => {
			clearMessage()
			const credentials = {
				email: email.value,
				password: password.value,
			}
			try {
				await store.dispatch.login(credentials)
			} catch (error) {
				console.error(error)
				setMessage(getErrorMessage(error.response.status, error.response.data.code))
			}
		}

		const onGuestLogin = async (): Promise<void> => {
			clearMessage()
			try {
				await store.dispatch.guestLogin()
			} catch (error) {
				console.error(error)
				setMessage(getErrorMessage(error.response.status, error.response.data.code))
			}
		}

		const getErrorMessage = (statusCode: number, errorCode: number): string => {
			if (errorCode === UserLoginErrorCode.MISSING_CREDENTIALS) {
				return 'Missing email or password'
			} else if (errorCode === UserLoginErrorCode.INVALID_CREDENTIALS) {
				return 'Username and password do not match'
			} else if (statusCode === 402) {
				return 'Your account has been disabled'
			} else if (statusCode === 500) {
				return 'Internal server error'
			} else if (statusCode === 503) {
				return 'Database client is not yet ready'
			} else {
				return `Unknown error with code ${statusCode}`
			}
		}

		const setMessage = (message: string): void => {
			messageRef.value!.innerHTML = message
		}

		const clearMessage = (): void => {
			messageRef.value!.innerHTML = ''
		}

		return {
			rootRef,
			messageRef,
			onLogin,
			onGuestLogin,
			email,
			password,
			Localization,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';
@import 'LoginFormShared';

.the-login-form {
	@include login-form();

	.form > .input {
		position: relative;
		display: flex;
		flex-direction: row;

		.tooltip {
			position: absolute;
			right: 0;
			height: 100%;
		}
	}

	.register-link {
		margin-left: 3px;
		font-size: 0.8em;
	}

	.guest-login-button {
		background: none;
		border: none;
		color: $COLOR-SECONDARY;

		&:hover {
			text-decoration: underline;
		}
	}
}
</style>
