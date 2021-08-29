<template>
	<div class="admin-game-log-group">
		<AdminGameLogGroupEntry v-for="(entry, index) in group" :key="index" :entry="entry" :players="players" />
		<div class="separator" />
	</div>
</template>

<script lang="ts">
import { GameHistoryPlayerDatabaseEntry } from '@shared/models/GameHistoryDatabaseEntry'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import { defineComponent, PropType } from 'vue'

import AdminGameLogGroupEntry from '@/Vue/components/admin/gameDetails/AdminGameLogGroupEntry.vue'

export default defineComponent({
	components: { AdminGameLogGroupEntry },
	props: {
		group: {
			type: Array as PropType<EventLogEntryMessage[]>,
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

.admin-game-log-group {
	.separator {
		height: 1px;
		background: gray;
		margin: 16px 0;
	}
}
</style>
