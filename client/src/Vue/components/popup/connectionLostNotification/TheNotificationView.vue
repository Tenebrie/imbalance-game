<template>
	<div class="the-notification-view">
		<notification-list-item
			v-for="item in temporary"
			:key="item.id"
			:item="item"
			:index="getIndexOfTemporary(item)"
			:count="getCountOfTemporary()"
		/>
		<notification-list-item
			v-for="item in persistent"
			:key="item.id"
			:item="item"
			:index="getIndexOfPersistent(item)"
			:count="getCountOfPersistent()"
		/>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import NotificationListItem from '@/Vue/components/popup/connectionLostNotification/NotificationListItem.vue'
import store from '@/Vue/store'
import { PersistentNotificationItem, TemporaryNotificationItem } from '@/Vue/store/modules/NotificationModule'

export default defineComponent({
	components: { NotificationListItem },
	setup() {
		const temporary = computed(() => store.state.notifications.temporary)
		const persistent = computed(() => store.state.notifications.persistent)

		const getCountOfTemporary = (): number => {
			const validTemporaryItems = temporary.value.filter((t) => !t.discarded)
			const validPersistentItems = persistent.value.filter((p) => !p.discarded)
			return validTemporaryItems.length + validPersistentItems.length
		}

		const getCountOfPersistent = (): number => {
			const validPersistentItems = persistent.value.filter((p) => !p.discarded)
			return validPersistentItems.length
		}

		const getIndexOfTemporary = (item: TemporaryNotificationItem): number => {
			const validTemporaryItems = temporary.value.filter((t) => !t.discarded)
			const validPersistentItems = persistent.value.filter((p) => !p.discarded)
			return validTemporaryItems.indexOf(item) + validPersistentItems.length
		}

		const getIndexOfPersistent = (item: PersistentNotificationItem): number => {
			const validPersistentItems = persistent.value.filter((p) => !p.discarded)
			return validPersistentItems.indexOf(item)
		}

		return {
			temporary,
			persistent,
			getIndexOfTemporary,
			getIndexOfPersistent,
			getCountOfTemporary,
			getCountOfPersistent,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-notification-view {
	position: absolute;
	bottom: 8px;
	left: 0;
	width: 100%;
	z-index: 1000;
	pointer-events: none;
}
</style>
