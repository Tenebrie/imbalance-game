import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffImmunity from '../../../buffs/BuffImmunity'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import ServerAnimation from '../../../models/ServerAnimation'
import CardFeature from '@shared/enums/CardFeature'

export default class HeroZamarath extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 12
		this.baseArmor = 5
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_IMMUNITY]

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		this.buffs.add(BuffImmunity, this, BuffDuration.START_OF_NEXT_TURN)
		this.game.animation.play(ServerAnimation.cardsReceivedBuff([this], BuffAlignment.POSITIVE))
	}
}
