<template>
	<div ref="rootRef" class="the-register-form">
		<div class="form">
			<div class="input">
				<input
					id="tenebrieEmail"
					class="has-tooltip"
					type="text"
					:placeholder="Localization.get('ui.auth.email')"
					v-model="email"
					autofocus
				/>
				<inline-tooltip class="tooltip">{{ $locale.get('ui.auth.emailTooltip') }}</inline-tooltip>
			</div>
			<div class="input">
				<input id="tenebrieUsername" type="text" :placeholder="Localization.get('ui.auth.username')" v-model="username" />
			</div>
			<div class="input">
				<input
					id="tenebriePassword"
					class="has-tooltip"
					type="password"
					:placeholder="Localization.get('ui.auth.password')"
					v-model="password"
				/>
				<inline-tooltip class="tooltip"><the-password-policy /></inline-tooltip>
			</div>
			<div class="input">
				<input
					id="tenebrieConfirmPassword"
					type="password"
					:placeholder="Localization.get('ui.auth.confirmPassword')"
					v-model="confirmPassword"
				/>
			</div>
			<div class="status">
				<span ref="messageRef"> </span>
			</div>
			<div class="submit">
				<button @click="onRegister" class="primary">{{ $locale.get('ui.auth.createAccount') }}</button>
			</div>
			<div class="to-login">
				<span class="info-text">{{ $locale.get('ui.auth.moveToLogin') }} </span>
				<router-link class="login-link" :to="{ name: 'login' }">{{ $locale.get('ui.auth.login') }}</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from '@vue/composition-api'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'
import store from '@/Vue/store'
import InlineTooltip from '@/Vue/components/utils/InlineTooltip.vue'
import ThePasswordPolicy from '@/Vue/components/utils/ThePasswordPolicy.vue'
import Localization from '@/Pixi/Localization'

export default defineComponent({
	components: {
		InlineTooltip,
		ThePasswordPolicy,
	},
	setup() {
		const rootRef = ref<HTMLDivElement>()
		const messageRef = ref<HTMLSpanElement>()

		const email = ref<string>('')
		const username = ref<string>('')
		const password = ref<string>('')
		const confirmPassword = ref<string>('')

		onMounted(() => {
			rootRef.value.addEventListener('keydown', onKeyDown)
		})

		onBeforeUnmount(() => {
			rootRef.value.removeEventListener('keydown', onKeyDown)
		})

		watch(
			() => [email.value, password.value, confirmPassword.value],
			() => {
				clearMessage()
			}
		)

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Enter') {
				onRegister()
			}
		}

		const onRegister = async (): Promise<void> => {
			if (password.value !== confirmPassword.value) {
				setMessage('Passwords do not match')
				return
			}

			clearMessage()
			const credentials = {
				email: email.value,
				username: username.value,
				password: password.value,
			}
			const profileInformation = {
				userLanguage: store.state.userPreferencesModule.userLanguage,
			}
			try {
				await axios.post('/api/user', credentials)
				await axios.post('/api/session', credentials)
				await axios.put('/api/user/profile', profileInformation)
				await store.dispatch.postLogin()
			} catch (error) {
				console.error(error)
				setMessage(getErrorMessage(error.response.status, error.response.data.code))
			}
		}

		const getErrorMessage = (statusCode: number, errorCode: number): string => {
			if (statusCode === 400) {
				return 'Missing email, username or password'
			} else if (statusCode === 409 && errorCode === UserRegisterErrorCode.EMAIL_TAKEN) {
				return 'A user with this email already exists'
			} else if (statusCode === 409 && errorCode === UserRegisterErrorCode.USERNAME_COLLISIONS) {
				return 'Unable to reserve a username'
			} else if (statusCode === 500) {
				return 'Internal server error'
			} else if (statusCode === 503) {
				return 'Database client is not yet ready'
			} else {
				return `Unknown error with code ${statusCode}`
			}
		}

		const setMessage = (message: string): void => {
			messageRef.value.innerHTML = message
		}

		const clearMessage = (): void => {
			messageRef.value.innerHTML = ''
		}

		return {
			rootRef,
			messageRef,
			email,
			username,
			password,
			confirmPassword,
			onRegister,
			Localization,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';
@import 'LoginFormShared';

.the-register-form {
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

		input.has-tooltip {
			padding-right: 2.5em;
		}
	}

	.info-text {
		font-size: 0.8em;
		color: gray;
	}
	.login-link {
		font-size: 0.8em;
	}
}
</style>
