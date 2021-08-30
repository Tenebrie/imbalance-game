<template>
	<div class="the-connection-notification">
		<div class="content" :class="notificationClass">Connection to server lost! Trying to reconnect...</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'

import Notifications from '@/utils/Notifications'
import store from '@/Vue/store'

export default defineComponent({
	setup() {
		const isFirstConnect = ref(true)
		const isConnected = computed<boolean>(() => !!store.state.globalWebSocket)

		watch(
			() => [isConnected.value],
			() => {
				if (isConnected.value && !isFirstConnect.value) {
					Notifications.success('Connection restored!')
				} else if (isConnected.value) {
					isFirstConnect.value = false
				}
			}
		)

		const notificationClass = computed(() => ({
			visible: !isConnected.value && !isFirstConnect.value,
		}))

		return {
			isConnected,
			notificationClass,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-connection-notification {
	position: absolute;
	bottom: 0;
	left: 0;

	.content {
		padding: 16px 32px;
		background: #bb20bb;
		margin-bottom: -100%;
		transition: margin-bottom 0.3s;

		&.visible {
			margin-bottom: 0;
		}
	}
}
</style>
