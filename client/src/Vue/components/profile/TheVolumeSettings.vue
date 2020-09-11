<template>
	<div class="the-volume-settings">
		<div><h4>{{ $locale.get('ui.volume.master') }}</h4>
			<span><h4>{{ masterVolume }}%</h4><slider v-model="masterVolume" :step="5" /></span>
		</div>
		<div>
			<h4>{{ $locale.get('ui.volume.music') }}</h4>
			<span><h4>{{ musicVolume }}%</h4><slider v-model="musicVolume" :step="5" /></span>
		</div>
		<div>
			<h4>{{ $locale.get('ui.volume.effects') }}</h4>
			<span><h4>{{ effectsVolume }}%</h4><slider v-model="effectsVolume" :step="5" /></span>
		</div>
		<div>
			<h4>{{ $locale.get('ui.volume.ambience') }}</h4>
			<span><h4>{{ ambienceVolume }}%</h4><slider v-model="ambienceVolume" :step="5" /></span>
		</div>
		<div>
			<h4>{{ $locale.get('ui.volume.userInterface') }}</h4>
			<span><h4>{{ userInterfaceVolume }}%</h4><slider v-model="userInterfaceVolume" :step="5" /></span>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import {computed, defineComponent, watch} from '@vue/composition-api'
import Slider from '@/Vue/components/utils/Slider.vue'

export default defineComponent({
	components: {Slider},
	setup() {
		const masterVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.masterVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setMasterVolume(value / 100)
			}
		})

		const musicVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.musicVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setMusicVolume(value / 100)
			}
		})

		const effectsVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.effectsVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setEffectsVolume(value / 100)
			}
		})

		const ambienceVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.ambienceVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setAmbienceVolume(value / 100)
			}
		})

		const userInterfaceVolume = computed<number>({
			get() {
				return Math.round(store.state.userPreferencesModule.userInterfaceVolume * 100)
			},
			set(value) {
				store.commit.userPreferencesModule.setUserInterfaceVolume(value / 100)
			}
		})

		watch(() => [masterVolume.value, musicVolume.value, effectsVolume.value, ambienceVolume.value, userInterfaceVolume.value], () => {
			store.dispatch.userPreferencesModule.savePreferences()
		})

		return {
			masterVolume,
			musicVolume,
			effectsVolume,
			ambienceVolume,
			userInterfaceVolume,
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-volume-settings {
		width: 100%;
		text-align: start;
		padding-top: 8px;

		& > div {
			padding: 8px 0;
			width: 100%;
			display: flex;
			justify-content: space-between;

			h4 {
				display: inline;
				margin: 0;
			}

			span {
				width: 50%;
				display: flex;

				h4 {
					width: 50px;
					text-align: right;
					margin-right: 8px;
				}
			}
			input[type="range"] {
				display: inline;
				width: 100%;
				height: 20px;
				overflow-x: hidden;
				background-color: transparent;
				-webkit-appearance: none;
				border-radius: 16px;
				cursor: pointer;

				// Webkit
				&::-webkit-slider-runnable-track {
					height: 20px;
					background-color: transparent;
				}

				&::-webkit-slider-container {
					background-color: gray;
					max-height: 20px;
				}

				&::-webkit-slider-thumb {
					-webkit-appearance: none;
					background: lighten($COLOR-PRIMARY, 10);
					border-radius: 50%;
					box-shadow: -210px 0 0 200px lighten($COLOR-PRIMARY, 5);
					cursor: pointer;
					height: 20px;
					width: 20px;
					border: 0;
				}

				// Firefox
				&::-moz-range-thumb {
					background: lighten($COLOR-PRIMARY, 10);
					border-radius: 50%;

					height: 20px;
					width: 20px;
					border: 0;
				}
				&::-moz-range-track {
					background-color: gray;
					height: 8px;
					border-radius: 8px;
				}
				&::-moz-range-progress {
					background-color: lighten($COLOR-PRIMARY, 10);
					height: 8px;
					border-radius: 8px;
				}
				&:hover {
					&::-moz-range-thumb {
						background: lighten($COLOR-PRIMARY, 15);
					}
					&::-moz-range-track {
						background-color: lighten(gray, 5);
					}
					&::-moz-range-progress {
						background-color: lighten($COLOR-PRIMARY, 15);
					}
				}
			}
		}
	}
</style>
