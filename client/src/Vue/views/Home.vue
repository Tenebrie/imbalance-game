<template>
	<div class="home">
		<pixi />
		<login />
		<game-list />
	</div>
</template>

<script>
import Vue from 'vue'
import Pixi from '../components/Pixi'
import Login from '../components/Login'
import GameList from '../components/GameList'

export default Vue.extend({
	components: { Pixi, Login, GameList }
})
</script>
