<template>
	<div class="workshop-view">
		<div class="container">
			<div class="preview">
				<WorkshopCardPreview v-if="isPreviewReady" :card="cardPreview" :custom-art="customArtImage" :render-overlay="true" />
			</div>
			<div class="settings">
				<div class="data-fields">
					<div class="data-field-horizontal">
						<div class="data-field-container">
							<div class="card-class">
								<label for="card-class">Class</label>
								<input id="card-class" type="text" v-model="cardClass" />
								<button class="primary game-button" @click="randomizeClass">Randomize artwork</button>
							</div>
						</div>
						<div class="data-field-container">
							<div class="card-custom-art-file">
								<span>Custom art</span>
								<input type="text" disabled class="custom-art-file-name" ref="artFileNameInputRef" />
								<div class="label-sizer">
									<label for="myfile" class="button primary"><i class="fas fa-upload" /> Select a file</label>
									<input
										@change="onFileSelected"
										ref="fileSelectorRef"
										type="file"
										id="myfile"
										name="myfile"
										accept="image/png, image/jpeg, image/webp"
									/>
								</div>
							</div>
						</div>
					</div>
					<div class="data-field-container">
						<div class="card-numbers">
							<div class="lists">
								<div class="select-list">
									<label>Type</label>
									<div v-for="type in availableTypes" :key="type">
										<div class="type-list-content">
											<input :id="`type-list-item-${type}`" type="radio" name="type" :value="type" v-model="cardType" />
											<label :for="`type-list-item-${type}`">{{ $locale.get(`card.type.${type}`) }}</label>
										</div>
									</div>
								</div>
								<div class="select-list">
									<label>Rarity</label>
									<div v-for="color in availableColors" :key="color">
										<div class="color-list-content">
											<input :id="`color-list-item-${color}`" type="radio" name="color" :value="color" v-model="cardColor" />
											<label :for="`color-list-item-${color}`">{{ $locale.get(`card.color.${color}`) }}</label>
										</div>
									</div>
								</div>
							</div>

							<div v-if="displayUnitStats">
								<label for="card-power">Power</label>
								<input id="card-power" type="text" v-model="cardPower" @input="validatePower" />
								<label for="card-armor">Armor</label>
								<input id="card-armor" type="text" v-model="cardArmor" @input="validateArmor" />
							</div>
							<div v-if="displaySpellStats">
								<label for="card-spell-cost">Cost</label>
								<input id="card-spell-cost" type="text" v-model="cardSpellCost" @input="validateSpellCost" />
							</div>
						</div>
						<div class="card-texts">
							<label for="card-name">Name</label>
							<input id="card-name" type="text" v-model="cardName" />
							<label for="card-title">Title</label>
							<input id="card-title" type="text" v-model="cardTitle" />
							<label for="card-tribes">Tribes</label>
							<input id="card-tribes" type="text" v-model="cardTribes" />
							<label for="card-description">Description</label>
							<textarea id="card-description" v-model="cardDescription" />
						</div>
					</div>
				</div>
				<div class="export-container">
					<WorkshopDownloadButton :name="downloadedCardName" :card="cardPreview" />
					<div class="action-explanation">Alternatively, Ctrl+Click on the card, and press Save or Copy.</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import LeaderStatType from '@shared/enums/LeaderStatType'
import CardMessage from '@shared/models/network/card/CardMessage'
import { getRandomName, initializeEnumRecord } from '@shared/Utils'
import * as PIXI from 'pixi.js'
import { debounce } from 'throttle-debounce'
import { computed, defineComponent, onMounted, onUnmounted, Ref, ref, watch } from 'vue'

import Localization from '@/Pixi/Localization'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { WorkshopCardProps } from '@/utils/editor/EditorCardRenderer'
import { insertRichTextVariables, snakeToCamelCase } from '@/utils/Utils'
import WorkshopCardPreview from '@/Vue/components/workshop/WorkshopCardPreview.vue'
import WorkshopDownloadButton from '@/Vue/components/workshop/WorkshopDownloadButton.vue'
import { useWorkshopRouteQuery } from '@/Vue/components/workshop/WorkshopRouteParams'
import store from '@/Vue/store'

