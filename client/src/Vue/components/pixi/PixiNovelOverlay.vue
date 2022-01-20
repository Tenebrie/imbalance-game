<template>
	<div class="pixi-novel-overlay" :class="overlayClass" @click="showNextCue">
		<div class="bottom-smokescreen" />
		<div
			class="character-art"
			v-for="key in Object.keys(characterStatus)"
			:class="{ [key]: true, invisible: !characterStatus[key] }"
			:key="key"
		/>
		<div class="controls">
			<div class="character-name-container">
				<div class="character-name" :key="lastActiveCharacter">
					<span v-if="lastActiveCharacter">{{ $locale.get(`story.character.${lastActiveCharacter}`) }}</span>
					<span v-if="!lastActiveCharacter">???</span>
				</div>
			</div>
			<div class="cue-container">
				<div class="cue" :key="currentCue?.id"><span v-html="displayedCueText" /></div>
				<div class="decaying-cue-container">
					<div class="cue decaying-cue" v-for="decayingCue in decayingCues" :key="decayingCue.id">
						<span v-html="decayingCue.text" />
					</div>
				</div>
			</div>
			<div class="reply-container">
				<button class="reply-button non-decaying" v-for="reply in currentResponses" :key="reply.id" @click="() => onReply(reply)">
					<span class="reply-text-container">
						{{ reply.text }}
					</span>
				</button>
				<div class="decaying-responses-container">
					<button
						class="reply-button decaying-response"
						:class="{ 'decaying-selected': reply.isSelected }"
						v-for="reply in decayingResponses"
						:key="reply.id"
					>
						<span class="reply-text-container">
							{{ reply.text }}
						</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import StoryCharacter from '@shared/enums/StoryCharacter'
import NovelResponseMessage from '@shared/models/novel/NovelResponseMessage'
import { initializeEnumRecord } from '@shared/Utils'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'

import store from '@/Vue/store'

