<template>
	<div class="admin-player-details-view">
		<h3>Raw server response</h3>
		<div class="textarea-container">
			<textarea id="raw" v-text="player" disabled></textarea>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import {defineComponent, onMounted, ref} from '@vue/composition-api'
import router from '@/Vue/router'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'

export default defineComponent({
	setup() {
		const player = ref<PlayerDatabaseEntry | null>(null)

		const loadData = async () => {
			const playerId = router.currentRoute.params.playerId
			const response = await axios.get(`/api/admin/players/${playerId}`)
			player.value = (response.data as PlayerDatabaseEntry)
		}

		onMounted(() => {
			loadData()
		})

		return {
			player
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.admin-player-details-view {
		overflow-y: scroll;
	}

	.textarea-container {
		display: flex;
		textarea {
			resize: vertical;
			width: 100%;
			height: 512px;
		}
	}
</style>
