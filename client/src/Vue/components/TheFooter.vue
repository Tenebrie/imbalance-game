<template>
	<div class="the-footer">
		<div class="info"><b>Contact:</b> notgwent@tenebrie.com • <b>Version:</b> v1.3 (07.02.2020)</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'

export default Vue.extend({
	components: {
	},

	data: () => ({

	}),

	computed: {
		isInGame() {
			return store.getters.gameStateModule.isInGame
		}
	},

	methods: {

	}
})
</script>

<style scoped lang="scss">
	.the-footer {
		position: absolute;
		bottom: 0;
		width: 100%;
		color: #2c3e50;

		.info {
			padding: 4px 8px;
			text-align: end;
		}
	}
</style>
