<template>
	<div class="admin-player-view" v-if="hasLoaded" :onscroll="onScroll" ref="scrollerRef">
		<h2>Registered players</h2>
		<table class="players-table">
			<thead>
				<tr>
					<th>ID</th>
					<th>Email</th>
					<th>Username</th>
					<th>Created at</th>
					<th>Accessed at</th>
					<th>Access level</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="player in players" :key="player.id">
					<td>
						<router-link :to="`/admin/users/${player.id}`">{{ player.id.substr(7, 8) }}</router-link>
					</td>
					<td>
						<span class="user-input">{{ player.email }}</span>
					</td>
					<td>
						<router-link :to="`/admin/users/${player.id}`">{{ player.username }}</router-link>
					</td>
					<td>
						{{ moment(player.createdAt).format('DD.MM.yyyy') }}
					</td>
					<td>
						{{ moment(player.accessedAt).format('DD.MM.yyyy, HH:mm:ss') }}
					</td>
					<td>
						{{ player.accessLevel }}
					</td>
					<td>
						<div v-if="player.id !== currentPlayer.id">
							<a v-if="player.accessLevel !== AccessLevel.DISABLED" class="action-link" @click="onLogin(player)">Login</a>
							<span v-if="player.accessLevel !== AccessLevel.DISABLED"> | </span>
							<a class="action-link" @click="onDelete(player)">Delete</a>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import AccessLevel from '@shared/enums/AccessLevel'
import PlayerMessage from '@shared/models/network/player/PlayerMessage'
import Player from '@shared/models/Player'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import axios from 'axios'
import moment from 'moment'
import { computed, defineComponent, onMounted, ref } from 'vue'

import Notifications from '@/utils/Notifications'
import store from '@/Vue/store'

import usePreserveTableScrollState from './utils/usePreserveTableScrollState'

export default defineComponent({
	setup() {
		const hasLoaded = ref(false)
		const players = ref<PlayerDatabaseEntry[]>([])
		const currentPlayer = computed<Player | null>(() => store.state.player)

		const { onScroll, scrollerRef, restoreScrollState } = usePreserveTableScrollState()

		const loadData = async () => {
			const response = await axios.get('/api/admin/players')
			players.value = response.data as PlayerDatabaseEntry[]
			hasLoaded.value = true
			restoreScrollState()
		}

		onMounted(() => {
			loadData()
		})

		const onLogin = async (player: PlayerMessage) => {
			await axios.post(`/api/admin/players/${player.id}/login`)
			window.location.href = '/'
		}

		const onDelete = async (player: PlayerMessage) => {
			if (!confirm(`Delete user?\n\nEmail: ${player.email}\nUsername: ${player.username}`)) {
				return
			}

			await axios.delete(`/api/admin/players/${player.id}`).catch(() => {
				Notifications.error('Unable to delete user')
			})
			Notifications.success('User deleted!')
			await loadData()
		}

		return {
			moment,
			hasLoaded,
			currentPlayer,
			players,
			onLogin,
			onDelete,
			AccessLevel,
			onScroll,
			scrollerRef,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.admin-player-view {
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

td,
th {
	padding: 12px 12px;
	text-overflow: ellipsis;
	overflow: hidden;
	width: auto;
	white-space: nowrap;
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
</style>
