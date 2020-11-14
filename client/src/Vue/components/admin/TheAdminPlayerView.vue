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
				<tr v-for="player in players" :key="player.id" >
					<td>{{ player.id.substr(0, 8) }}</td>
					<td>{{ player.email }}</td>
					<td>{{ player.username }}</td>
					<td>{{ player.accessLevel }}</td>
					<td><span>Impersonate</span> | <span>Disable</span> | <span>Delete</span></td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import {defineComponent, onMounted, ref} from '@vue/composition-api'
import PlayerMessage from '@shared/models/network/player/PlayerMessage'

export default defineComponent({
	setup() {
		const players = ref<PlayerMessage[]>([])

		onMounted(async () => {
			const response = await axios.get('/api/admin/players')
			players.value = response.data as PlayerMessage[]
		})

		return {
			players
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-admin-player-view {

	}

	.players-table {
		margin: 8px 16px;
		width: 100%;
		text-align: left;
	}
</style>
