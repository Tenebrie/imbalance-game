<template>
	<div class="the-admin-player-view">
		<table class="players-table">
			<thead>
			<tr>
				<th>ID</th>
				<th>Email</th>
				<th>Username</th>
				<th>Access level</th>
				<th>Actions</th>
			</tr>
			</thead>
			<tbody>
				<tr v-for="(player) in players" :key="player.id">
					<td>{{ player.id.substr(0, 8) }}</td>
					<td>{{ player.email }}</td>
					<td>{{ player.username }}</td>
					<td>{{ player.accessLevel }}</td>
					<td>
						<div v-if="player.id !== currentPlayer.id">
							<a class="action-link" @click="onLogin(player)">Login</a> |
							<span>Disable</span> |
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

export default defineComponent({
	setup() {
		const players = ref<PlayerMessage[]>([])
		const currentPlayer = computed<Player>(() => store.state.player)

		onMounted(async () => {
			const response = await axios.get('/api/admin/players')
			players.value = response.data as PlayerMessage[]
		})

		const onLogin = async(player: PlayerMessage) => {
			const response = await axios.post(`/api/admin/players/${player.id}/login`)
			if (response.status !== 204) {
				return
			}
			window.location.href = '/'
		}

		return {
			currentPlayer,
			players,
			onLogin
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-admin-player-view {

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
</style>
