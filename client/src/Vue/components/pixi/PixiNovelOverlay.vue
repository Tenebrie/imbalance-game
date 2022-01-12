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
			<div class="character-name">
				<span v-if="lastActiveCharacter">{{ $locale.get(`story.character.${lastActiveCharacter}`) }}</span>
				<span v-if="!lastActiveCharacter">???</span>
			</div>
			<div class="cue-container">
				<div class="cue"><span v-html="displayedCueText" /></div>
			</div>
			<div class="reply-container">
				<button class="reply-button" v-for="reply in currentReplies" :key="reply.id" @click="() => onReply(reply)">{{ reply.text }}</button>
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

		const displayedCueText = computed(() => store.getters.novel.currentCueText)
		const currentCue = computed(() => store.getters.novel.currentCue)
		const currentReplies = computed(() => store.getters.novel.currentReplies)

		const isDisplayed = computed(() => currentCue.value !== null)
		const activeCharacter = computed<StoryCharacter | null>(() => store.state.novel.activeCharacter)
		const lastActiveCharacter = ref<StoryCharacter | null>(null)

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
			visible: !!currentCue.value,
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
			if (!event.defaultPrevented && event.key === 'Space') {
				showNextCue()
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
			displayedCueText,
			currentReplies,
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

	.controls {
		z-index: 1;
		width: 100%;
		height: 40%;

		.character-name {
			z-index: 2;
			display: flex;
			align-items: flex-start;
			justify-content: flex-start;
			padding: 8px 450px;
			font-size: 32px;
			text-shadow: 1px 1px 8px black;
		}

		.cue-container {
			z-index: 2;
			display: block;
			width: 100%;
			height: 150px;
			background: rgba(#333, 0.7);
			border-top: solid 1px white;
			border-bottom: solid 1px white;

			.cue {
				width: calc(100% - 900px);
				height: 100%;
				text-align: left;
				padding: 32px 450px;
				font-size: 24px;
			}
		}

		.reply-container {
			width: 100%;
			display: flex;
			align-items: flex-start;
			justify-content: flex-start;
			flex-direction: column;
			padding: 32px 0;

			.reply-button {
				width: 100%;
				color: white;
				font-size: 20px;
				text-align: left;
				padding: 8px 450px;
				margin: 4px 0;
				border: none;
				background: rgba(#333, 0.7);
				border-top: solid 1px gray;
				border-bottom: solid 1px gray;

				&:hover {
					border-top: solid 1px white;
					border-bottom: solid 1px white;
				}
			}
		}
	}
}
</style>
