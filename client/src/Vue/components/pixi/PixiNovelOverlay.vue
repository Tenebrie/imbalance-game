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

		&.notMaya {
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

		&.top {
			background-image: url('https://img01.ztat.net/article/spp-media-p1/16cc8088990f4d56ad8e3a68f219deda/e5d61046df81484c841b790e17b2b7b9.jpg?imwidth=1200');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1340px;
		}

		&.hoodie {
			background-image: url('https://img01.ztat.net/article/spp-media-p1/4cfd4e3189b03b9fa0e986d65bf171e4/b47ee26297fe4dd0a8e06845df258305.jpg?imwidth=1800&filter=packshot');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1340px;
		}

		&.dress {
			background-image: url('https://img01.ztat.net/article/spp-media-p1/b85aabbf980c47c995adb2b1499d68c4/cef5e2ee2bfb4aaa821cfc5c6ea74238.jpg?imwidth=1800&filter=packshot');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1340px;
		}

		&.skirt {
			background-image: url('https://img01.ztat.net/article/spp-media-p1/397821120ade4f6fbcf6a686d9d029d4/44e4cced77614277b9df658ccb5034ac.jpg?imwidth=1800&filter=packshot');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1440px;
		}

		&.maidDress {
			background-image: url('https://m.media-amazon.com/images/I/61JOHKtbDBL._AC_UY1000_.jpg');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1320px;
		}

		&.tShirt {
			background-image: url('https://img01.ztat.net/article/spp-media-p1/881f1a487cce40fba333d254df8b3250/c280fda9000448c6b34bff4bcf33a0b6.jpg?imwidth=1800&filter=packshot');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1340px;
		}

		&.weddingDress {
			background-image: url('https://i.pinimg.com/originals/dc/d1/b9/dcd1b9c7b567e864c07999f804fe3864.jpg');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1340px;
		}

		&.coat {
			background-image: url('https://img01.ztat.net/article/spp-media-p1/368d46d5e5c04e89a24b51f2eeb4896c/6babdc7089304ec8adf374532b925fa4.jpg?imwidth=1800&filter=packshot');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1340px;
		}

		&.dryad {
			background-image: url('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ddf28a16-916e-490f-8b5d-9f72cbf069b2/da7polc-8436584b-83bb-48e8-91c0-937465a886ae.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2RkZjI4YTE2LTkxNmUtNDkwZi04YjVkLTlmNzJjYmYwNjliMlwvZGE3cG9sYy04NDM2NTg0Yi04M2JiLTQ4ZTgtOTFjMC05Mzc0NjVhODg2YWUuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.DV503FuD-kezJ2Uc7MayW9bSAf158a65wOqPIw5qngQ');
			background-size: contain;
			background-repeat: no-repeat;
			left: 780px;
			bottom: 0;
			width: 1000px;
			height: 1340px;
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
