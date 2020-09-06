<template>
	<span>
		<span v-if="mode === DeckListMode.SELECT" class="deck-link" @click="onSelectDeck" :class="selectedClass">
			<keep-alive>
				<img v-if="iconPath" :src="iconPath" alt="Deck icon" />
			</keep-alive>
			<span>{{ deck.name }}</span>
		</span>
		<router-link v-if="mode === DeckListMode.EDIT" tag="span" class="deck-link" :to="{ path: `/decks/${deck.id}`, query: router.currentRoute.query }">
			<keep-alive>
				<img v-if="iconPath" :src="iconPath" alt="Deck icon" />
			</keep-alive>
			<span>{{ deck.name }}</span>
		</router-link>
	</span>
</template>

<script lang="ts">
import store from '@/Vue/store'
import DeckListMode from '@/utils/DeckListMode'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import {defineComponent} from '@vue/composition-api'
import router from '@/Vue/router'

export default defineComponent({
	props: {
		deck: {
			type: Object,
			required: true
		}
	},

	setup() {
		return {
			router
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

		iconPath(): string {
			const deck = this.deck as PopulatedEditorDeck
			if (!deck.leader) {
				return null
			}
			return `/assets/icons/${deck.leader.class}.png`
		}
	},

	methods: {
		onSelectDeck() {
			const selectedDeckId = store.state.selectedDeckId
			if (selectedDeckId === this.deck.id) {
				store.commit.setSelectedDeckId('')
			} else {
				store.commit.setSelectedDeckId(this.deck.id)
			}
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
		display: flex;
		align-items: center;
		min-height: 1.4em;

		&.selected {
			background: rgba(lighten(green, 20), 0.1);
		}

		&:hover {
			background: $COLOR-BACKGROUND-TRANSPARENT;
		}

		&.selected:hover {
			background: rgba(lighten(green, 50), 0.1);
		}
	}

	img {
		height: 32px;
		padding: 0 4px 0 0;
		display: inline;
		border-radius: 100%;
	}
</style>
