<template>
	<div class="admin-games-tables">
		<div v-if="activeGames.length > 0">
			<h2>Active Games</h2>
			<table class="games-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Started at</th>
						<th>Players</th>
						<th>Duration</th>
						<th>Issues</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="game in activeGames" :key="game.id">
						<td>
							<router-link :to="`/admin/games/${game.id}`">{{ game.id.substr(5, 8) }}</router-link>
						</td>
						<td>
							{{ moment(game.startedAt).format('DD.MM.yyyy, HH:mm:ss') }}
						</td>
						<td>
							<div v-for="player in game.players" :key="player.id">
								<router-link class="user-input" :to="`/admin/users/${player.id}`">{{ player.username }}</router-link>
							</div>
						</td>
						<td>
							{{
								moment(currentTime - new Date(game.startedAt))
									.utcOffset(0)
									.format('HH:mm:ss')
							}}
						</td>
						<td>
							<span v-if="Number(game.errorCount) === 0" class="no-errors">None</span>
							<span v-if="Number(game.errorCount) > 0" class="has-errors">
								<router-link :to="`/admin/games/${game.id}`" tag="span" class="clickable-issues">
									{{ game.errorCount }} error<span v-if="Number(game.errorCount) > 1">s</span>
								</router-link>
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<h2>Game History</h2>
		<table class="games-table">
			<thead>
				<tr>
					<th>ID</th>
					<th>Started at</th>
					<th>Players</th>
					<th>Duration</th>
					<th>Close reason</th>
					<th>Victorious player</th>
					<th>Issues</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="game in closedGames" :key="game.id">
					<td>
						<router-link :to="`/admin/games/${game.id}`">{{ game.id.substr(5, 8) }}</router-link>
					</td>
					<td>
						{{ moment(game.startedAt).format('DD.MM.yyyy, HH:mm:ss') }}
					</td>
					<td>
						<div v-for="player in game.players" :key="player.id">
							<router-link class="user-input" :to="`/admin/users/${player.id}`">{{ player.username }}</router-link>
						</div>
					</td>
					<td>
						<div v-if="game.closedAt === game.startedAt">N/A</div>
						<div v-if="game.closedAt !== game.startedAt">
							{{
								moment(new Date(game.closedAt) - new Date(game.startedAt))
									.utcOffset(0)
									.format('HH:mm:ss')
							}}
						</div>
					</td>
					<td>{{ game.closeReason }}</td>
					<td>
						<router-link class="user-input" v-if="game.victoriousPlayer" :to="`/admin/users/${game.victoriousPlayer.id}`">
							{{ game.victoriousPlayer.username }}
						</router-link>
						<span v-if="!game.victoriousPlayer">N/A</span>
					</td>
					<td>
						<span v-if="Number(game.errorCount) === 0" class="no-errors">None</span>
						<span v-if="Number(game.errorCount) > 0" class="has-errors">
							<router-link :to="`/admin/games/${game.id}`" tag="span" class="clickable-issues">
								{{ game.errorCount }} error<span v-if="Number(game.errorCount) > 1">s</span>
							</router-link>
						</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch } from '@vue/composition-api'
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'
import moment from 'moment'

interface Props {
	games: GameHistoryDatabaseEntry[]
}

export default defineComponent({
	props: {
		games: Array as PropType<GameHistoryDatabaseEntry[]>,
	},

	setup(props: Props) {
		const hasLoaded = ref(false)
		const activeGames = ref<GameHistoryDatabaseEntry[]>([])
		const closedGames = ref<GameHistoryDatabaseEntry[]>([])
		const currentTime = ref<Date>(new Date())

		const updateGames = () => {
			activeGames.value = props.games.filter((game) => !game.closedAt)
			closedGames.value = props.games.filter((game) => !!game.closedAt)
		}

		onMounted(() => {
			setInterval(() => {
				currentTime.value = new Date()
			}, 1000)
			updateGames()
		})

		watch(
			() => [props.games],
			() => {
				updateGames()
			}
		)

		return {
			moment,
			hasLoaded,
			activeGames,
			closedGames,
			currentTime,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

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
