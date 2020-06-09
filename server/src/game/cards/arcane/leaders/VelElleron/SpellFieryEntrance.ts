import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerPlayerInGame from '../../../../players/ServerPlayerInGame'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'

export default class SpellFieryEntrance extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)

		this.basePower = 8
		this.baseFeatures = [CardFeature.HERO_POWER]
	}

	onPlayedAsSpell(owner: ServerPlayerInGame): void {
		if (owner.cardDeck.unitCards.length === 0) {
			return
		}

		owner.summonCardFromUnitDeck(owner.cardDeck.unitCards[0])
	}
}
