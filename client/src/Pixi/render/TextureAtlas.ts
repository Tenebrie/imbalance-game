import axios from 'axios'
import * as PIXI from 'pixi.js'
import CardMessage from '@/shared/models/network/CardMessage'

export default class TextureAtlas {
	static texturesLoaded: number
	static texturesToLoad: number
	static textures: { [ index: string ]: PIXI.Texture }

	public static async prepare(): Promise<void> {
		return new Promise(async (resolve) => {
			if (TextureAtlas.texturesLoaded > 0) {
				resolve()
				return
			}

			TextureAtlas.texturesLoaded = 0
			TextureAtlas.textures = {}

			const components = [
				'components/bg-power',
				'components/bg-power-zoom',
				'components/bg-name',
				'components/bg-description',
				'cards/cardBack'
			]

			const response = await axios.get('/cards')
			const cardMessages: CardMessage[] = response.data
			const cards = cardMessages.map(cardMessage => {
				const name = cardMessage.cardClass.substr(0, 1).toLowerCase() + cardMessage.cardClass.substr(1)
				return `cards/${name}`
			})

			const texturesToLoad = components.concat(cards)
			console.log(texturesToLoad)

			TextureAtlas.texturesToLoad = texturesToLoad.length

			texturesToLoad.forEach(fileName => {
				const texture = PIXI.Texture.from(`assets/${fileName}.png`)

				const onLoaded = () => {
					TextureAtlas.texturesLoaded += 1
					TextureAtlas.textures[fileName.toLowerCase()] = texture

					if (TextureAtlas.texturesLoaded >= TextureAtlas.texturesToLoad) {
						console.info('TextureAtlas initialized')
						resolve()
					}
				}
				texture.baseTexture.on('loaded', onLoaded)
				texture.baseTexture.on('error', onLoaded)
			})
		})
	}

	public static isReady(): boolean {
		return TextureAtlas.texturesLoaded >= TextureAtlas.texturesToLoad
	}

	public static getTexture(path: string): PIXI.Texture {
		path = path.toLowerCase()
		if (!this.isReady()) {
			console.warn(`Accessing texture at '${path}' before TextureAtlas is ready!`)
		}
		const texture = this.textures[path]
		if (!texture) {
			console.warn(`No texture available at '${path}'`)
		}
		return this.textures[path]
	}
}
