<template>
	<div class="pixi-novel-overlay" v-if="isDisplayed" @click="showNextCue">
		<div class="bottom-smokescreen" />
		<div class="character-art" :class="characterArtClass" />
		<div class="controls">
			<div class="character-name">
				<span v-if="activeCharacter">{{ $locale.get(`story.character.${activeCharacter}`) }}</span>
				<span v-if="!activeCharacter">???</span>
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
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import store from '@/Vue/store'
import StoryCharacter from '@shared/enums/StoryCharacter'
import NovelReplyMessage from '@shared/models/novel/NovelReplyMessage'
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'

export default defineComponent({
	setup() {
		onMounted(() => window.addEventListener('keydown', onKeyDown))
		onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

		const displayedCueText = computed(() => {
			return store.getters.novel.currentCueText
		})

		const currentCue = computed(() => {
			return store.getters.novel.currentCue
		})

		const currentReplies = computed(() => {
			return store.getters.novel.currentReplies
		})

		const isDisplayed = computed<boolean>(() => {
			return currentCue.value !== null
		})

		const activeCharacter = computed<StoryCharacter | null>(() => store.state.novel.activeCharacter)

		const characterArtClass = computed<Record<string, boolean>>(() => {
			let value: Record<string, boolean> = {}
			if (!activeCharacter.value) {
				return value
			}
			value[activeCharacter.value] = true
			return value
		})

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.defaultPrevented) {
				return
			}
			// showNextCue()
		}

		const showNextCue = (): void => {
			store.dispatch.novel.continue()
		}

		const onReply = (reply: NovelReplyMessage): void => {
			OutgoingMessageHandlers.sendNovelReply(reply)
		}

		return {
			currentCue,
			displayedCueText,
			currentReplies,
			isDisplayed,
			showNextCue,
			onReply,
			activeCharacter,
			characterArtClass,
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

		&.narrator {
			background-image: url('../../assets/novel/nessadventure-dragon.webp');
			background-size: contain;
			background-repeat: no-repeat;
			left: 0;
			bottom: 0;
			width: 1200px;
			height: 1200px;
			-webkit-transform: translate3d(0, 0, 0);
		}

		&.notNessa {
			background: gray;
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
