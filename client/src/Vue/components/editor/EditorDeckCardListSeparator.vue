<template>
	<div class="editor-deck-card-list-separator" :class="colorClass">
		<span class="line-container left"><span class="line"></span></span>
		<span class="text">{{ separatorText }} ({{ cardLimitUsed }}/{{ cardLimitTotal }})</span>
		<span class="line-container right"><span class="line"></span></span>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import Localization from '@/Pixi/Localization'
import CardColor from '@shared/enums/CardColor'
import { defineComponent } from 'vue'
import { getMaxCardCountForColor } from '@shared/Utils'

export default defineComponent({
	props: {
		color: {
			type: Number,
			required: true,
		},
	},

	computed: {
		colorAsString(): string {
			switch (this.color) {
				case CardColor.LEADER:
					return 'leader'
				case CardColor.GOLDEN:
					return 'golden'
				case CardColor.SILVER:
					return 'silver'
				case CardColor.BRONZE:
					return 'bronze'
				default:
					return ''
			}
		},

		separatorText(): string {
			return Localization.get(`card.color.${this.colorAsString}`)
		},

		cardLimitUsed(): number {
			const deckId = this.$route.params.deckId
			return store.getters.editor.cardsOfColor({
				deckId: deckId,
				color: this.color,
			})
		},

		cardLimitTotal(): number {
			return getMaxCardCountForColor(this.color)
		},

		colorClass(): any {
			return {
				[this.colorAsString]: true,
			}
		},
	},

	methods: {},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.editor-deck-card-list-separator {
	width: calc(100% - 16px);
	display: flex;
	flex-direction: row;
	padding: 4px 8px;
	user-select: none;
	font-size: 1.1em;

	&.leader {
		color: MediumAquamarine;

		.line {
			background: MediumAquamarine;
		}
	}

	&.golden {
		color: orange;

		.line {
			background: orange;
		}
	}

	&.silver {
		color: #bb20bb;

		.line {
			background: #bb20bb;
		}
	}

	&.bronze {
		color: white;

		.line {
			background: white;
		}
	}

	.text {
		display: inline-block;
		margin: 0 8px;
	}

	.line-container.left {
		width: 30px;
	}

	.line-container.right {
		flex: 1;
	}

	.line-container {
		width: 100px;
		display: flex;
		flex-direction: column;
		justify-content: center;

		.line {
			width: 100%;
			border-radius: 2px;
			height: 4px;
			display: block;
		}
	}
}
</style>
