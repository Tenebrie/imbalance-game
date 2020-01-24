<template>
	<div class="login">
		<div class="username">
			<label for="username">Username</label>
			<input id="username" type="text" v-model="username" />
		</div>
		<div class="password">
			<label for="password">Password</label>
			<input id="password" type="password" v-model="password" />
		</div>
		<div class="submit">
			<button @click="onLogin">Login</button>
			<button @click="onRegister">Register</button>
		</div>
		<div class="status">
			<span ref="message"></span>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import store from '@/Vue/store'
import Player from '@/Pixi/shared/models/Player'

export default Vue.extend({
	data: () => ({
		username: '' as string,
		password: '' as string
	}),

	created(): void {
		this.getProfile()
	},

	methods: {
		async getProfile(): Promise<void> {
			const response = await axios.get('/api/profile')
			const player = response.data.data as Player
			store.commit.setPlayerData(player)

			const messageElement = this.$refs.message as Element
			messageElement.innerHTML = 'Login cookie found'
		},

		async onLogin(): Promise<void> {
			const username = this.username
			const password = this.password
			const messageElement = this.$refs.message as Element
			try {
				await axios.post('/api/login', { username, password })
				await this.getProfile()
				messageElement.innerHTML = 'Login success'
			} catch (error) {
				messageElement.innerHTML = 'Login failure'
			} finally {
				this.username = ''
				this.password = ''
			}
		},

		async onRegister(): Promise<void> {
			const username = this.username
			const password = this.password
			const messageElement = this.$refs.message as Element
			try {
				await axios.post('/api/register', { username, password })
				messageElement.innerHTML = 'Registration success. You can login now'
			} catch (error) {
				messageElement.innerHTML = 'Registration failure. This user probably exists'
			}
		}
	}
})
</script>

<style scoped lang="scss">

</style>
