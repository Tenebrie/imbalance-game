<template>
	<div class="home">
		<pixi />
		<div v-if="!isInGame">
			<login />
			<game-list />
		</div>
	</div>
</template>

<script>
import Vue from 'vue'
import store from '@/Vue/store'
import Pixi from '../components/Pixi'
import Login from '../components/Login'
import GameList from '../components/GameList'

export default Vue.extend({
	components: { Pixi, Login, GameList },

	computed: {
		isInGame() {
			return !!store.state.selectedGameId
		}
	}
})
</script>
