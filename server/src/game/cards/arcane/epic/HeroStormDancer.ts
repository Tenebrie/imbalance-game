import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellGatheringStorm from '../tokens/SpellGatheringStorm'
import CardLibrary from '../../../libraries/CardLibrary'
import GameEvent from '../../../models/GameEvent'

export default class HeroStormDancer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 7

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const stormsPlayed = this.owner.cardGraveyard.findCardsByConstructor(SpellGatheringStorm).length

		for (let i = 0; i < stormsPlayed; i++) {
			this.owner.cardHand.addSpell(CardLibrary.instantiateByConstructor(this.game, SpellGatheringStorm))
		}
	}
}
