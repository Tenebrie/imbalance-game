<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span>{{ $locale.get('ui.profile.logout') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Notifications from '@/utils/Notifications'
import store from '@/Vue/store'

export default defineComponent({
	methods: {
		async onClick(): Promise<void> {
			try {
				await store.dispatch.logout()
			} catch (e) {
				const error = e as Error
				Notifications.error(`Unable to logout: ${error.name}: ${error.message}`)
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
