<template>
	<div class="admin-game-details-view">
		<h3>Raw server response</h3>
		<div class="textarea-container">
			<textarea id="raw" v-text="game" disabled></textarea>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import {defineComponent, onMounted, ref} from '@vue/composition-api'
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'
import router from '@/Vue/router'

export default defineComponent({
	setup() {
		const game = ref<GameHistoryDatabaseEntry | null>(null)

		const loadData = async () => {
			const gameId = router.currentRoute.params.gameId
			const response = await axios.get(`/api/admin/games/${gameId}`)
			game.value = (response.data as GameHistoryDatabaseEntry)
		}

		onMounted(() => {
			loadData()
		})

		return {
			game
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.admin-games-view {
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
