<template>
	<div class="game-view">
		<pixi />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Pixi from '../components/pixi/Pixi.vue'

export default Vue.extend({
	components: { Pixi },

	computed: {
	}
})
</script>
