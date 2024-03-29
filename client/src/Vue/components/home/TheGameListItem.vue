<template>
	<div class="the-game-list-item" @click="onClick">
		<span v-if="!hasOpenSlots">
			<i>
				Spectate:
				<b>{{ thisGame.players[0].username }}</b>
				vs
				<b>{{ thisGame.players[1].username }}</b>
				(<span v-html="rulesetName" />)
			</i>
		</span>
		<span v-if="hasOpenSlots && thisGame.players[0].openHumanSlots === 0 && thisGame.players[1].players.length === 0">
			<i>
				Challenge:
				<b>{{ thisGame.players[0].username }}</b>
				(<span v-html="rulesetName" />)
			</i>
		</span>
		<span v-if="hasOpenSlots && thisGame.players[1].openHumanSlots === 0 && thisGame.players[0].players.length === 0">
			<i>
				Challenge:
				<b>{{ thisGame.players[1].username }}</b>
				(<span v-html="rulesetName" />)
			</i>
		</span>
		<span
			v-if="
				hasOpenSlots &&
				thisGame.players[0].openHumanSlots > 0 &&
				thisGame.players[0].players.length > 0 &&
				thisGame.players[1].players.length === 1
			"
		>
			<i>
				Join cooperative game:
				<b>{{ thisGame.players[0].username }}</b>
				vs
				<b>{{ thisGame.players[1].username }}</b>
				(<span v-html="rulesetName" />)
			</i>
		</span>
	</div>
</template>

<script lang="ts">
import GameMessage from '@shared/models/network/GameMessage'
import { computed, defineComponent, PropType } from 'vue'

import Localization from '@/Pixi/Localization'
import TheDeckSelectionPopup from '@/Vue/components/popup/escapeMenu/TheDeckSelectionPopup.vue'
import store from '@/Vue/store'

export default defineComponent({
	props: {
		game: {
			type: Object as PropType<GameMessage>,
			required: true,
		},
	},

	setup(props) {
		const onClick = async () => {
			const ruleset = props.game.ruleset
			if (ruleset.playerDeckRequired && !props.game.isStarted) {
				store.dispatch.popupModule.open({
					component: TheDeckSelectionPopup,
					onConfirm: async () => {
						await store.dispatch.joinGame(props.game)
					},
				})
			} else {
				await store.dispatch.joinGame(props.game)
			}
		}

		const hasOpenSlots = computed<boolean>(() => {
			return props.game.players.some((group) => group.openHumanSlots > 0)
		})

		const rulesetName = Localization.get(`ruleset.${props.game.ruleset.class}.label`, 'null') || props.game.ruleset.class

		return {
			thisGame: props.game,
			rulesetName,
			hasOpenSlots,
			onClick,
		}
	},
})
</script>

<style scoped lang="scss">
.the-game-list-item {
	padding: 2px;
	cursor: pointer;
	user-select: none;

	&:hover {
		background: rgba(#36454f, 0.75);
	}
}
</style>
