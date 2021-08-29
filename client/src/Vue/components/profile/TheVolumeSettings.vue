<template>
	<div class="the-volume-settings">
		<div class="element">
			<h4 class="header">{{ $locale.get('ui.volume.master') }}</h4>
			<h4 class="value">{{ masterVolume }}%</h4>
			<div class="toggle-container">
				<slider class="slider" v-model="masterVolume" :step="5" />
			</div>
		</div>
		<div class="element">
			<h4 class="header">{{ $locale.get('ui.volume.music') }}</h4>
			<h4 class="value">{{ musicVolume }}%</h4>
			<div class="toggle-container">
				<slider class="slider" v-model="musicVolume" :step="5" />
			</div>
		</div>
		<div class="element">
			<h4 class="header">{{ $locale.get('ui.volume.effects') }}</h4>
			<h4 class="value">{{ effectsVolume }}%</h4>
			<div class="toggle-container">
				<slider class="slider" v-model="effectsVolume" :step="5" />
			</div>
		</div>
		<div class="element">
			<h4 class="header">{{ $locale.get('ui.volume.ambience') }}</h4>
			<h4 class="value">{{ ambienceVolume }}%</h4>
			<div class="toggle-container">
				<slider class="slider" v-model="ambienceVolume" :step="5" />
			</div>
		</div>
		<div class="element">
			<h4 class="header">{{ $locale.get('ui.volume.userInterface') }}</h4>
			<h4 class="value">{{ userInterfaceVolume }}%</h4>
			<div class="toggle-container">
				<slider class="slider" v-model="userInterfaceVolume" :step="5" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue'

import Slider from '@/Vue/components/utils/Slider.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: { Slider },
	setup() {
		const masterVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.masterVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setMasterVolume(value / 100)
			},
		})

		const musicVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.musicVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setMusicVolume(value / 100)
			},
		})

		const effectsVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.effectsVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setEffectsVolume(value / 100)
			},
		})

		const ambienceVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.ambienceVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setAmbienceVolume(value / 100)
			},
		})

		const userInterfaceVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.userInterfaceVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setUserInterfaceVolume(value / 100)
			},
		})

		watch(
			() => [masterVolume.value, musicVolume.value, effectsVolume.value, ambienceVolume.value, userInterfaceVolume.value],
			() => {
				store.dispatch.userPreferencesModule.savePreferences()
			}
		)

		return {
			masterVolume,
			musicVolume,
			effectsVolume,
			ambienceVolume,
			userInterfaceVolume,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-volume-settings {
	width: 100%;
	text-align: start;
	padding-top: 8px;

	h4 {
		margin: 0;
	}

	.element {
		width: 100%;
		display: flex;
		justify-content: space-between;
		margin: 12px 0;

		.header {
			flex-shrink: 1;
		}

		.value {
			text-align: end;
			flex-grow: 1;
			margin-right: 4px;
		}

		.toggle-container {
			flex-grow: 0;
			flex-shrink: 0;
			width: 40%;
		}
	}
}
</style>
