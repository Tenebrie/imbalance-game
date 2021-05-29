<template>
	<div class="admin-player-details-view">
		<h2>Player Information</h2>
		<div class="info" v-if="hasLoaded">
			<table>
				<tr>
					<td class="header">ID:</td>
					<td>{{ player.id }}</td>
				</tr>
				<tr>
					<td class="header">Email:</td>
					<td>{{ player.email }}</td>
				</tr>
				<tr>
					<td class="header">Username:</td>
					<td>
						<router-link :to="`/admin/users/${player.id}`">{{ player.username }}</router-link>
					</td>
				</tr>
				<tr>
					<td class="header">Created at:</td>
					<td>
						{{ moment(player.createdAt).format('DD.MM.yyyy, HH:mm:ss') }}
					</td>
				</tr>
				<tr>
					<td class="header">Accessed at:</td>
					<td>
						{{ moment(player.accessedAt).format('DD.MM.yyyy, HH:mm:ss') }}
					</td>
				</tr>
				<tr>
					<td class="header">Access level:</td>
					<td>
						<span v-if="player.id === currentPlayer.id">
							<select disabled>
								<option>{{ player.accessLevel }}</option>
							</select>
						</span>
						<label v-if="player.id !== currentPlayer.id">
							<select @change="(event) => onAccessLevelChange(player, event)">
								<option :selected="accessLevel === player.accessLevel" :key="accessLevel" v-for="accessLevel in accessLevels">
									{{ accessLevel }}
								</option>
							</select>
						</label>
					</td>
				</tr>
			</table>
		</div>
		<admin-games-tables v-if="hasLoaded" :games="allGames" />
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import AdminGamesTables from '@/Vue/components/admin/AdminGamesTables.vue'
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'
import { useAdminRouteParams } from '@/Vue/components/editor/AdminRouteParams'
import AccessLevel from '@shared/enums/AccessLevel'
import { forEachInStringEnum } from '@/utils/Utils'
import Player from '@shared/models/Player'
import store from '@/Vue/store'
import Notifications from '@/utils/Notifications'
import moment from 'moment'

export default defineComponent({
	components: { AdminGamesTables },

	setup() {
		const hasLoaded = ref(false)
		const allGames = ref<GameHistoryDatabaseEntry[]>([])
		const player = ref<PlayerDatabaseEntry | null>(null)
		const currentPlayer = computed<Player | null>(() => store.state.player)

		const params = useAdminRouteParams()

		const loadData = async () => {
			const playerResponse = await axios.get(`/api/admin/players/${params.value.playerId}`)
			player.value = playerResponse.data as PlayerDatabaseEntry

			const gamesResponse = await axios.get(`/api/admin/games?player=${params.value.playerId}`)
			allGames.value = gamesResponse.data as GameHistoryDatabaseEntry[]
			hasLoaded.value = true
		}

		onMounted(() => {
			loadData()
		})

		watch(
			() => [params.value.playerId],
			() => {
				player.value = null
				allGames.value = []
				hasLoaded.value = false
				loadData()
			}
		)

		const onAccessLevelChange = async (player: PlayerDatabaseEntry, event: Event & { target: { value: AccessLevel } }) => {
			await axios.post(`/api/admin/players/${player.id}/accessLevel`, { accessLevel: event.target.value }).catch(() => {
				Notifications.error('Unable to update user access level')
			})
			Notifications.success('Access level updated!')
			await loadData()
		}

		const accessLevels: string[] = []
		forEachInStringEnum(AccessLevel, (level) => {
			accessLevels.push(level)
		})

		return {
			moment,
			player,
			allGames,
			hasLoaded,
			accessLevels,
			currentPlayer,
			onAccessLevelChange,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.admin-player-details-view {
	overflow-y: scroll;
	text-align: left;
}

.info {
	margin-left: 8px;
	margin-top: 16px;
	line-height: 1.4em;
}

.header {
	font-weight: bold;
	min-width: 200px;
}

/deep/ h2 {
	margin-left: 8px;
}

.textarea-container {
	display: flex;
	textarea {
		resize: vertical;
		width: 100%;
		height: 512px;
	}
}

select {
	padding: 2px 4px;
	width: 100px;
}
</style>
