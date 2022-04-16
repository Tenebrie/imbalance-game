<template>
	<div
		class="editor-deck-card-list-item"
		:class="colorClass"
		@click="onClick"
		@contextmenu="onRightClick"
		@mouseenter="onMouseEnter"
		@mouseleave="onMouseLeave"
	>
		<span class="power" v-if="showPower">{{ card.stats.basePower }}</span>
		<span class="power" v-if="!showPower"><i class="fas fa-scroll" /></span>
		<span class="name"
			>{{ fullName }}<span class="count" v-if="displayCount">x{{ card.count }}</span></span
		>
	</div>
</template>

<script lang="ts">
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import PopulatedEditorCard from '@shared/models/PopulatedEditorCard'
import { getMaxCardCopiesForColor } from '@shared/Utils'
import * as PIXI from 'pixi.js'
import { defineComponent, PropType } from 'vue'

import Localization from '@/Pixi/Localization'
import store from '@/Vue/store'
import InspectedCardStore from '@/Vue/store/InspectedCardStore'

export default defineComponent({
	props: {
		card: {
			type: Object as PropType<PopulatedEditorCard>,
			required: true,
		},
	},

	computed: {
		fullName(): string {
			const listName = Localization.getCardListName(this.card)
			if (listName) {
				return listName
			}
			let name = Localization.getCardName(this.card)
			const title = Localization.getCardTitle(this.card)
			if (title) {
				name = `${name}, ${title}`
			}
			return name
		},

		showPower(): boolean {
			return this.card.type !== CardType.SPELL
		},

		displayCount(): boolean {
			return getMaxCardCopiesForColor(this.card.color) > 1
		},

		colorClass(): any {
			return {
				leader: this.card.color === CardColor.LEADER,
				golden: this.card.color === CardColor.GOLDEN,
				silver: this.card.color === CardColor.SILVER,
				bronze: this.card.color === CardColor.BRONZE,

				human: this.card.faction === CardFaction.HUMAN,
				arcane: this.card.faction === CardFaction.ARCANE,
				wild: this.card.faction === CardFaction.WILD,
				// eternal: this.card.faction === CardFaction.ETERNAL,
				neutral: this.card.faction === CardFaction.NEUTRAL,
			}
		},
	},

	methods: {
		onClick(): void {
			const deckId = this.$route.params.deckId as string
			store.dispatch.editor.removeCardFromDeck({
				deckId: deckId,
				cardToRemove: this.card,
			})
			if (!store.getters.editor.deck(deckId)!.cards.find((card) => card.id === this.card.id)) {
				store.commit.editor.hoveredDeckCard.setCard(null)
			}
		},

		onRightClick(event: MouseEvent): void {
			if (event.ctrlKey) {
				return
			}

			InspectedCardStore.dispatch.clear()
			InspectedCardStore.dispatch.setCard({
				message: this.card,
			})
		},

		onMouseEnter(): void {
			const element = this.$el
			const boundingBox = element.getBoundingClientRect()
			store.dispatch.editor.hoveredDeckCard.setCard({
				card: this.card,
				position: new PIXI.Point(boundingBox.left, boundingBox.top),
				scrollCallback: () => this.onParentScroll(),
			})
		},

		onParentScroll(): void {
			this.onMouseLeave()
		},

		onMouseLeave(): void {
			store.commit.editor.hoveredDeckCard.setCard(null)
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.editor-deck-card-list-item {
	position: relative;
	width: calc(100% - 32px);
	display: flex;
	flex-direction: row;
	padding: 4px 16px;
	cursor: pointer;
	user-select: none;
	font-size: 1.3em;
	transition: background-color 0.3s;

	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
		transition: background-color 0s;
	}

	&.leader {
		color: $COLOR_LEADER;
	}

	&.golden {
		color: $COLOR_GOLDEN;
	}

	&.silver {
		color: $COLOR_SILVER;
	}

	&.bronze {
		color: $COLOR_BRONZE;
	}

	&:before {
		position: absolute;
		left: 8px;
		top: 4px;
		content: '';
		width: 4px;
		border-radius: 2px;
		height: calc(100% - 8px);
		background: $COLOR_HUMAN;
	}

	&.human:before {
		background: $COLOR_HUMAN;
	}
	&.arcane:before {
		background: $COLOR_ARCANE;
	}
	&.wild:before {
		background: $COLOR_WILD;
	}
	&.eternal:before {
		background: $COLOR_ETERNAL;
	}

	&.neutral:before {
		background: $COLOR_NEUTRAL;
	}

	.power {
		min-width: 25px;
		margin-right: 16px;
		text-align: right;
	}

	.name {
		text-align: left;
		margin-left: 4px;
	}

	.count {
		margin-left: 4px;
	}
}
</style>
