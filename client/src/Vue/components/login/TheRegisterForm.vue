<template>
	<div ref="rootRef" class="the-register-form">
		<div class="form">
			<input id="tenebrieEmail" type="text" placeholder="Email" v-model="email" autofocus />
			<input id="tenebrieUsername" type="text" placeholder="Username" v-model="username" />
			<input id="tenebriePassword" type="password" placeholder="Password" v-model="password" />
			<input id="tenebrieConfirmPassword" type="password" placeholder="Confirm password" v-model="confirmPassword" />
			<div class="status">
				<span ref="messageRef"> </span>
			</div>
			<div class="submit">
				<button @click="onRegister" class="primary">Create account</button>
			</div>
			<div class="to-login">
				<span class="info-text">Already have an account?</span> <router-link class="login-link" :to="{ name: 'login' }">Login</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import router from '@/Vue/router'
import {onBeforeUnmount, onMounted, ref, watch} from '@vue/composition-api'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'
import store from '@/Vue/store'

function TheRegisterForm() {
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

	watch(() => [email.value, password.value, confirmPassword.value], () => {
		clearMessage()
	})

	const onKeyDown = (event: KeyboardEvent): void => {
		if (event.key === 'Enter') {
			onRegister()
		}
	}

	const onRegister = async(): Promise<void> => {
		if (password.value !== confirmPassword.value) {
			setMessage('Passwords do not match')
			return
		}

		clearMessage()
		const credentials = {
			email: email.value,
			username: username.value,
			password: password.value
		}
		try {
			await axios.post('/api/user', credentials)
			await axios.post('/api/session', credentials)
			await store.dispatch.userPreferencesModule.fetchPreferences()
			await router.push({ name: 'home' })
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
		onRegister
	}
}

export default {
	setup: TheRegisterForm
}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";
	@import "LoginFormShared";

	.the-register-form {
		@include login-form();

		.info-text {
			font-size: 0.8em;
			color: gray;
		}
		.login-link {
			font-size: 0.8em;
		}
	}
</style>
