import {Howl} from 'howler'
import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import store from '@/Vue/store'

interface AudioFile {
	src: string
	volume: number
}

export enum AudioSystemMode {
	MENU,
	GAME,
}

class EffectsTrack {
	private audioEffects: Map<AudioEffectCategory, AudioFile[]>
	private audioCooldowns: Map<AudioEffectCategory, number | undefined>

	constructor() {
		this.audioEffects = new Map<AudioEffectCategory, any>()
		this.audioCooldowns = new Map<AudioEffectCategory, number | undefined>()

		this.addEffects(AudioEffectCategory.PROJECTILE, [
			{ src: 'projectile00', volume: 0.5 },
			{ src: 'projectile01', volume: 0.5 },
			{ src: 'projectile02', volume: 0.5 },
			{ src: 'projectile03', volume: 0.5 },
			{ src: 'projectile04', volume: 0.5 },
		])
		this.addEffects(AudioEffectCategory.IMPACT_GENERIC, [
			{ src: 'impact_generic00', volume: 0.5 },
			{ src: 'impact_generic01', volume: 0.5 },
			{ src: 'impact_generic02', volume: 0.5 },
			{ src: 'impact_generic03', volume: 0.5 },
		])
		this.addEffects(AudioEffectCategory.IMPACT_HEAL, [
			{ src: 'impact_heal00', volume: 0.5 },
		])
		this.addEffects(AudioEffectCategory.UNIT_DEPLOY, ['deploy00', 'deploy01', 'deploy02'])
		this.addEffects(AudioEffectCategory.BUFF_POSITIVE, [
			{ src: 'buff_positive', volume: 0.5 },
		])
		this.addEffects(AudioEffectCategory.BUFF_NEGATIVE, [
			{ src: 'buff_negative', volume: 0.4 },
		])
		this.addEffects(AudioEffectCategory.TARGETING_CONFIRM, ['targeting_confirm'])
		this.addEffects(AudioEffectCategory.CARD_MOVE, ['card_move00', 'card_move01', 'card_move02', 'card_move03'])
		this.addEffects(AudioEffectCategory.CARD_ANNOUNCE, [
			{ src: 'card_announce00', volume: 0.4 },
			{ src: 'card_announce01', volume: 0.4 },
			{ src: 'card_announce02', volume: 0.4 },
		])
	}

	private addEffects(category: AudioEffectCategory, sources: (string | AudioFile)[]): void {
		const insertData: AudioFile[] = sources.map(source => {
			if (typeof(source) === 'object') {
				return {
					...source,
					src: `/assets/audio/${source.src}.ogg`
				}
			}
			return {
				src: `/assets/audio/${source}.ogg`,
				volume: 1.0
			}
		})
		this.audioEffects.set(category, insertData)
	}

	public playFromCategory(category: AudioEffectCategory): void {
		if (this.audioCooldowns.get(category) !== undefined) {
			return
		}

		const categoryEffects = this.audioEffects.get(category)
		const selectedEffect = categoryEffects[Math.floor(Math.random() * categoryEffects.length)]
		const audioHandle = new Howl({
			src: selectedEffect.src,
			loop: false,
			volume: this.getTrackVolume() * selectedEffect.volume
		})
		audioHandle.play()

		const timeoutHandle = window.setTimeout(() => this.audioCooldowns.set(category, undefined), 50)
		this.audioCooldowns.set(category, timeoutHandle)
	}

	private getTrackVolume(): number {
		return store.state.userPreferencesModule.masterVolume * store.state.userPreferencesModule.effectsVolume
	}
}

enum MusicTrackCategory {
	MENU,
	GAME_DAY,
	GAME_NIGHT,
	GAME_ANY,
}

class MusicTrack {
	private mode: AudioSystemMode
	private ostFiles: Map<MusicTrackCategory, AudioFile[]>

	private primaryTrack: Howl
	private primaryTrackDelayTimeout: number | null = null

