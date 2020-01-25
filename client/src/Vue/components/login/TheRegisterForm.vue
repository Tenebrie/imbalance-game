<template>
	<div class="the-register-form">
		<div class="form">
			<input id="tenebrieUsername" ref="username" type="text" placeholder="Username" v-model="username" autofocus />
			<input id="tenebriePassword" ref="password" type="password" placeholder="Password" v-model="password" />
			<input id="tenebrieConfirmPassword" ref="confirmPassword" type="password" placeholder="Confirm password" v-model="confirmPassword" />
			<div class="status">
				<span ref="message"> </span>
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
import Vue from 'vue'
import axios from 'axios'

export default Vue.extend({
	data: () => ({
		username: '' as string,
		password: '' as string,
		confirmPassword: '' as string
	}),

	watch: {
		username() {
			this.clearMessage()
		},
		password() {
			this.clearMessage()
		},
		confirmPassword() {
			this.clearMessage()
		}
	},

	mounted(): void {
		this.$el.addEventListener('keydown', this.onKeyDown)
	},

	beforeDestroy(): void {
		this.$el.removeEventListener('keydown', this.onKeyDown)
	},

	methods: {
		onKeyDown(event: KeyboardEvent): void {
			if (event.key === 'Enter') {
				this.onRegister()
			}
		},

		async onRegister(): Promise<void> {
			const username = this.username
			const password = this.password
			const confirmPassword = this.confirmPassword
			const messageElement = this.$refs.message as Element

			if (password !== confirmPassword) {
				this.setMessage('Passwords do not match')
				return
			}

			this.clearMessage()
			try {
				await axios.post('/api/register', { username, password })
				await axios.post('/api/login', { username, password })
				await this.$router.push({ name: 'home' })
			} catch (error) {
				this.setMessage('Registration failed. This user probably exists.')
			}
		},

		setMessage(message: string): void {
			const messageElement = this.$refs.message as Element
			messageElement.innerHTML = message
		},

		clearMessage(): void {
			const messageElement = this.$refs.message as Element
			messageElement.innerHTML = ''
		}
	}
})
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

			.to-login {

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
