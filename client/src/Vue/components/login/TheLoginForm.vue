<template>
	<div ref="rootRef" class="the-login-form">
		<div class="form">
			<input id="tenebrieUsername" type="text" placeholder="Username" v-model="username" autofocus />
			<input id="tenebriePassword" type="password" placeholder="Password" v-model="password" />
			<div class="status">
				<span ref="messageRef"> </span>
			</div>
			<div class="submit">
				<button @click="onLogin" class="primary">Login</button>
			</div>
			<div class="to-register">
				<span class="info-text">Not registered?</span> <router-link class="register-link" :to="{ name: 'register' }">Create an account</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import router from '@/Vue/router'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import {onBeforeUnmount, onMounted, ref, watch} from '@vue/composition-api'
import UserLoginErrorCode from '@shared/enums/UserLoginErrorCode'

function TheLoginForm() {
	const rootRef = ref<HTMLDivElement>()
	const messageRef = ref<HTMLSpanElement>()

	const username = ref<string>('')
	const password = ref<string>('')

	watch(() => [username.value, password.value], () => {
		clearMessage()
	})

	onMounted(() => {
		rootRef.value.addEventListener('keydown', onKeyDown)
	})

	onBeforeUnmount(() => {
		rootRef.value.removeEventListener('keydown', onKeyDown)
	})

	const onKeyDown = (event: KeyboardEvent): void => {
		if (event.key === 'Enter') {
			onLogin()
		}
	}

	const onLogin = async(): Promise<void> => {
		clearMessage()
		const credentials = {
			username: username.value,
			password: password.value
		}
		try {
			await axios.post('/api/login', credentials)
			await router.push({ name: 'home' })
			await TextureAtlas.prepare()
		} catch (error) {
			console.error(error)
			setMessage(getErrorMessage(error.response.status, error.response.data.code))
		}
	}

	const getErrorMessage = (statusCode: number, errorCode: number): string => {
		if (statusCode === 400 && errorCode === UserLoginErrorCode.MISSING_CREDENTIALS) {
			return 'Missing username or password'
		} else if (statusCode === 400 && errorCode === UserLoginErrorCode.INVALID_CREDENTIALS) {
			return 'Username and password do not match'
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
		onLogin,
		username,
		password
	}
}

export default {
	setup: TheLoginForm
}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.the-login-form {
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
				& > button {
					font-size: 1em;
				}
			}
		}

		.register-link {
			font-size: 0.8em;
		}
	}
</style>
