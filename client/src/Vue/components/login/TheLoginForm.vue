<template>
	<div class="the-login-form">
		<div class="form">
			<input id="tenebrieUsername" type="text" placeholder="Username" v-model="username" autofocus />
			<input id="tenebriePassword" type="password" placeholder="Password" v-model="password" />
			<div class="status">
				<span ref="message"> </span>
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
import Vue from 'vue'
import axios from 'axios'
import TextureAtlas from '@/Pixi/render/TextureAtlas'

export default Vue.extend({
	data: () => ({
		username: '' as string,
		password: '' as string
	}),

	watch: {
		username() {
			this.clearMessage()
		},
		password() {
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
				this.onLogin()
			}
		},

		async onLogin(): Promise<void> {
			const username = this.username
			const password = this.password
			this.clearMessage()
			try {
				await axios.post('/api/login', { username, password })
				await this.$router.push({ name: 'home' })
				await TextureAtlas.prepare()
			} catch (error) {
				this.setMessage('Username or password incorrect')
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
			}
		}

		.register-link {
			font-size: 0.8em;
		}
	}
</style>