	constructor() {
		const addFiles = (category: MusicTrackCategory, sources: string[]): void => {
			const insertData: AudioFile[] = sources.map(source => ({
				src: `/assets/audio/ost/${source}.ogg`,
				volume: 1.0
			}))
			this.ostFiles.set(category, insertData)
		}

		this.ostFiles = new Map<MusicTrackCategory, AudioFile[]>()
		addFiles(MusicTrackCategory.MENU, ['ambient_campfire01', 'ambient_campfire02'])
		addFiles(MusicTrackCategory.GAME_DAY, ['ambient_day01', 'ambient_day02'])
		addFiles(MusicTrackCategory.GAME_NIGHT, ['ambient_night01', 'ambient_night02'])
		addFiles(MusicTrackCategory.GAME_ANY, ['ambient_campfire01', 'ambient_campfire02', 'ambient_day01', 'ambient_day02', 'ambient_night01', 'ambient_night02'])
	}

	public switchToMenuMode(): void {
		this.mode = AudioSystemMode.MENU
		this.stop()
	}

	public switchToGameMode(): void {
		this.playPrimarySong(MusicTrackCategory.GAME_ANY)
	}

	private playPrimarySong(category: MusicTrackCategory, excludedIndex = -1): void {
		let validFiles = this.ostFiles.get(category)
		if (excludedIndex >= 0) {
			validFiles = validFiles.filter(file => file !== this.ostFiles.get(category)[excludedIndex])
		}
		const fileIndex = Math.floor(Math.random() * validFiles.length)

		this.primaryTrack = new Howl({
			src: validFiles[fileIndex].src,
			volume: this.getTrackVolume(),
			onend: () => this.onSongEnded(category, fileIndex)
		})
		this.primaryTrack.play()
	}

	private onSongEnded(category: MusicTrackCategory, excludedIndex = -1): void {
		this.primaryTrackDelayTimeout = window.setTimeout(() => {
			this.playPrimarySong(category, excludedIndex)
			this.primaryTrackDelayTimeout = null
		}, 3000)
	}

	private stop(): void {
		if (this.primaryTrackDelayTimeout !== null) {
			window.clearInterval(this.primaryTrackDelayTimeout)
		} else if (this.primaryTrack) {
			this.primaryTrack.stop()
		}
	}

	public updateVolumeLevels(): void {
		if (this.primaryTrack) {
			this.primaryTrack.volume(this.getTrackVolume())
		}
	}

	private getTrackVolume(): number {
		return store.state.userPreferencesModule.masterVolume * store.state.userPreferencesModule.musicVolume
	}
}

class AmbienceTrack {
	primaryTrack: Howl

	public start(): void {
		this.primaryTrack = new Howl({
			src: '/assets/audio/ambience.ogg',
			loop: true,
			autoplay: true,
			volume: this.getTrackVolume()
		})
		this.primaryTrack.play()
	}

	public stop(): void {
		if (this.primaryTrack) {
			this.primaryTrack.stop()
		}
	}

	public updateVolumeLevels(): void {
		if (this.primaryTrack) {
			this.primaryTrack.volume(this.getTrackVolume())
		}
	}

	private getTrackVolume(): number {
		return store.state.userPreferencesModule.masterVolume * store.state.userPreferencesModule.ambienceVolume * 0.07
	}
}

class AudioSystem {
	private currentMode: AudioSystemMode
	private musicTrack: MusicTrack = new MusicTrack()
	private effectsTrack: EffectsTrack = new EffectsTrack()
	private ambienceTrack: AmbienceTrack = new AmbienceTrack()

	public playEffect(category: AudioEffectCategory): void {
		this.effectsTrack.playFromCategory(category)
	}

	public updateVolumeLevels(): void {
		this.musicTrack.updateVolumeLevels()
		this.ambienceTrack.updateVolumeLevels()
	}

	public setMode(mode: AudioSystemMode): void {
		if (this.currentMode === mode) {
			return
		}

		this.currentMode = mode
		if (mode === AudioSystemMode.MENU) {
			this.ambienceTrack.stop()
			this.musicTrack.switchToMenuMode()
		} else if (mode === AudioSystemMode.GAME) {
			this.ambienceTrack.start()
			this.musicTrack.switchToGameMode()
		}
	}
}

export default new AudioSystem()
