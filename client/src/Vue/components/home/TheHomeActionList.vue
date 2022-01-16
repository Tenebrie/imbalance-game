<template>
	<div class="the-home-action-container">
		<div class="the-home-action">
			<div class="controls">
				<div class="button-container">
					<h2>Singleplayer</h2>
					<button @click="onCreateTutorial" class="primary">{{ $locale.get('ui.play.tutorial') }}</button>
					<span class="action-explanation">Learn the basics of the game.</span>
					<button @click="onCreateSinglePlayer" class="primary">{{ $locale.get('ui.play.pve') }}</button>
					<span class="action-explanation">Play against normal AI, or a special challenge scenario.</span>
					<button @click="onCreateCooperative" class="primary">{{ $locale.get('ui.play.coop') }}</button>
					<span class="action-explanation">Invite a friend to play against AI opponent.</span>
					<button @click="onCreatePrototypes" class="primary">{{ $locale.get('ui.play.prototypes') }}</button>
					<span class="action-explanation">See early concepts, modules and gamemode prototypes.</span>
					<button @click="onCreateRitesRun" class="primary">{{ $locale.get('ui.play.rites') }}</button>
					<span class="action-explanation">Delve into the rogue-lite Rites mode.</span>
					<div class="separator" />
					<h2>Multiplayer</h2>
					<button @click="onCreateMultiPlayer" class="primary">{{ $locale.get('ui.play.pvp') }}</button>
					<span class="action-explanation">Create a game and wait for an opponent to challenge you.</span>
					<div class="separator" v-if="devRulesetVisible" />
					<h2 v-if="devRulesetVisible">Development</h2>
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
import GameMessage from '@shared/models/network/GameMessage'
import axios from 'axios'
import { defineComponent } from 'vue'

import EditorDecksButton from '@/Vue/components/editor/buttons/EditorDecksButton.vue'
import TheCoopGameModeSelectionPopup from '@/Vue/components/popup/escapeMenu/TheCoopGameModeSelectionPopup.vue'
import ThePrototypesGameModeSelectionPopup from '@/Vue/components/popup/escapeMenu/ThePrototypesGameModeSelectionPopup.vue'
import ThePVEGameModeSelectionPopup from '@/Vue/components/popup/escapeMenu/ThePVEGameModeSelectionPopup.vue'
import router from '@/Vue/router'
import store from '@/Vue/store'

import TheDeckSelectionPopup from '../../../Vue/components/popup/escapeMenu/TheDeckSelectionPopup.vue'

export default defineComponent({
	components: {
		EditorDecksButton,
	},

	setup() {
		const onCreateTutorial = async (): Promise<void> => {
			const response = await axios.post('/api/games', { ruleset: 'rulesetTutorialBasic' })
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage)
		}

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

		const onCreateRitesRun = async (): Promise<void> => {
			const response = await axios.post('/api/games', { ruleset: 'rulesetRitesMetaCamp' })
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
			onCreateTutorial,
			onCreateSinglePlayer,
			onCreateMultiPlayer,
			onCreateCooperative,
			onCreatePrototypes,
			onCreateRitesRun,
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
	.separator {
		width: 100%;
		height: 1px;
		background: gray;
		margin: 16px 0;
	}
}
</style>
