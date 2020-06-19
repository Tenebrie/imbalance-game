<template>
	<div class="editor-deck-card-list-separator" :class="factionClass">
		<span class="line-container left"><span class="line"></span></span>
		<span class="text">{{ separatorText }}</span>
		<span class="line-container right"><span class="line"></span></span>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Localization from '@/Pixi/Localization'
import CardFaction from '@shared/enums/CardFaction'

export default Vue.extend({
	props: {
		faction: {
			type: Number,
			required: true
		}
	},

	computed: {
		factionAsString(): string {
			switch (this.faction) {
				case CardFaction.ARCANE:
					return 'arcane'
				case CardFaction.NEUTRAL:
					return 'neutral'
				case CardFaction.EXPERIMENTAL:
					return 'experimental'
				default:
					return ''
			}
		},

		separatorText(): string {
			return Localization.get(`card.faction.${this.factionAsString}`)
		},

		factionClass(): any {
			return {
				[this.factionAsString]: true
			}
		}
	},

	methods: {

	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.editor-deck-card-list-separator {
		width: calc(100% - 16px);
		display: flex;
		flex-direction: row;
		padding: 4px 8px;
		user-select: none;
		font-size: 1.1em;

		&.arcane {
			color: teal;

			.line {
				background: teal;
			}
		}

		&.neutral {
			color: white;

			.line {
				background: white;
			}
		}

		&.experimental {
			color: white;

			.line {
				background: white;
			}
		}

		&.unfinished {
			color: red;

			.line {
				background: red;
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
