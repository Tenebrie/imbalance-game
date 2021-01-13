<template>
	<div class="admin-game-log">
		<AdminGameLogGroup v-for="(group, index) in log" :key="index" :group="group" :players="players" />
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import AdminGameLogGroup from '@/Vue/components/admin/gameDetails/AdminGameLogGroup.vue'
import { GameHistoryPlayerDatabaseEntry } from '@shared/models/GameHistoryDatabaseEntry'

export default defineComponent({
	components: { AdminGameLogGroup },
	props: {
		log: {
			type: Array as PropType<EventLogEntryMessage[][]>,
			required: true,
		},
		players: {
			type: Array as PropType<GameHistoryPlayerDatabaseEntry[]>,
			required: true,
		},
	},

	setup() {
		return {}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.admin-game-log {
	margin: 8px;
}
</style>
