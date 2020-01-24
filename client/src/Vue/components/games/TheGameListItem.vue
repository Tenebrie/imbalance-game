<template>
	<div class="game-list-item" @click="onClick">
		<b>{{ game.name }}</b> | Created by <b>{{ game.owner }}</b> | Players: <b>{{ this.game.playerCount }}</b>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import GameMessage from '@/Pixi/shared/models/network/GameMessage'

export default Vue.extend({
	props: {
		game: Object as () => GameMessage
	},

	data: () => ({

	}),

	methods: {
		onClick(): void {
			store.commit.setSelectedGameId(this.game.id)
		}
	}
})
</script>

<style scoped lang="scss">
	.game-list-item {
		padding: 2px;
		cursor: pointer;
		user-select: none;

		&:hover {
			background: lightpink;
		}
	}
</style>
