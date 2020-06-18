<template>
	<div ref="rootRef" class="the-register-form">
		<div class="form">
			<input id="tenebrieUsername" type="text" placeholder="Username" v-model="username" autofocus />
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

function TheRegisterForm() {
	const rootRef = ref<HTMLDivElement>()
	const messageRef = ref<HTMLSpanElement>()

	const username = ref<string>('')
	const password = ref<string>('')
	const confirmPassword = ref<string>('')

	onMounted(() => {
		rootRef.value.addEventListener('keydown', onKeyDown)
	})

	onBeforeUnmount(() => {
		rootRef.value.removeEventListener('keydown', onKeyDown)
	})

	watch(() => [username.value, password.value, confirmPassword.value], () => {
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
			username: username.value,
			password: password.value
		}
		try {
			await axios.post('/api/register', credentials)
			await axios.post('/api/login', credentials)
			await router.push({ name: 'home' })
		} catch (error) {
			console.error(error)
			setMessage(getErrorMessage(error.response.status))
		}
	}

	const getErrorMessage = (statusCode: number): string => {
		switch (statusCode) {
			case 400:
				return 'Missing username or password'
			case 409:
				return 'User already exists'
			case 500:
				return 'Internal server error'
			case 503:
				return 'Database client is not yet ready'
			default:
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

	.the-register-form {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		.form {
			width: 16em;
			padding: 32px;
			background: rgba(white, 0.1);

			.status {
				text-align: start;
				color: lighten(red, 20);
			}

			.submit {
				margin: 8px 0;
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
