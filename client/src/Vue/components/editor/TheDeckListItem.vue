<template>
	<span>
		<span v-if="mode === DeckListMode.SELECT" class="deck-link" @click="onSelectDeck" :class="selectedClass">
			<span>{{ deck.name }}</span> <span class="deck-info" v-if="showDeckInfo">({{ leaderName }})</span>
		</span>
		<router-link v-if="mode === DeckListMode.EDIT" tag="span" class="deck-link" :to="{ path: `/decks/${deck.id}` }">
			<span>{{ deck.name }}</span> <span class="deck-info" v-if="showDeckInfo">({{ leaderName }})</span>
		</router-link>
	</span>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Localization from '@/Pixi/Localization'
import DeckListMode from '@/utils/DeckListMode'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'

export default Vue.extend({
	props: {
		deck: {
			type: Object,
			required: true
		}
	},

	data: () => ({
		DeckListMode: DeckListMode
	}),

	computed: {
		mode(): DeckListMode {
			return this.$route.matched.some(({ name }) => name === 'home') ? DeckListMode.SELECT : DeckListMode.EDIT
		},

		isSelected(): boolean {
			return store.state.selectedDeckId === this.deck.id
		},

		selectedClass(): any {
			return {
				'selected': this.isSelected
			}
		},

		showDeckInfo(): boolean {
			const deck = this.deck as PopulatedEditorDeck
			return !deck.isUnfinished()
		},

		leaderName(): string {
			const deck = this.deck as PopulatedEditorDeck
			return Localization.getString(deck.leader.name) + ', ' + Localization.getString(deck.leader.title)
		}
	},

	methods: {
		onSelectDeck() {
			store.commit.setSelectedDeckId(this.deck.id)
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.deck-link {
		padding: 4px 16px;
		text-align: start;
		font-size: 1.4em;
		cursor: pointer;
		display: block;

		&:hover, &.selected {
			background: $COLOR-BACKGROUND-TRANSPARENT;
		}
	}
</style>
