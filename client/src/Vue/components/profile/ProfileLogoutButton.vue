<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span>{{ $locale.get('ui.profile.logout') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import { defineComponent } from 'vue'

export default defineComponent({
	methods: {
		async onClick(): Promise<void> {
			try {
				await store.dispatch.logout()
			} catch (e) {
				this.$noty.error('Unable to logout', e)
			}
		},
	},
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
