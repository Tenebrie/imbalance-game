<template>
	<div class="workshop-view">
		<div class="container">
			<div class="preview">
				<WorkshopCardPreview v-if="currentImage" :card="cardPreview" />
			</div>
			<div class="settings">
				<div class="data-fields">
					<div class="data-field-container">
						<div class="card-class">
							<label for="card-class">Class</label>
							<input id="card-class" type="text" v-model="cardClass" />
							<button class="primary game-button" @click="randomizeClass">Randomize artwork</button>
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
					<WorkshopDownloadButton :name="cardClass" :card="cardPreview" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import * as PIXI from 'pixi.js'
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue'
import WorkshopCardPreview from '@/Vue/components/workshop/WorkshopCardPreview.vue'
import CardMessage from '@shared/models/network/card/CardMessage'
import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { debounce } from 'throttle-debounce'
import { getRandomName } from '@shared/Utils'
import WorkshopDownloadButton from '@/Vue/components/workshop/WorkshopDownloadButton.vue'

export type WorkshopCardProps = {
	workshopTitle: string
	workshopImage: PIXI.Texture
	workshopTribes: string[]
}

export default defineComponent({
	components: { WorkshopDownloadButton, WorkshopCardPreview },
	setup() {
		const cardClass = ref<string>('')
		const loadImage = () => {
			const texture = PIXI.Texture.from(`/api/workshop/artwork?seed=${cardClass.value}`)

			texture.baseTexture.on('loaded', () => {
				imageLoaded.value = true
				currentImage.value = texture
			})
			if (texture.baseTexture.width > 0) {
				imageLoaded.value = true
				currentImage.value = texture
			}
		}
		const loadImageDebounced = debounce(500, loadImage)
		const imageLoaded = ref<boolean>(false)
		const currentImage = ref<PIXI.Texture>()
		onMounted(() => {
			loadImageDebounced()
		})
		watch(
			() => [cardClass.value],
			() => {
				loadImageDebounced()
			}
		)

		const randomizeClass = () => {
			const name = getRandomName()
			cardClass.value = `hero${name.substr(0, 1).toUpperCase()}${name.substr(1)}`
		}
		randomizeClass()
		loadImage()

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

		const cardPreview = computed<CardMessage & WorkshopCardProps>(() => ({
			id: '',
			type: cardType.value,
			class: 'unitHidden',
			color: cardColor.value,
			faction: CardFaction.HUMAN,

			name: unescapeValue(cardName),
			title: '',
			flavor: '',
			listName: '',
			description: unescapeValue(cardDescription),

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

				soloUnitDamage: 0,
				massUnitDamage: 0,
				soloSpellDamage: 0,
				massSpellDamage: 0,
				soloHealingPotency: 0,
				massHealingPotency: 0,
				soloBuffPotency: 0,
				massBuffPotency: 0,
				soloEffectDuration: 0,
				massEffectDuration: 0,
				targetCount: 0,
				criticalHitChance: 0,
				criticalBuffChance: 0,
				criticalHealChance: 0,
			},
			buffs: {
				cardId: '',
				buffs: [],
			},
			baseTribes: [],
			baseFeatures: [],
			relatedCards: [],
			variables: {},
			sortPriority: 0,
			expansionSet: ExpansionSet.BASE,

			isCollectible: false,
			isExperimental: false,

			isHidden: false,

			workshopTitle: cardTitle.value,
			workshopImage: currentImage.value,
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

		return {
			cardClass,
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

textarea {
	resize: vertical;
	min-height: 62px;
}
</style>
