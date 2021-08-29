<template>
	<div class="button-container">
		<button class="primary destructive" @click="onClick">
			<span v-if="!requestInFlight">{{ $locale.get('ui.profile.delete') }}</span>
			<span v-if="requestInFlight">{{ $locale.get('ui.profile.delete.progress') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Notifications from '@/utils/Notifications'
import TheAccountDeletePopup from '@/Vue/components/popup/TheAccountDeletePopup.vue'
import store from '@/Vue/store'

export default defineComponent({
	data: () => ({
		requestInFlight: false,
	}),

	methods: {
		async onClick(): Promise<void> {
			const onConfirm = async () => {
				this.requestInFlight = true
				try {
					await store.dispatch.deleteAccount()
				} catch (e) {
					Notifications.error('Unable to delete your profile!')
				}
				this.requestInFlight = false
			}

			store.dispatch.popupModule.open({
				component: TheAccountDeletePopup,
				onConfirm,
			})
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
