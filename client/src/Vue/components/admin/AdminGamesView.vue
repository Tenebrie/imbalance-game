<template>
	<div class="admin-games-view">
		<div v-if="activeGames.length > 0">
			<h2>Active games</h2>
			<table class="games-table">
				<thead>
				<tr>
					<th>ID</th>
					<th>Started at</th>
					<th>Players</th>
				</tr>
				</thead>
				<tbody>
				<tr v-for="(game) in activeGames" :key="game.id">
					<td>
						<router-link :to="`/admin/games/${game.id}`">{{ game.id.substr(0, 8) }}</router-link>
					</td>
					<td>
						{{
							new Intl.DateTimeFormat('ru', {
								year: 'numeric',
								month: 'numeric',
								day: 'numeric',
								hour: 'numeric',
								minute: 'numeric',
								second: 'numeric'
							})
							.format(new Date(game.startedAt))
						}}
					</td>
					<td>
						<div v-for="(player) in game.players" :key="player.id">
							<router-link class="user-input" :to="`/admin/users/${player.id}`">{{ player.username }}</router-link>
						</div>
					</td>
				</tr>
				</tbody>
			</table>
		</div>

		<h2>Closed games</h2>
		<table class="games-table">
			<thead>
			<tr>
				<th>ID</th>
				<th>Started at</th>
				<th>Players</th>
				<th>Duration</th>
				<th>Close reason</th>
				<th>Victorious player</th>
			</tr>
			</thead>
			<tbody>
				<tr v-for="(game) in closedGames" :key="game.id">
					<td>
						<router-link :to="`/admin/games/${game.id}`">{{ game.id.substr(0, 8) }}</router-link>
					</td>
					<td>
						{{
							new Intl.DateTimeFormat('ru', {
								year: 'numeric',
								month: 'numeric',
								day: 'numeric',
								hour: 'numeric',
								minute: 'numeric',
								second: 'numeric'
							})
							.format(new Date(game.startedAt))
						}}
					</td>
					<td>
						<div v-for="(player) in game.players" :key="player.id">
							<router-link class="user-input" :to="`/admin/users/${player.id}`">{{ player.username }}</router-link>
						</div>
					</td>
					<td>
						<div v-if="game.closedAt === game.startedAt">N/A</div>
						<div v-if="game.closedAt !== game.startedAt">
						{{
							new Intl.DateTimeFormat('ru', {
								hour: 'numeric',
								minute: 'numeric',
								second: 'numeric',
								timeZone: 'GMT'
							})
							.format(new Date(new Date(game.closedAt).getTime() - new Date(game.startedAt)))
						}}
						</div>
					</td>
					<td>{{ game.closeReason }}</td>
					<td>
						<router-link class="user-input" v-if="game.victoriousPlayer" :to="`/admin/users/${game.victoriousPlayer.id}`">
							{{ game.victoriousPlayer.username }}
						</router-link>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import {defineComponent, onMounted, ref} from '@vue/composition-api'
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'

export default defineComponent({
	setup() {
		const activeGames = ref<GameHistoryDatabaseEntry[]>([])
		const closedGames = ref<GameHistoryDatabaseEntry[]>([])

		const loadData = async () => {
			const response = await axios.get('/api/admin/games')
			const allGames = (response.data as GameHistoryDatabaseEntry[])
			activeGames.value = allGames.filter(game => !game.closedAt)
			closedGames.value = allGames.filter(game => !!game.closedAt)
		}

		onMounted(() => {
			loadData()
		})

		return {
			activeGames,
			closedGames
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

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

	td, th {
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

	select {
		padding: 2px 4px;
	}
</style>
