<template>
	<div class="language-selector">
		<div v-for="language in supportedLanguages" :key="language">
			<button class="secondary" :for="`language-list-item-${language}`" @click="() => setUserLanguage(language)">{{ language.toUpperCase() }}</button>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from '@vue/composition-api'
import {supportedLanguages} from '@/Pixi/Localization'
import Language from '@shared/enums/Language'
import store from '@/Vue/store'

export default defineComponent({
	setup() {
		const setUserLanguage = (value: Language) => {
			store.commit.userPreferencesModule.setUserLanguage(value)
			store.commit.editor.clearRenderedCards()
		}

		return {
			setUserLanguage,
			supportedLanguages
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.language-selector {
		display: flex;
		flex-direction: row;
		border: 1px solid darken($COLOR-BACKGROUND, 30);
		margin: 8px;
		border-radius: 8px;

		div {
			&:last-child {
				button {
					border-right: none;
				}
			}
		}

		button {
			border: none;
			height: 100%;
			min-height: 100%;
			padding: 2px 8px;
			margin: 0;
			border-radius: 0;
			border-right: 1px solid darken($COLOR-BACKGROUND, 30);
		}
	}
</style>
