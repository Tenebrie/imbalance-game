<template>
	<div class="admin-game-log">
		<AdminGameLogGroup v-for="(group, index) in log" :key="index" :group="group" :players="players" />
		<div v-if="log.length === 0">No data available :(</div>
	</div>
</template>

<script lang="ts">
import { GameHistoryPlayerDatabaseEntry } from '@shared/models/GameHistoryDatabaseEntry'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import { defineComponent, PropType } from 'vue'

import AdminGameLogGroup from '@/Vue/components/admin/gameDetails/AdminGameLogGroup.vue'

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
