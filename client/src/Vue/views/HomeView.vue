<template>
	<div class="home-view">
		<game-list />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import GameList from '../components/games/TheGameList.vue'

export default Vue.extend({
	components: { GameList },

	computed: {
		isInGame() {
			return store.getters.gameStateModule.isInGame
		}
	}
})
</script>
