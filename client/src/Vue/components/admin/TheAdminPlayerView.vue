<template>
	<div class="the-admin-player-view">
		<table class="players-table">
			<thead>
			<tr>
				<th>ID</th>
				<th>Email</th>
				<th>Username</th>
				<th>Created at</th>
				<th>Access level</th>
				<th>Actions</th>
			</tr>
			</thead>
			<tbody>
				<tr v-for="(player) in players" :key="player.id">
					<td>{{ player.id.substr(0, 8) }}</td>
					<td>{{ player.email }}</td>
					<td>{{ player.username }}</td>
					<td>{{ new Intl.DateTimeFormat('ru').format(new Date(player.createdAt)) }}</td>
					<td>
						<span v-if="player.id === currentPlayer.id">{{ player.accessLevel }}</span>
						<label v-if="player.id !== currentPlayer.id">
							<select @change="event => onAccessLevelChange(player, event)">
								<option :selected="accessLevel === player.accessLevel" :key="accessLevel" v-for="accessLevel in accessLevels">{{ accessLevel }}</option>
							</select>
						</label>
					</td>
					<td>
						<div v-if="player.id !== currentPlayer.id">
							<a v-if="player.accessLevel !== AccessLevel.DISABLED" class="action-link" @click="onLogin(player)">Login</a>
							<span v-if="player.accessLevel !== AccessLevel.DISABLED"> | </span>
							<span>Delete</span>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import {computed, defineComponent, onMounted, ref} from '@vue/composition-api'
import PlayerMessage from '@shared/models/network/player/PlayerMessage'
import store from '@/Vue/store'
import Player from '@shared/models/Player'
import AccessLevel from '@shared/enums/AccessLevel'
import Utils, {forEachInStringEnum} from '@/utils/Utils'
import Notifications from '@/utils/Notifications'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'

export default defineComponent({
	setup() {
		const players = ref<PlayerDatabaseEntry[]>([])
		const currentPlayer = computed<Player>(() => store.state.player)

		const loadData = async () => {
			const response = await axios.get('/api/admin/players')
			players.value = (response.data as PlayerDatabaseEntry[])
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		}

		onMounted(() => {
			loadData()
		})

		const onLogin = async(player: PlayerMessage) => {
			const response = await axios.post(`/api/admin/players/${player.id}/login`)
			if (response.status !== 204) {
				return
			}
			window.location.href = '/'
		}

		const onAccessLevelChange = async(player: Player, event: Event & { target: { value: AccessLevel }}) => {
			const response = await axios.post(`/api/admin/players/${player.id}/accessLevel`, { accessLevel: event.target.value })
			if (response.status === 204) {
				Notifications.success('Access level updated!')
			} else {
				Notifications.error('Unable to update user access level')
			}
			await loadData()
		}

		const accessLevels: string[] = []
		forEachInStringEnum(AccessLevel, level => {
			accessLevels.push(level)
		})

		return {
			currentPlayer,
			players,
			accessLevels,
			onLogin,
			onAccessLevelChange,
			AccessLevel
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-admin-player-view {
		overflow-y: scroll;
	}

	.players-table {
		width: 100%;
		text-align: left;
		border: none;
		border-collapse: collapse;
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

	.action-link {
		cursor: pointer;
		user-select: none;
	}

	select {
		padding: 2px 4px;
	}
</style>
