<template>
	<div class="rules-view">
		<the-rules-list />
	</div>
</template>

<script lang="ts">
import TheRulesList from '../components/rules/TheRulesList.vue'
import { defineComponent } from 'vue'

export default defineComponent({
	components: {
		TheRulesList,
	},
})
</script>

<style scoped lang="scss">
@import '../styles/generic';

.rules-view {
	display: flex;
	align-items: flex-end;
	justify-content: center;

	& > div {
		flex-grow: 0;
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
