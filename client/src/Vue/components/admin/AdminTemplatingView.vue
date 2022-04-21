<template>
	<div class="admin-templating-view">
		<div class="container">
			<div class="settings">
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
					<div class="select-list">
						<label>Faction</label>
						<div v-for="faction in availableFactions" :key="faction">
							<div class="color-list-content">
								<input :id="`color-list-item-${faction}`" type="radio" name="faction" :value="faction" v-model="cardFaction" />
								<label :for="`color-list-item-${faction}`">{{ $locale.get(`card.faction.${faction}`) }}</label>
							</div>
						</div>
					</div>
				</div>
				<div class="card-numbers">
					<label for="card-power">Power</label>
					<input id="card-power" type="text" v-model="cardPower" @input="validatePower" :disabled="displaySpellStats" />
					<label for="card-armor">Armor</label>
					<input id="card-armor" type="text" v-model="cardArmor" @input="validateArmor" :disabled="displaySpellStats" />
				</div>
				<div class="card-texts">
					<label for="card-name">Name</label>
					<input id="card-name" type="text" v-model="cardName" />
					<!-- <label for="card-title">Title</label>
					<input id="card-title" type="text" v-model="cardTitle" /> -->
					<label for="card-tribes">Tribes</label>
					<input id="card-tribes" type="text" v-model="cardTribes" />
					<label for="card-description">Description</label>
					<textarea id="card-description" v-model="cardDescription" />
					<label for="card-flavor">Flavor</label>
					<input id="card-flavor" type="text" v-model="cardFlavor" />
				</div>
			</div>
		</div>
		<div class="actions">
			<button class="primary" @click="onSubmit"><i class="fa-solid fa-file-circle-plus" /> Create</button>
			<button class="primary destructive" @click="onClear"><i class="fas fa-trash" /> Clear</button>
		</div>
	</div>
</template>

<script lang="ts">
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import axios from 'axios'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'

import Notifications from '@/utils/Notifications'

