<template>
	<div class="deck-editor-view">
		<div class="deck-list"></div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'

export default Vue.extend({
	components: { },

	computed: {

	}
})
</script>

<style scoped lang="scss">
	@import "../styles/generic";

	.deck-editor-view {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		& > div {
			height: 75%;
			background: $COLOR-BACKGROUND-TRANSPARENT;
		}

		.deck-list {
			flex: 3;
			margin: 32px;
			max-width: 1024px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
		}
	}
</style>
