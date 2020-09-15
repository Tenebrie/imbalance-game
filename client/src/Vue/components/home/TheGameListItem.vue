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
import {defineComponent, PropType} from '@vue/composition-api'

interface Props {
	game: GameMessage
}

export default defineComponent({
	props: {
		game: Object as PropType<GameMessage>
	},

	setup(props: Props) {
		const onClick = () => {
			store.dispatch.joinGame(props.game)
		}
		return {
			thisGame: props.game,
			onClick,
		}
	}
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
