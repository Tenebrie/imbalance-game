<template>
	<div class="the-home-action-container">
		<div class="the-home-action">
			<div class="controls">
				<div class="button-container">
					<h2>Create game</h2>
					<button @click="onCreateSinglePlayer" class="primary">{{ $locale.get('ui.play.pve') }}</button>
					<span class="action-explanation">Play against normal AI, or a special challenge scenario.</span>
					<button @click="onCreateMultiPlayer" class="primary">{{ $locale.get('ui.play.pvp') }}</button>
					<span class="action-explanation">Create a game and wait for an opponent to challenge you.</span>
					<button @click="onCreateCooperative" class="primary">{{ $locale.get('ui.play.coop') }}</button>
					<span class="action-explanation">Invite a friend to play against AI opponent.</span>
					<button @click="onCreateLabyrinth" class="primary">{{ $locale.get('ui.play.labyrinth') }}</button>
					<span class="action-explanation">Delve into the rogue-lite Labyrinth mode.</span>
					<button @click="onCreatePrototypes" class="primary">{{ $locale.get('ui.play.prototypes') }}</button>
					<span class="action-explanation">See early concepts, modules and gamemode prototypes.</span>
					<button @click="onCreateDevRuleset" class="primary" v-if="devRulesetVisible">{{ $locale.get('ui.play.dev') }}</button>
					<span class="action-explanation" v-if="devRulesetVisible">Play special ruleset defined in RulesetDev.ts (server-side).</span>
					<div class="separator" />
					<editor-decks-button />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import store from '@/Vue/store'
import GameMessage from '@shared/models/network/GameMessage'
import ThePVEGameModeSelectionPopup from '@/Vue/components/popup/escapeMenu/ThePVEGameModeSelectionPopup.vue'
import ThePrototypesGameModeSelectionPopup from '@/Vue/components/popup/escapeMenu/ThePrototypesGameModeSelectionPopup.vue'
import { defineComponent } from 'vue'
import TheDeckSelectionPopup from '../../../Vue/components/popup/escapeMenu/TheDeckSelectionPopup.vue'
import router from '@/Vue/router'
import EditorDecksButton from '@/Vue/components/editor/buttons/EditorDecksButton.vue'
import TheCoopGameModeSelectionPopup from '@/Vue/components/popup/escapeMenu/TheCoopGameModeSelectionPopup.vue'

export default defineComponent({
	components: {
		EditorDecksButton,
	},

	setup() {
		const onCreateSinglePlayer = async (): Promise<void> => {
			store.dispatch.popupModule.open({
				component: ThePVEGameModeSelectionPopup,
			})
		}

		const onCreateMultiPlayer = async (): Promise<void> => {
			store.dispatch.popupModule.open({
				component: TheDeckSelectionPopup,
				onConfirm: async () => {
					const response = await axios.post('/api/games', { ruleset: store.state.rulesets.pvpRulesets[0].class })
					const gameMessage: GameMessage = response.data.data
					await store.dispatch.joinGame(gameMessage)
				},
			})
		}

		const onCreateCooperative = async (): Promise<void> => {
			store.dispatch.popupModule.open({
				component: TheCoopGameModeSelectionPopup,
			})
		}

		const onCreatePrototypes = async (): Promise<void> => {
			store.dispatch.popupModule.open({
				component: ThePrototypesGameModeSelectionPopup,
			})
		}

		const onCreateLabyrinth = async (): Promise<void> => {
			const response = await axios.post('/api/games', { ruleset: 'rulesetLabyrinthMetaCamp' })
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage)
		}

		const onCreateDevRuleset = async (): Promise<void> => {
			const response = await axios.post('/api/games', { ruleset: 'rulesetDev' })
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage)
		}

		const onManageDecks = async (): Promise<void> => {
			await router.push({
				name: 'decks',
			})
		}

		const devRulesetVisible = process.env.NODE_ENV === 'development'

		return {
			onCreateSinglePlayer,
			onCreateMultiPlayer,
			onCreateCooperative,
			onCreatePrototypes,
			onCreateLabyrinth,
			onCreateDevRuleset,
			onManageDecks,
			devRulesetVisible,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-home-action-container {
	.the-home-action {
		height: 100%;
		padding: 32px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-direction: column;

		button {
			font-size: 1.2em;
		}

		.list {
			width: 100%;
			height: 100%;
			margin-bottom: 1em;
			overflow-y: auto;

			.list-item {
				padding: 4px 16px;
			}
		}

		.controls {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;

			.button-container {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;

				button {
					width: 100%;
					margin: 4px;
					padding: 8px 16px;
					white-space: nowrap;
				}
			}
		}
	}
	.action-explanation {
		margin-bottom: 16px;
		text-align: left;
		width: 100%;
		color: gray;
		font-style: italic;

		&:last-of-type {
			margin-bottom: 0;
		}
	}
	.separator {
		width: 100%;
		height: 1px;
		background: gray;
		margin: 16px 0;
	}
}
</style>
