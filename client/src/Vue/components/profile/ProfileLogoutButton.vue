<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span>Logout</span>
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'

export default Vue.extend({
	methods: {
		async onClick(): Promise<void> {
			try {
				await store.dispatch.logout()
			} catch (e) {
				this.$noty.error('Unable to logout')
			}
		}
	}
})
</script>

<style scoped lang="scss">
	.button-container {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		button {
			width: 80%;
			max-width: 350px;
			font-size: 1.2em;
			margin: 16px;
		}
	}
</style>
