<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span>Edit your decks</span>
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
	methods: {
		onClick(): void {
			this.$router.push({ name: 'decks' })
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../../styles/generic";

	.button-container {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		button {
			width: 80%;
			max-width: 350px;
			font-size: 1.2em;
			margin-top: 32px;
			margin-bottom: 32px;
		}
	}
</style>
