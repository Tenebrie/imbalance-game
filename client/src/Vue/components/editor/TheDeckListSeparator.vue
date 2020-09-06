<template>
	<div class="editor-deck-card-list-separator" :class="factionClass">
		<span class="line-container left"><span class="line"></span></span>
		<span class="text">{{ separatorText }}</span>
		<span class="line-container right"><span class="line"></span></span>
	</div>
</template>

<script lang="ts">
import Localization from '@/Pixi/Localization'
import CardFaction from '@shared/enums/CardFaction'
import {computed, defineComponent} from '@vue/composition-api'
import {PropType} from 'vue'

interface Props {
	faction: CardFaction,
	isExperimental: boolean,
}

export default defineComponent({
	props: {
		faction: {
			type: [Number, String] as PropType<CardFaction | 'e'>,
			required: true,
		},

		isExperimental: {
			type: Boolean as PropType<boolean>,
			required: true,
		}
	},

	setup(props: Props) {
		const factionAsString = computed<string>(() => {
			switch (props.faction) {
				case CardFaction.HUMAN:
					return 'human'
				case CardFaction.ARCANE:
					return 'arcane'
				case CardFaction.WILD:
					return 'wild'
				case CardFaction.NEUTRAL:
					return 'neutral'
				default:
					return props.faction
			}
		})

		const separatorText = computed<string>(() => {
			let faction = factionAsString.value
			if (props.isExperimental) {
				faction += '.experimental'
			}
			return Localization.get(`card.faction.${faction}`)
		})

		const factionClass = computed<Record<string, boolean>>(() => ({
			[factionAsString.value]: true,
			experimental: props.isExperimental,
		}))

		return {
			factionClass,
			separatorText,
		}
	},
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

		&.human {
			color: darkgoldenrod;

			.line {
				background: darkgoldenrod;
			}
		}

		&.arcane {
			color: teal;

			.line {
				background: teal;
			}
		}

		&.wild {
			color: green;

			.line {
				background: green;
			}
		}

		&.neutral {
			color: gray;

			.line {
				background: gray;
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
