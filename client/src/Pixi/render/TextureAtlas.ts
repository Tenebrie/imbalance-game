import CardMessage from '@shared/models/network/card/CardMessage'
import * as PIXI from 'pixi.js'

import Notifications from '@/utils/Notifications'
import store from '@/Vue/store'
import { NotificationWrapper } from '@/Vue/store/modules/NotificationModule'

export default class TextureAtlas {
	static textures: { [index: string]: PIXI.Texture } = {}

	static hasPreloadedComponents = false
	static isPreloadingComponents = false
	static preloadComponentsResolveFunctions: { (): void }[] = []

	static loadingNotification: NotificationWrapper | null = null
	static loadingStartedAt = 0
	static totalAssetsToLoad = 0
	static assetsAlreadyLoaded = 0

	public static async preloadComponents(): Promise<void> {
		return new Promise((resolve) => {
			if (TextureAtlas.hasPreloadedComponents) {
				resolve()
				return
			}

			TextureAtlas.preloadComponentsResolveFunctions.push(resolve)
			if (TextureAtlas.isPreloadingComponents || !store.state.isLoggedIn) {
				return
			}

			this.isPreloadingComponents = true
			TextureAtlas.textures = {}

			const components = [
				'masks/black',
				'masks/circle',
				'icons/question',
				'effects/trail-large',
				'effects/trail-normal',
				'effects/fireball-static',
				'effects/particle',
				'board/row-allied',
				'board/row-enemy',
				'board/power-allied',
				'board/power-enemy',
				'cards/unitHidden',
				'cards/spellHidden',
				'cards/tokenPlaceholder',
				'components/bg-power',
				'components/bg-power-zoom',
				'components/bg-armor',
				'components/bg-armor-zoom',
				'components/bg-manacost',
				'components/bg-name',
				'components/bg-tribe',
				'components/bg-description-top',
				'components/bg-description-middle-short',
				'components/bg-description-middle-long',
				'components/bg-description-bottom',
				'components/bg-stats-left',
				'components/bg-stats-middle',
				'components/bg-stats-right',
				'components/bg-stats-right-zoom',
				'components/bg-overlay-unit-bronze',
				'components/bg-overlay-unit-silver',
				'components/bg-overlay-unit-golden',
				'components/bg-overlay-unit-leader',
				'components/bg-overlay-spell',
				'components/stat-attack-claw',
				'components/stat-attack-range',
				'components/stat-health-armor',
				'components/overlay-move',
				'components/overlay-disabled',
				'components/tint-overlay',
				'components/tint-overlay-full',
			]

			TextureAtlas.load(components, () => {
				this.hasPreloadedComponents = true
				this.isPreloadingComponents = false
				this.preloadComponentsResolveFunctions.forEach((resolve) => resolve())
			})
		})
	}

	public static async loadCard(cardMessage: CardMessage, onReady: () => void): Promise<void> {
		const name = cardMessage.class.substr(0, 1).toLowerCase() + cardMessage.class.substr(1)
		const path = `cards/${name}`
		await TextureAtlas.load([path], onReady)
	}

	private static async load(textureFilenames: string[], onReady: () => void): Promise<void> {
		let texturesLoadedThisBatch = 0
		const texturesToLoad = textureFilenames

		if (!TextureAtlas.loadingNotification) {
			TextureAtlas.loadingNotification = Notifications.loading('')
			TextureAtlas.totalAssetsToLoad = 0
			TextureAtlas.assetsAlreadyLoaded = 0
			TextureAtlas.loadingStartedAt = performance.now()
		}
		const loadingNotification = TextureAtlas.loadingNotification

		const updateNotificationText = () => {
			loadingNotification.setText(`Loading assets (${TextureAtlas.assetsAlreadyLoaded}/${TextureAtlas.totalAssetsToLoad})...`)
		}

		TextureAtlas.totalAssetsToLoad += texturesToLoad.length
		updateNotificationText()

		texturesToLoad.forEach((fileName) => {
			const onLoaded = (loadedTexture: PIXI.Texture) => {
				TextureAtlas.textures[fileName.toLowerCase()] = loadedTexture
				TextureAtlas.assetsAlreadyLoaded += 1
				updateNotificationText()

				if (TextureAtlas.assetsAlreadyLoaded >= TextureAtlas.totalAssetsToLoad) {
					loadingNotification.discard()
					TextureAtlas.loadingNotification = null
					const t1 = performance.now()
					console.info(
						`Loaded ${TextureAtlas.assetsAlreadyLoaded} textures in ${Math.round(t1 - TextureAtlas.loadingStartedAt) / 1000} seconds`
					)
				}
				texturesLoadedThisBatch += 1
				if (texturesLoadedThisBatch >= texturesToLoad.length) {
					onReady()
				}
			}

			const existingTexture = TextureAtlas.textures[fileName.toLowerCase()]
			if (existingTexture) {
				onLoaded(existingTexture)
				return
			}

			const newTexture = PIXI.Texture.from(`/assets/${fileName}.webp`)
			if (newTexture.valid) {
				onLoaded(newTexture)
			}

			newTexture.baseTexture.on('loaded', () => onLoaded(newTexture))
			newTexture.baseTexture.on('error', () => {
				console.error(`Unable to load texture ${fileName}`)
				onLoaded(newTexture)
			})
		})
	}

	public static getTexture(path: string, placeholder: 'card' | 'buff' = 'card'): PIXI.Texture {
		const texture = TextureAtlas.textures[path.toLowerCase()]
		if (texture) {
			return texture
		}
		return TextureAtlas.loadTextureOnDemand(path, placeholder)
	}

	private static loadTextureOnDemand(path: string, placeholder: 'card' | 'buff' = 'card'): PIXI.Texture {
		const loadedTexture = PIXI.Texture.from(`/assets/${path}.webp`)
		if (loadedTexture.valid) {
			return loadedTexture
		}

		console.info(`Loading '${path}' on demand`)
		const placeholderPath = placeholder === 'buff' ? 'icons/question' : 'cards/tokenPlaceholder'
		console.log(placeholderPath)
		const clone = this.textures[placeholderPath.toLowerCase()].clone()
		loadedTexture.on('update', () => {
			clone.baseTexture = loadedTexture.baseTexture
			this.textures[path.toLowerCase()] = loadedTexture
			PIXI.Texture.removeFromCache(loadedTexture)
		})
		return clone
	}

	public static clear(): void {
		for (const name in TextureAtlas.textures) {
			const texture = TextureAtlas.textures[name]
			texture.destroy(true)
		}
		TextureAtlas.textures = {}
		TextureAtlas.hasPreloadedComponents = false
		TextureAtlas.isPreloadingComponents = false
	}
}