export default defineComponent({
	setup() {
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
				if (items[i].kind !== 'string') {
					return
				}

				const typedItem = items[i] as DataTransferItem
				typedItem.getAsString((data) => {
					if (data.includes('<html>')) {
						return
					}
					parseGwentOneDump(data)
				})
			}
		}

		const previousDump = ref<string>('')
		const parseGwentOneDump = (data: string): void => {
			data = data.trim()

			cardArmor.value = '0'

			if (previousDump.value === data) {
				cardPower.value = String(Number(cardPower.value) + 1)
			} else {
				cardPower.value = '0'
				previousDump.value = data
			}

			const linesToFilter = [
				'Deathwish: Trigger this ability when destroyed and moved from the battlefield to the graveyard',
				'Spying: Status for a unit played on or moved to the opposite side of the battlefield',
				'Spawn: Add a card to the game',
				'Charm: Move an enemy to the opposite row',
				'Highest: Highest power, ties are resolved randomly',
				'Lowest: Lowest power, ties are resolved randomly',
				'Truce: If neither player has passed',
				'Armor: Absorbs a given amount of damage, then is removed',
				'Discard: Move a card from your hand to the graveyard',
				'Strengthen: Increase the base power of a unit',
				'Weaken: Decrease the base power of a unit',
				'Reset: Restore a card to its default state',
				'Consume: Eat a unit and boost by its power',
				'Create: Spawn one of three randomly selected cards from the specified source',
				'Summon: Move automatically to the battlefield',
				"Single-Use: This card's ability can be used only once per game",
				'Resurrect: Play from your graveyard',
				'Boon: Positive row effect',
				'Hazard: Negative row effect',
			]

			console.log(data)

			const keywordsToHighlight = linesToFilter
				.map((line) => line.substring(0, line.indexOf(':')))
				.map((line) => ({
					regex: new RegExp(`${line}`, 'g'),
					value: line,
				}))

			const lines = data.split('\n')
			const name = lines[0]
			const tribes = lines[1]
			const flavor = lines[lines.length - 1]
			const ability = lines.slice(2, -1)

			const armorRegex = /^[0-9] Armor\./
			const lineWithArmor = ability.find((line) => armorRegex.test(line))
			if (lineWithArmor) {
				const armorMatch = /^([0-9]) Armor\./.exec(lineWithArmor)
				if (armorMatch) {
					cardArmor.value = String(armorMatch[1])
				}
			}

			const filteredAbility = ability
				.filter((line) => !linesToFilter.some((filter) => line.includes(filter)))
				.filter((line) => !armorRegex.test(line))

			const abilityValues: { index: number; length: number; position: number; value: number }[] = []
			const abilityValueRegex = /\s?([0-9]+)\s?/g
			const abilityAsString = filteredAbility.join('\n')
			let execResult = abilityValueRegex.exec(abilityAsString)
			while (execResult) {
				abilityValues.push({
					index: abilityValues.length,
					length: execResult.length,
					position: execResult.index,
					value: Number(execResult[1]),
				})
				execResult = abilityValueRegex.exec(abilityAsString)
			}

			const abilityWithVariables = abilityValues.reverse().reduce((output, abilityValue) => {
				return (
					output.slice(0, abilityValue.position) +
					` {{ VAR_${abilityValue.index} = ${abilityValue.value} }}` +
					output.slice(abilityValue.position + abilityValue.length)
				)
			}, abilityAsString)

			const finalAbility = keywordsToHighlight.reduce((output, keyword) => {
				return output.replace(keyword.regex, `*${keyword.value}*`)
			}, abilityWithVariables)

			cardName.value = name
			cardTribes.value = tribes
			cardDescription.value = finalAbility
			cardFlavor.value = flavor
		}

		const displayUnitStats = computed<boolean>(() => cardType.value === CardType.UNIT)
		const displaySpellStats = computed<boolean>(() => cardType.value === CardType.SPELL)

		const cardType = ref<CardType>(CardType.UNIT)
		const cardColor = ref<CardColor>(CardColor.GOLDEN)
		const cardFaction = ref<CardFaction>(CardFaction.NEUTRAL)

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
		const cardFlavor = ref<string>('')

		const copyToClipboard = (value: string): void => {
			const el = document.createElement('textarea')
			el.value = value
			document.body.appendChild(el)
			el.select()
			document.execCommand('copy')
			document.body.removeChild(el)
		}

		const onSubmit = async () => {
			axios
				.post('/api/dev/cards', {
					cardType: cardType.value,
					cardColor: cardColor.value,
					cardFaction: cardFaction.value,
					cardName: cardName.value,
					cardTribes: cardTribes.value,
					cardDescription: cardDescription.value,
					cardFlavor: cardFlavor.value,
					cardPower: Number(cardPower.value || '0'),
					cardArmor: Number(cardArmor.value || '0'),
				})
				.then((response) => {
					Notifications.success(`Card ${response.data.cardId} created (name copied to clipboard).`)
					copyToClipboard(response.data.cardId)
				})
				.catch((err) => {
					Notifications.error(`Unable to create card template! Server responded with status ${err.response.status}.`)
				})
			onClear()
		}

		const onClear = () => {
			cardPower.value = ''
			cardArmor.value = ''
			cardName.value = ''
			cardTitle.value = ''
			cardTribes.value = ''
			cardDescription.value = ''
			cardFlavor.value = ''
		}

		return {
			displayUnitStats,
			displaySpellStats,
			cardType,
			cardColor,
			cardFaction,
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
			cardFlavor,
			onSubmit,
			onClear,
			availableTypes: Object.values(CardType).filter((value) => typeof value === 'number'),
			availableColors: Object.values(CardColor).filter((value) => typeof value === 'number'),
			availableFactions: Object.values(CardFaction)
				.filter((value) => typeof value === 'number')
				.slice(3),
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.actions {
	flex: 1;
	display: flex;
	gap: 16px;
	width: 100%;

	& > * {
		flex: 1;
	}

	input[type='file'] {
		display: none;
	}
}

.admin-templating-view {
	display: flex;
	align-items: center;
	text-align: start;
	flex-direction: column;
	gap: 16px;
	padding: 16px;

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: flex-end;

		& > div {
			display: flex;
			flex-direction: column;

			&.settings {
				flex: 3;

				display: flex;
				flex-direction: column;
				justify-content: space-between;
				gap: 16px;
			}
		}
	}
}

.lists {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;

	.select-list {
		margin: 8px;
		padding: 4px;
		label {
			margin-bottom: 8px;
		}

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

.card-numbers {
	input[type='text'] {
		margin-bottom: 12px;
	}
}
.card-texts {
	input[type='text'] {
		margin-bottom: 12px;
	}
}

label {
	text-align: start;
}

input[type='radio'] {
	margin-right: 6px;
}

input[type='text'] {
	font-size: 1.2em;
}

textarea {
	resize: vertical;
	min-height: 120px;
	max-height: calc(120px * 4);
	font-size: 1.2em;
}
</style>
