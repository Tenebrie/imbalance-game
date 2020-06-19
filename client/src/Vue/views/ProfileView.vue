<template>
	<div class="rules-view">
		<the-rules-list />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import TheRulesList from '../components/rules/TheRulesList.vue'

export default Vue.extend({
	components: {
		TheRulesList
	}
})
</script>

<style scoped lang="scss">
	@import "../styles/generic";

	.rules-view {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		& > div {
			width: 50%;
			flex-grow: 0;
			height: 100%;
			display: flex;
			flex-direction: column;
			background: $COLOR-BACKGROUND-TRANSPARENT;

			&.the-rules-list {
				max-width: 960px;
				flex: 1;
				margin: 32px 32px 32px 32px;
			}
		}
	}
</style>
