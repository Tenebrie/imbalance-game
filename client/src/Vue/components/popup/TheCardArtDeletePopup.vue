<template>
	<div class="the-card-art-delete-popup">
		<div class="the-card-art-delete-container" @click="onMenuClick">
			<h1>Delete artwork</h1>
			<p>
				The art associated with <b>{{ cardName }}</b> will be deleted from the source code. The automatically generated art will be used
				instead. If the generated art is used already, no action will be taken.
			</p>
			<p>All data is destroyed permanently, and this action can't be undone.</p>
			<p><b>Note:</b> As the file is cached in the frontend server, you may still see the old art on the card until the server restart.</p>
			<div class="preview-container">
				<div class="preview-sizer"><pixi-pre-rendered-card :card="card" /></div>
			</div>
			<div class="menu-separator"></div>
			<div class="button-container">
				<button @click="onConfirm" class="primary game-button destructive"><i class="fas fa-trash" /> Delete</button>
				<button @click="onBack" class="secondary game-button">Cancel</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Localization from '@/Pixi/Localization'
import { parseRichText } from '@/utils/RichTextParser'
import store from '@/Vue/store'
import CardMessage from '@shared/models/network/card/CardMessage'
import { computed, defineComponent } from 'vue'
import PixiPreRenderedCard from '../pixi/PixiPreRenderedCard.vue'

export default defineComponent({
	components: { PixiPreRenderedCard },
	setup() {
		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		const onConfirm = (): void => {
			store.getters.popupModule.onConfirm()
			store.dispatch.popupModule.close()
		}

		const onBack = (): void => {
			store.dispatch.popupModule.close()
		}

		const cardClass = computed<string>(() => store.getters.popupModule.params!.cardClass)
		const card = computed<CardMessage | null>(() => store.state.editor.cardLibrary.find((card) => card.class === cardClass.value) || null)
		const cardName = computed<string>(() => {
			if (!card.value) {
				return ''
			}
			const parsedName = parseRichText(Localization.getCardName(card.value), card.value.variables).humanReadableText
			const parsedTitle = parseRichText(Localization.getCardTitle(card.value) || '', card.value.variables).humanReadableText
			if (parsedTitle.length === 0) {
				return parsedName
			}
			return `${parsedName}, ${parsedTitle}`
		})

		return {
			card,
			cardName,
			onMenuClick,
			onConfirm,
			onBack,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-card-art-delete-popup {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.the-card-art-delete-container {
	border-radius: 16px;
	display: flex;
	width: 600px;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	background: rgba(black, 0.5);
	border: 1px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
	padding: 16px 32px;

	button {
		width: 100%;
		margin: 8px;
	}
}

.preview-container {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;

	.preview-sizer {
		position: relative;
		width: calc(408px / 2);
		height: calc(584px / 2);
	}
}

p {
	margin-bottom: 0.25em;
	line-height: 1.6em;
	text-align: start;
}

h1 {
	margin-bottom: 0;
}

.button-container {
	width: 100%;
	display: flex;
}

a {
	color: lightblue;
}
a:active {
	color: darken(lightblue, 50);
}

.menu-separator {
	width: 100%;
	height: 1px;
	margin: 8px 0;
	background: $COLOR_BACKGROUND_GAME_MENU_BORDER;
}
</style>
