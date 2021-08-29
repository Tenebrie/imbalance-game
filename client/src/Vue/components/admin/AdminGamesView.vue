<template>
	<div class="admin-games-view" v-if="hasLoaded">
		<admin-games-tables :games="allGames" />
	</div>
</template>

<script lang="ts">
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'
import axios from 'axios'
import { defineComponent, onMounted, ref } from 'vue'

import AdminGamesTables from '@/Vue/components/admin/AdminGamesTables.vue'

export default defineComponent({
	components: { AdminGamesTables },

	setup() {
		const hasLoaded = ref(false)
		const allGames = ref<GameHistoryDatabaseEntry[]>([])

		const loadData = async () => {
			const response = await axios.get('/api/admin/games')
			allGames.value = response.data as GameHistoryDatabaseEntry[]
			hasLoaded.value = true
		}

		onMounted(() => {
			loadData()
			setInterval(() => {
				loadData()
			}, 30000)
		})

		return {
			hasLoaded,
			allGames,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.admin-games-view {
	overflow-y: scroll;
}

.games-table {
	width: 100%;
	text-align: left;
	border: none;
	border-collapse: collapse;
	margin-bottom: 64px;
}

tr {
	border: none;
}
thead > tr {
	background-color: rgba(black, 0.5);
}
tr:nth-child(even) {
	background-color: rgba(white, 0.05);
}

td,
th {
	padding: 12px 24px;
}

.user-input {
	vertical-align: bottom;
	display: inline-block;
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 180px;
	white-space: nowrap;
}

.action-link {
	cursor: pointer;
	user-select: none;
}

.no-errors {
	color: lightgreen;
}
.has-errors {
	color: lighten(red, 15);
}
.clickable-issues {
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
}

select {
	padding: 2px 4px;
}
</style>
