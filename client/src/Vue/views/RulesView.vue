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
		align-items: flex-end;
		justify-content: center;

		& > div {
			flex-grow: 0;
			height: calc(100% - #{$NAVIGATION-BAR-HEIGHT});
			display: flex;
			flex-direction: column;
			background: $COLOR-BACKGROUND-TRANSPARENT;

			&.the-rules-list {
				flex: 1;
				max-width: 960px;
			}
		}
	}
</style>
