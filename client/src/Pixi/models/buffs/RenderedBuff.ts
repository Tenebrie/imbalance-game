import * as PIXI from 'pixi.js'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'
import ClientBuff from '@/Pixi/models/buffs/ClientBuff'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import ClientBuffContainer from '@/Pixi/models/buffs/ClientBuffContainer'
import RenderedCard from '@/Pixi/cards/RenderedCard'

export default class RenderedBuff extends ClientBuff {
	container: PIXI.Container
	spriteWrapper: PIXI.Container
	sprite: PIXI.Sprite

	public constructor(container: ClientBuffContainer, message: BuffMessage) {
		super(message)

		const parent = container.parent
		if (parent instanceof RenderedCard) {
			throw new Error('Rendered buffs on cards are not yet supported')
		}

		this.sprite = new PIXI.Sprite(TextureAtlas.getTexture(`icons/${message.class}`, 'buff'))
		const mask = new PIXI.Sprite(TextureAtlas.getTexture('masks/circle'))
		this.sprite.anchor.set(0.5, 0.5)
		mask.anchor.set(0.5, 0.5)
		this.spriteWrapper = new PIXI.Container()
		this.sprite.width = 142
		this.sprite.height = 142
		mask.width = 142
		mask.height = 142
		this.spriteWrapper.addChild(this.sprite)
		this.spriteWrapper.addChild(mask)
		this.spriteWrapper.mask = mask

		parent.buffContainer.addChild(this.spriteWrapper)
		this.container = parent.buffContainer
	}

	public destroySprite(): void {
		this.container.removeChild(this.sprite)
		this.sprite.destroy()
	}
}
