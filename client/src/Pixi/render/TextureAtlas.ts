import * as PIXI from 'pixi.js'
import store from '@/Vue/store'
import Notifications from '@/utils/Notifications'
import CardMessage from '@shared/models/network/card/CardMessage'

export default class TextureAtlas {
	static textures: { [index: string]: PIXI.Texture }

	static hasPreloadedComponents = false
	static isPreloadingComponents = false
	static preloadComponentsResolveFunctions: { (): void }[] = []

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
				'effects/trail',
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
				'board/board-row',
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
		const texturesToLoad = textureFilenames

		let texturesLoaded = 0

		const loadingNotification = Notifications.info('')
		loadingNotification.setTimeout(0)
		if (textureFilenames.length === 1) {
			loadingNotification.close()
		}

		const updateNotificationText = (loaded: number, total: number) => {
			loadingNotification.setText(`Loading assets (${loaded}/${total})...`)
		}

		updateNotificationText(0, texturesToLoad.length)

		const t0 = performance.now()
		texturesToLoad.forEach((fileName) => {
			const onLoaded = (loadedTexture: PIXI.Texture) => {
				texturesLoaded += 1
				TextureAtlas.textures[fileName.toLowerCase()] = loadedTexture
				updateNotificationText(texturesLoaded, texturesToLoad.length)

				if (texturesLoaded >= texturesToLoad.length) {
					loadingNotification.close()
					const t1 = performance.now()
					if (textureFilenames.length > 1) {
						console.info(`Loaded ${texturesLoaded} textures in ${Math.round(t1 - t0) / 1000} seconds`)
					}
					onReady()
				}
			}

			const existingTexture = TextureAtlas.textures[fileName.toLowerCase()]
			if (existingTexture) {
				onLoaded(existingTexture)
				return
			}

			const newTexture = PIXI.Texture.from(`/assets/${fileName}.png`)
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

	public static getTexture(path: string): PIXI.Texture {
		const texture = TextureAtlas.textures[path.toLowerCase()]
		if (texture) {
			return texture
		}
		return TextureAtlas.loadTextureOnDemand(path)
	}

	private static loadTextureOnDemand(path: string): PIXI.Texture {
		const loadedTexture = PIXI.Texture.from(`/assets/${path}.png`)
		if (loadedTexture.valid) {
			return loadedTexture
		}

		console.info(`Loading '${path}' on demand`)
		const clone = this.textures['cards/tokenPlaceholder'.toLowerCase()].clone()
		loadedTexture.on('update', () => {
			clone.baseTexture = loadedTexture.baseTexture
			this.textures[path.toLowerCase()] = loadedTexture
			PIXI.Texture.removeFromCache(loadedTexture)
		})
		return clone
	}

	public static clear(): void {
		TextureAtlas.textures = {}
		TextureAtlas.hasPreloadedComponents = false
		TextureAtlas.isPreloadingComponents = false
	}
}