export default defineComponent({
	components: { WorkshopDownloadButton, WorkshopCardPreview },
	setup() {
		const cardClass = ref<string>('')
		const customArtImage = ref<HTMLImageElement | null>(null)

		onMounted(() => {
			window.addEventListener('paste', onPagePaste)
		})
		onUnmounted(() => {
			window.removeEventListener('paste', onPagePaste)
		})

		const onPagePaste = (event: Event) => {
			const typedEvent = event as ClipboardEvent
			const items = typedEvent.clipboardData?.items || []

			for (let i = 0; i < items.length; i++) {
				if (items[i].type.indexOf('image') == -1) continue
				const blob = (items[i] as DataTransferItem).getAsFile()
				if (blob) {
					loadFromFile(blob)
					return
				}
			}
		}

		const artFileNameInputRef = ref<HTMLInputElement | null>(null)
		const onFileSelected = (event: any) => {
			const files = event.target.files
			loadFromFile(files[0])
		}

		const loadFromFile = (file: File): void => {
			const fileReader = new FileReader()
			fileReader.onload = async () => {
				const image = new Image()
				image.src = fileReader.result as string
				customArtImage.value = image
			}
			if (artFileNameInputRef.value) {
				artFileNameInputRef.value!.value = file.name
			}
			fileReader.readAsDataURL(file)
		}

		const loadImage = (source: string | HTMLImageElement): void => {
			const texture = PIXI.Texture.from(source)

			texture.baseTexture.on('loaded', () => {
				imageLoaded.value = true
				currentImage.value = texture
			})
			if (texture.baseTexture.width > 0) {
				imageLoaded.value = true
				currentImage.value = texture
			}
		}

		const loadCardOrRandomImage = () => {
			const card = store.state.editor.cardLibrary.find((card) => card.class.toLowerCase() === cardClass.value.toLowerCase())
			if (card) {
				loadImage(`/assets/cards/${encodeURIComponent(card.class)}.webp`)
			} else {
				loadImage(`/api/workshop/artwork?seed=${encodeURIComponent(cardClass.value)}`)
			}
			customArtImage.value = null
			if (fileSelectorRef.value) {
				fileSelectorRef.value!.value = ''
			}
			if (artFileNameInputRef.value) {
				artFileNameInputRef.value!.value = ''
			}
		}
		const loadRandomImageDebounced = debounce(500, loadCardOrRandomImage)
		const imageLoaded = ref<boolean>(false)
		const currentImage = ref<PIXI.Texture>()
		onMounted(() => {
			loadRandomImageDebounced()
		})
		watch(
			() => [cardClass.value],
			() => {
				loadRandomImageDebounced()
			}
		)

		const fileSelectorRef = ref<HTMLInputElement | null>(null)
		const randomizeClass = () => {
			const name = getRandomName()
			cardClass.value = `hero${name.substr(0, 1).toUpperCase()}${name.substr(1)}`
		}
		loadCardOrRandomImage()

		const cardType = ref<CardType>(CardType.UNIT)
		const cardColor = ref<CardColor>(CardColor.GOLDEN)

		const cardPower = ref<string>('')
		const validatePower = (event: InputEvent): void => {
			const target = event.currentTarget as HTMLInputElement
			cardPower.value = target.value.replace(/[^0-9]/g, '').substr(0, 4)
		}

		const cardArmor = ref<string>('')
		const validateArmor = (event: InputEvent): void => {
			const target = event.currentTarget as HTMLInputElement
			cardArmor.value = target.value.replace(/[^0-9]/g, '').substr(0, 2)
		}

		const cardSpellCost = ref<string>('')
		const validateSpellCost = (event: InputEvent): void => {
			const target = event.currentTarget as HTMLInputElement
			cardSpellCost.value = target.value.replace(/[^0-9]/g, '').substr(0, 4)
		}

		const cardName = ref<string>('')
		const cardTitle = ref<string>('')
		const cardTribes = ref<string>('')
		const cardDescription = ref<string>('')

		const routeQuery = useWorkshopRouteQuery()
		const loadFromCard = routeQuery.value.from
		if (loadFromCard) {
			const card = store.state.editor.cardLibrary.find((card) => card.class.toLowerCase() === loadFromCard.toLowerCase())
			if (card) {
				cardClass.value = card.class
				cardType.value = card.type
				cardColor.value = card.color
				cardPower.value = card.stats.basePower.toString() || '0'
				cardArmor.value = card.stats.baseArmor.toString() || '0'
				cardSpellCost.value = card.stats.baseSpellCost.toString() || '0'
				cardName.value = Localization.getCardName(card) || ''
				cardTitle.value = Localization.getCardTitle(card) || ''
				cardTribes.value = Localization.getCardTribes(card).join('; ')
				cardDescription.value = insertRichTextVariables(Localization.getCardDescription(card) || '', card.variables)
			}
		}

		if (cardClass.value === '') {
			cardClass.value = 'heroAura'
		}

		const cardPreview = computed<CardMessage & WorkshopCardProps>(() => ({
			id: '',
			type: cardType.value,
			class: cardClass.value,
			color: cardColor.value,
			faction: CardFaction.HUMAN,
			artworkClass: cardClass.value,

			stats: {
				cardId: '',
				power: convertNumericValue(cardPower),
				maxPower: convertNumericValue(cardPower),
				basePower: convertNumericValue(cardPower),

				armor: convertNumericValue(cardArmor),
				maxArmor: convertNumericValue(cardArmor),
				baseArmor: convertNumericValue(cardArmor),

				unitCost: 0,
				baseUnitCost: 0,

				spellCost: convertNumericValue(cardSpellCost),
				baseSpellCost: convertNumericValue(cardSpellCost),

				leaderStats: initializeEnumRecord(LeaderStatType, () => 0),
			},
			buffs: {
				cardId: '',
				buffs: [],
			},
			localization: {
				en: {
					name: unescapeValue(cardName),
					title: '',
					flavor: '',
					listName: '',
					description: unescapeValue(cardDescription),
				},
				ru: {
					name: unescapeValue(cardName),
					title: '',
					flavor: '',
					listName: '',
					description: unescapeValue(cardDescription),
				},
			},
			baseTribes: [],
			baseFeatures: [],
			relatedCards: [],
			variables: {},
			sortPriority: 0,
			expansionSet: ExpansionSet.BASE,

			isCommunity: false,
			isCollectible: false,
			isExperimental: false,

			isHidden: false,

			workshopTitle: cardTitle.value,
			workshopImage: currentImage.value!,
			workshopTribes: cardTribes.value.length > 0 ? cardTribes.value.split(';') : [],
		}))
		const unescapeValue = (ref: Ref<string>): string => {
			return ref.value.replace(/\\n/g, '\n')
		}
		const convertNumericValue = (ref: Ref<string>): number => {
			return ref.value.length > 0 && /^\d+$/.test(ref.value) ? Number(ref.value) : 0
		}

		const displayUnitStats = computed<boolean>(() => cardType.value === CardType.UNIT)
		const displaySpellStats = computed<boolean>(() => cardType.value === CardType.SPELL)

		const downloadedCardName = computed<string>(() => {
			if (cardName.value.length > 0 && cardTitle.value.length > 0) {
				return [
					snakeToCamelCase(cardName.value.trim().replace(/\s/g, '_')),
					snakeToCamelCase(cardTitle.value.trim().replace(/\s/g, '_')),
				].join('-')
			} else if (cardName.value.length > 0) {
				return snakeToCamelCase(cardName.value.trim().replace(/\s/g, '_'))
			} else if (cardClass.value.length > 0) {
				return cardClass.value
			}
			return 'unnamed'
		})

		const areComponentsPreloaded = ref<boolean>(false)
		TextureAtlas.preloadComponents().then(() => {
			areComponentsPreloaded.value = true
		})

		const isPreviewReady = computed<boolean>(() => imageLoaded.value && areComponentsPreloaded.value)

		return {
			isPreviewReady,
			fileSelectorRef,
			artFileNameInputRef,
			customArtImage,
			cardClass,
			onFileSelected,
			randomizeClass,
			cardType,
			cardColor,
			cardPower,
			validatePower,
			cardArmor,
			validateArmor,
			cardSpellCost,
			validateSpellCost,
			cardTribes,
			cardName,
			cardTitle,
			cardDescription,
			cardPreview,
			currentImage,
			displayUnitStats,
			displaySpellStats,
			downloadedCardName,
			availableTypes: Object.values(CardType).filter((value) => typeof value === 'number'),
			availableColors: Object.values(CardColor).filter((value) => typeof value === 'number'),
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.workshop-view {
	display: flex;
	align-items: center;
	justify-content: center;

	.container {
		width: 100%;
		max-width: 1366px;
		height: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;

		& > div {
			display: flex;
			flex-direction: column;
			background: $COLOR-BACKGROUND-TRANSPARENT;

			&.preview {
				position: relative;
				flex: 2;
				height: 100%;
				margin: 0 16px 0 32px;

				background: #fff
					url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAIElEQVQoU2NkQAOPHz/+jyzESAcF6HbKysqiWMtIewUAInQeqXtX4FYAAAAASUVORK5CYII=)
					repeat fixed 50%;
			}
			&.settings {
				flex: 3;
				margin: 0 16px 0 16px;
				height: calc(100% - 32px) !important;
				padding: 16px;

				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: space-between;
			}
		}
	}
}

label {
	text-align: start;
}

.data-field-container {
	display: flex;
	flex-direction: row;
	text-align: start;
	margin-bottom: 32px;

	& > div {
		margin-right: 16px;
	}

	.card-numbers {
		flex: 1;
		max-width: 250px;
		input[type='text'] {
			margin-bottom: 12px;
		}
	}
	.card-texts {
		flex: 2;
		max-width: 700px;
		input[type='text'] {
			margin-bottom: 12px;
		}
	}
}

.data-field-horizontal {
	display: flex;
	flex-direction: row;

	.data-field-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.card-custom-art-file {
	width: 100%;

	.label-sizer {
		display: flex;
		flex-direction: column;
	}
}

.export-container {
	width: 100%;
}

.lists {
	display: flex;
	flex-direction: row;
	justify-content: center;

	.select-list {
		label {
			margin-bottom: 8px;
		}
		flex: 1;

		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;

		input {
			margin-left: 0;
			margin-bottom: 1em;
		}

		.language-list-content {
			width: 100%;
			display: flex;
			justify-content: left;
		}
	}
}

input[type='radio'] {
	margin-right: 6px;
}

input[type='file'] {
	display: none;
}

textarea {
	resize: vertical;
	min-height: 62px;
	max-height: calc(62px * 4);
}
</style>
