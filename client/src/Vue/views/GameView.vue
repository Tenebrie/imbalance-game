<template>
	<div class="game-view">
		<pixi />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Pixi from '../components/pixi/Pixi.vue'

export default defineComponent({
	components: { Pixi },

	computed: {},
})
</script>

<style scoped lang="scss">
.game-view {
	width: 100%;
}
</style>
