import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import BuffSparksExtraDamage from '../../../buffs/BuffSparksExtraDamage'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'

export default class HeroSparklingSpirit extends ServerCard {
	extraDamage = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 9
		this.dynamicTextVariables = {
			extraDamage: this.extraDamage
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		for (let i = 0; i < this.extraDamage; i++) {
			this.buffs.add(BuffSparksExtraDamage, this)
		}
	}
}
