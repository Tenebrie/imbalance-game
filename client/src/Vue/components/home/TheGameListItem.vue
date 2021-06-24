<template>
	<div class="the-game-list-item" @click="onClick">
		<span v-if="thisGame.isStarted">
			<i>
				Spectate:
				<b>{{ thisGame.players[0].player.username }}</b>
				vs
				<b>{{ thisGame.players[1].player.username }}</b>
			</i>
		</span>
		<span v-if="!thisGame.isStarted">
			<i>
				Challenge:
				<b>{{ thisGame.players[0].player.username }}</b>
			</i>
		</span>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import GameMessage from '@shared/models/network/GameMessage'
import { defineComponent, PropType } from 'vue'
import TheDeckSelectionPopup from '@/Vue/components/popup/escapeMenu/TheDeckSelectionPopup.vue'

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
		return {
			thisGame: props.game,
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
