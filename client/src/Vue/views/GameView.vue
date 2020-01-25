<template>
	<div class="game-view">
		<pixi />
	</div>
</template>

<script>
import Vue from 'vue'
import Pixi from '../components/pixi/Pixi'

export default Vue.extend({
	components: { Pixi },

	computed: {
	}
})
</script>
