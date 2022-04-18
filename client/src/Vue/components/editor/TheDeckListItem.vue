<template>
	<span>
		<span v-if="mode === DeckListMode.SELECT" class="deck-link" @click="onSelectDeck" :class="selectedClass">
			<keep-alive>
				<img v-if="iconPath" :src="iconPath" alt="Icon" @error="fetchFallbackIcon" />
			</keep-alive>
			<span>{{ deck.name }}</span>
		</span>
		<router-link
			v-if="mode === DeckListMode.EDIT"
			tag="span"
			class="deck-link"
			:to="{ path: `/decks/${deck.id}`, query: getCurrentRouteQuery() }"
		>
			<keep-alive>
				<img v-if="iconPath" :src="iconPath" alt="Icon" @error="fetchFallbackIcon" />
			</keep-alive>
			<span>{{ deck.name }}</span>
		</router-link>
	</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import DeckListMode from '@/utils/DeckListMode'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import router from '@/Vue/router'
import store from '@/Vue/store'

export default defineComponent({
	props: {
		deck: {
			type: Object,
			required: true,
		},
	},

	data: () => ({
		iconFallback: false as boolean,
	}),

	setup() {
		const getCurrentRouteQuery = () => router.currentRoute.value.query

		return {
			getCurrentRouteQuery,
			DeckListMode,
		}
	},

	computed: {
		mode(): DeckListMode {
			return this.$route.matched.some(({ name }) => name === 'home') ? DeckListMode.SELECT : DeckListMode.EDIT
		},

		isSelected(): boolean {
			return store.state.selectedDeckId === this.deck.id
		},

		selectedClass(): any {
			return {
				selected: this.isSelected,
			}
		},

		iconPath(): string {
			const deck = this.deck as PopulatedEditorDeck
			if (!deck.leader) {
				return ''
			}
			if (this.iconFallback) {
				return `/assets/icons/question.webp`
			}
			return `/assets/icons/${deck.leader.class}.webp`
		},
	},

	methods: {
		fetchFallbackIcon() {
			this.iconFallback = true
		},

		onSelectDeck() {
			const selectedDeckId = store.state.selectedDeckId
			if (selectedDeckId === this.deck.id) {
				store.commit.setSelectedDeckId('')
			} else {
				store.commit.setSelectedDeckId(this.deck.id)
			}
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.deck-link {
	padding: 4px 16px;
	text-align: start;
	font-size: 1.4em;
	cursor: pointer;
	display: flex;
	align-items: center;
	min-height: 1.4em;
	color: darken(white, 0) !important;
	text-decoration-line: none !important;
	transition: background-color 0.3s;

	& > span {
		text-decoration: none;
	}

	&.selected {
		background: rgba(lighten(green, 20), 0.1);
	}

	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
		transition: background-color 0s;
	}

	&.selected:hover {
		background: rgba(lighten(green, 50), 0.1);
	}
}

img {
	height: 32px;
	width: 32px;
	padding: 0 4px 0 0;
	display: inline;
	border-radius: 100%;
}
</style>
