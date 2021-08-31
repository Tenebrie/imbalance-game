<template>
	<div class="admin-game-details-view" v-if="hasLoaded">
		<h2>Game Information</h2>
		<div class="info">
			<table>
				<tr>
					<td class="header">ID:</td>
					<td>{{ game.id }}</td>
				</tr>
				<tr>
					<td class="header">Players:</td>
					<td class="players">
						<span v-for="player in game.players" :key="player.id">
							<router-link :to="`/admin/users/${player.id}`">{{ player.username }}</router-link>
						</span>
						<span v-if="game.players.length === 0">[No data]</span>
					</td>
				</tr>
				<tr>
					<td class="header">Ruleset:</td>
					<td>
						<router-link :to="`/admin/rulesets/${game.ruleset}`">{{ game.ruleset }}</router-link>
					</td>
				</tr>
				<tr>
					<td class="header">Status:</td>
					<td>
						<span v-if="!game.closedAt" class="game-active">Active</span>
						<span v-if="game.closedAt" class="game-closed">Closed</span>
					</td>
				</tr>
				<tr>
					<td class="header">Started at:</td>
					<td>
						{{ moment(game.startedAt).format('DD.MM.yyyy, HH:mm:ss') }}
					</td>
				</tr>
				<tr v-if="game.closedAt">
					<td class="header">Closed at:</td>
					<td>
						{{ moment(game.closedAt).format('DD.MM.yyyy, HH:mm:ss') }}
					</td>
				</tr>
				<tr>
					<td class="header">Duration:</td>
					<td>
						{{
							moment(new Date(game.closedAt ? game.closedAt : currentTime) - new Date(game.startedAt))
								.utcOffset(0)
								.format('HH:mm:ss')
						}}
					</td>
				</tr>
				<tr v-if="game.closedAt">
					<td class="header">Close reason:</td>
					<td>{{ game.closeReason }}</td>
				</tr>
				<tr v-if="game.victoriousPlayer">
					<td class="header">Victorious players:</td>
					<td class="players">
						<span v-for="player in game.victoriousPlayer" :key="player.id">
							<router-link class="user-input" :to="`/admin/users/${player.id}`">
								{{ player.username }}
							</router-link>
						</span>
					</td>
				</tr>
			</table>
		</div>
		<div v-if="errors.length > 0">
			<h2>Errors</h2>
			<div class="error-container" v-for="error in errors" :key="error.createdAt">
				<div class="error-description">
					<table>
						<tr>
							<td class="header">Real time:</td>
							<td>
								{{
									new Intl.DateTimeFormat('ru', {
										hour: 'numeric',
										minute: 'numeric',
										second: 'numeric',
									}).format(new Date(error.createdAt))
								}}
							</td>
						</tr>
						<tr>
							<td class="header">Game time:</td>
							<td>
								{{
									new Intl.DateTimeFormat('ru', {
										hour: 'numeric',
										minute: 'numeric',
										second: 'numeric',
										timeZone: 'GMT',
									}).format(new Date(error.createdAt).getTime() - new Date(game.startedAt).getTime())
								}}
							</td>
						</tr>
					</table>
				</div>
				<div class="stacktrace" v-html="error.stack"></div>
			</div>
		</div>
		<div>
			<h2>Game log</h2>
			<AdminGameLog :log="game.eventLog" :players="game.players" />
		</div>
	</div>
</template>

<script lang="ts">
import GameErrorDatabaseEntry from '@shared/models/GameErrorDatabaseEntry'
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'
import axios from 'axios'
import moment from 'moment'
import { defineComponent, onMounted, ref } from 'vue'

import AdminGameLog from '@/Vue/components/admin/gameDetails/AdminGameLog.vue'
import router from '@/Vue/router'

export default defineComponent({
	components: { AdminGameLog },
	setup() {
		const game = ref<GameHistoryDatabaseEntry | null>(null)
		const errors = ref<GameErrorDatabaseEntry[]>([])
		const hasLoaded = ref(false)
		const currentTime = ref(new Date())

		const loadData = async () => {
			const gameId = router.currentRoute.value.params.gameId
			const gameResponse = await axios.get(`/api/admin/games/${gameId}`)
			game.value = gameResponse.data as GameHistoryDatabaseEntry

			if (game.value.errorCount > 0) {
				const errorsResponse = await axios(`/api/admin/games/${gameId}/errors`)

				errors.value = (errorsResponse.data as GameErrorDatabaseEntry[]).map((error) => ({
					...error,
					stack: JSON.parse(error.stack),
				}))
			}
			hasLoaded.value = true
		}

		onMounted(() => {
			loadData()
			setInterval(() => {
				currentTime.value = new Date()
			}, 1000)
		})

		return {
			moment,
			game,
			errors,
			hasLoaded,
			currentTime,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.admin-game-details-view {
	overflow-y: scroll;
	text-align: left;
}

h2 {
	margin-left: 8px;
}

.header {
	font-weight: bold;
	min-width: 200px;
}

.info {
	margin-left: 8px;
	margin-top: 16px;
	line-height: 1.4em;

	.game-active {
		color: darken(cyan, 10);
	}
	.game-closed {
		color: green;
	}

	.players {
		& > *::after {
			content: ', ';
		}

		& > *:last-child::after {
			content: '';
		}
	}
}

.textarea-container {
	display: flex;
	textarea {
		resize: vertical;
		width: 100%;
		height: 512px;
	}
}

.error-container {
	text-align: start;
	margin-bottom: 16px;

	.error-description {
		margin-left: 8px;
		margin-bottom: 2px;
		font-size: 16px;
		line-height: 1.5em;

		.timestamp {
			font-weight: bold;
		}
	}

	.stacktrace {
		font-size: 14px;
		white-space: pre;
		text-align: start;
		padding: 4px 8px;
		font-family: monospace, monospace;
		background: rgba(black, 0.5);
	}

	textarea {
		resize: vertical;
		width: 100%;
		height: 512px;
	}
}
</style>