export default defineComponent({
	setup() {
		onMounted(() => window.addEventListener('keydown', onKeyDown))
		onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
		onMounted(() => window.addEventListener('keyup', onKeyUp))
		onUnmounted(() => window.removeEventListener('keyup', onKeyUp))

		const displayedCueText = computed(() => store.getters.novel.currentCueText)
		const currentCue = computed(() => store.getters.novel.currentCue)
		const currentResponses = computed(() => store.getters.novel.currentResponses)
		const decayingCues = computed(() => store.state.novel.decayingCues)
		const decayingResponses = computed(() => store.state.novel.decayingResponses)

		const isDisplayed = computed(() => store.state.novel.isActive)
		const isMuted = computed(() => store.state.novel.isMuted)
		const activeCharacter = computed<StoryCharacter | null>(() => store.state.novel.activeCharacter)
		const lastActiveCharacter = ref<StoryCharacter | null>(null)

		const spacebarDown = ref<boolean>(false)

		watch(
			() => [activeCharacter.value],
			() => {
				if (activeCharacter.value !== null) {
					lastActiveCharacter.value = activeCharacter.value
				}
			}
		)

		const characterStatus = computed(() => {
			return initializeEnumRecord(StoryCharacter, (val) => !!activeCharacter.value && val === activeCharacter.value)
		})

		const overlayClass = computed<Record<string, boolean>>(() => ({
			visible: isDisplayed.value,
			muted: isMuted.value,
			skipping: spacebarDown.value,
		}))

		const characterArtClass = computed<Record<string, boolean>>(() => {
			let value: Record<string, boolean> = {
				invisible: !activeCharacter.value,
			}
			if (!activeCharacter.value) {
				return value
			}
			value[activeCharacter.value] = true
			return value
		})

		const onKeyDown = (event: KeyboardEvent): void => {
			if (!event.defaultPrevented && event.key === ' ') {
				showNextCue()
				spacebarDown.value = true
				// setTimeout(() => (spacebarDown.value = false), 50)
			}
		}

		const onKeyUp = (event: KeyboardEvent): void => {
			if (!event.defaultPrevented && event.key === ' ') {
				spacebarDown.value = false
			}
		}

		const showNextCue = (): void => {
			store.dispatch.novel.continue()
		}

		const onReply = (response: NovelResponseMessage): void => {
			store.dispatch.novel.reply({ response })
		}

		return {
			currentCue,
			decayingCues,
			displayedCueText,
			currentResponses,
			decayingResponses,
			isDisplayed,
			showNextCue,
			onReply,
			activeCharacter,
			lastActiveCharacter,
			characterArtClass,
			overlayClass,
			characterStatus,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

@keyframes slideIn {
	0% {
		opacity: 0;
		transform: translateX(-100px);
	}
	100% {
		opacity: 1;
		transform: translateX(0);
	}
}

.pixi-novel-overlay {
	z-index: 500;
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	user-select: none;
	background: rgba(black, 0.5);
	display: flex;
	align-items: flex-end;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.5s;

	&.visible {
		pointer-events: all;
		opacity: 1;
	}

	&.visible.muted {
		opacity: 0.5;
	}

	.bottom-smokescreen {
		position: absolute;
		width: 100%;
		bottom: 0;
		background: rgba(black, 0.6);
		box-shadow: 0 0 100px 300px rgba(black, 0.6);
	}

	.character-art {
		z-index: 0;
		display: block;
		position: absolute;
		left: 250px;
		bottom: 0;
		width: 450px;
		height: 800px;
		max-width: 100%;
		max-height: 100%;
		opacity: 1;
		margin-left: 0;
		transition: margin 0.5s, opacity 0.4s;

		&.invisible {
			opacity: 0;
			margin-left: -250px;
		}

		&.narrator {
			background-image: url('../../assets/novel/nessadventure-dragon.webp');
			background-size: contain;
			background-repeat: no-repeat;
			left: 0;
			bottom: 0;
			width: 1200px;
			height: 1200px;
		}

		&.notNessa {
			background-image: url('../../assets/novel/not-nessa.webp');
			background-size: contain;
			background-repeat: no-repeat;
			left: 0;
			bottom: 0;
			width: 1200px;
			height: 1200px;
		}

		&.elsa {
			background-image: url('../../assets/novel/elsa.webp');
			background-size: contain;
			background-repeat: no-repeat;
			left: 0;
			bottom: 0;
			width: 1000px;
			height: 1000px;
		}

		&.bodge {
			background-image: url('../../assets/novel/bodge.webp');
			background-size: contain;
			background-repeat: no-repeat;
			left: 0;
			bottom: 0;
			width: 1200px;
			height: 1200px;
		}

		&.nira {
			background-image: url('../../assets/novel/nira.webp');
			background-size: contain;
			background-repeat: no-repeat;
			left: -300px;
			bottom: -200px;
			width: 1200px;
			height: 1200px;
		}
	}

	&:active .controls .cue-container,
	&.skipping .controls .cue-container {
		border-top: solid 1px $COLOR-SECONDARY;
		border-bottom: solid 1px $COLOR-SECONDARY;
		transition: border 0s;
	}

	.controls {
		z-index: 1;
		width: 100%;
		height: 40%;

		.character-name-container {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;

			.character-name {
				z-index: 2;
				display: flex;
				align-items: flex-start;
				justify-content: flex-start;
				font-size: 64px;
				text-shadow: 1px 1px 8px black;
				padding: 8px 64px;
				width: calc(100% - 128px);
				max-width: 1366px;
				font-family: 'BrushScript', sans-serif;

				animation: slideIn 0.3s ease-out forwards;
			}
		}

		.cue-container {
			z-index: 2;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 164px;
			background: rgba(darken($COLOR-PRIMARY, 20), 0.75);
			transition: border 0.3s;
			border-top: solid 1px #ddd;
			border-bottom: solid 1px #ddd;

			.cue {
				width: calc(100% - 128px);
				max-width: 1366px;
				height: calc(100% - 48px);
				text-align: left;
				padding: 32px 64px;
				font-size: 28px;
				font-family: 'Alegreya Sans', sans-serif;

				animation: slideIn 0.3s ease-out forwards;
			}

			.decaying-cue-container {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;

				.decaying-cue {
					position: absolute;
					animation: slideOut 0.3s ease-out forwards;

					@keyframes slideOut {
						0% {
							opacity: 1;
							transform: translateX(0);
						}
						100% {
							opacity: 0;
							transform: translateX(100px);
						}
					}
				}
			}
		}

		.reply-container {
			z-index: 1;
			width: 100%;
			display: flex;
			position: relative;
			align-items: flex-start;
			justify-content: flex-start;
			flex-direction: column;
			padding: 32px 0;

			.reply-button {
				width: 100%;
				color: white;
				font-size: 20px;
				text-align: left;
				margin: 4px 0;
				display: flex;
				align-items: center;
				justify-content: center;

				border-width: 1px;
				border-style: solid;
				border-left: none;
				border-right: none;
				border-image: linear-gradient(to right, #ddd, rgba(0, 0, 0, 0)) 1;

				background: rgba(#333, 0.7);
				background: linear-gradient(to right, rgba(darken($COLOR-PRIMARY, 20), 0.75) 50%, rgba(0, 0, 0, 0) 100%);

				transition: padding-left 0.3s, border-image 0.3s;

				&.non-decaying {
					animation: slideIn 0.3s ease-out forwards;
				}

				&:hover,
				&.decaying-selected {
					padding-left: 84px;
					transition: padding-left 0.3s, border-image 0s;
					border-image: linear-gradient(to right, $COLOR-SECONDARY, rgba($COLOR-SECONDARY, 0)) 1;
				}

				&:active {
					border-image: linear-gradient(to right, darken($COLOR-SECONDARY, 10), rgba($COLOR-SECONDARY, 0)) 1;
				}

				.reply-text-container {
					width: 100%;
					max-width: 1366px;
					padding: 8px 64px;
					font-size: 22px;
					font-family: 'Alegreya Sans', sans-serif;
				}
			}

			.decaying-responses-container {
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				pointer-events: none;

				.decaying-response {
					animation: opacity 0.3s ease-out forwards;

					@keyframes opacity {
						0% {
							opacity: 1;
						}
						100% {
							opacity: 0;
						}
					}
				}

				.decaying-response > .reply-text-container {
					animation: slideOut 0.3s ease-out forwards;

					@keyframes slideOut {
						0% {
							opacity: 1;
							transform: translateX(0);
						}
						100% {
							opacity: 0;
							transform: translateX(100px);
						}
					}
				}
			}
		}
	}
}
</style>
