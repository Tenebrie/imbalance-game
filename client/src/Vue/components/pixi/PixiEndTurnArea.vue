<template>
	<div class="end-turn-area" :class="buttonClass">
		<button @click="onEndTurn" class="primary game-button" :class="buttonClass">
			<span class="end-turn-span">End turn</span>
			<span class="end-round-span">End round</span>
		</button>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'

import ClientGameStatus from '@/Pixi/enums/ClientGameStatus'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import store from '@/Vue/store'

export default defineComponent({
	setup() {
		const willEndRound = computed<boolean>(() => {
			return true
		})
		const isButtonDisabled = computed<boolean>(() => {
			return !store.state.gameStateModule.isPlayersTurn || store.state.gameStateModule.gameStatus !== ClientGameStatus.IN_PROGRESS
		})

		const onEndTurn = (): void => {
			if (isButtonDisabled.value) {
				return
			}
			OutgoingMessageHandlers.sendEndTurn()
		}

		const isButtonGlowing = ref<boolean>(false)
		const buttonGlowTimer = ref<number | null>(null)

		const updateGlowTimer = () => {
			if (willEndRound.value) {
				clearInterval(buttonGlowTimer.value!)
				return
			}
			buttonGlowTimer.value = setInterval(() => {
				isButtonGlowing.value = !isButtonGlowing.value
			}, 1500)
		}

		onMounted(() => {
			updateGlowTimer()
		})
		watch(
			() => [willEndRound.value],
			() => {
				updateGlowTimer()
			}
		)

		const buttonClass = computed(() => ({
			hidden: isButtonDisabled.value,
			'turn-end': !willEndRound.value,
			'round-end': willEndRound.value,
			glowing: isButtonGlowing.value,
		}))

		return {
			onEndTurn,
			buttonClass,
			isButtonDisabled,
			willEndRound,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.end-turn-area {
	width: 100%;
	position: relative;
	transition: margin-right 0.5s;

	&.hidden {
		margin-right: -500px !important;
	}

	& > button {
		width: 100%;
		height: 2.25em;
		font-size: 20px;
		pointer-events: all;
		margin: 24px 0;
		transition: box-shadow 1.5s;
		display: flex;
		justify-content: center;
		align-items: center;

		& > span {
			position: absolute;
			display: block;
			opacity: 0;
			transition: opacity 0.25s;
		}

		&.turn-end > span.end-turn-span {
			opacity: 1;
		}

		.end-round-span {
			color: lighten(red, 10);
		}
		&.round-end > span.end-round-span {
			opacity: 1;
		}
		&.round-end {
			transition: 0.75s;
		}
		&.round-end:hover {
			transition: 0s;
			box-shadow: #{lighten(red, 10)} 0 0 8px 4px;
		}

		&.turn-end.glowing {
			box-shadow: palegreen 0 0 16px 8px;
			transition: margin-right 0.5s, box-shadow 1.5s ease 0.5s;
		}
	}
}
</style>
