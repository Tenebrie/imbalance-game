<template>
	<div class="the-challenge-ai-selection">
		<div class="container" @click="onMenuClick">
			<h2>AI Difficulty</h2>
			<button
				v-for="ruleset in availableRulesets"
				:key="ruleset.class"
				class="primary game-button"
				@click="() => onRulesetSelected(ruleset)"
			>
				{{ $locale.get(`ruleset.${ruleset.class}.label`) }}
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import axios from 'axios'
import GameMessage from '@shared/models/network/GameMessage'
import { computed, defineComponent } from 'vue'
import RulesetRefMessage from '@shared/models/network/ruleset/RulesetRefMessage'

export default defineComponent({
	setup() {
		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		const availableRulesets = computed<RulesetRefMessage[]>(() => store.state.rulesets.pveRulesets)
		console.log(availableRulesets)

		const onRulesetSelected = async (ruleset: RulesetRefMessage): Promise<void> => {
			store.dispatch.popupModule.close()
			const response = await axios.post('/api/games', { ruleset: ruleset.class })
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage)
		}

		return {
			onMenuClick,
			onRulesetSelected,
			availableRulesets,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-challenge-ai-selection {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.container {
	border-radius: 16px;
	width: 300px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: $COLOR-BACKGROUND-TRANSPARENT;
	padding: 16px 32px;

	button {
		width: 100%;
		margin: 8px;
	}
}

.menu-separator {
	width: 100%;
	height: 1px;
	margin: 8px 0;
	background: rgba(black, 0.7);
}

.logo {
	height: 170px;
}
</style>
