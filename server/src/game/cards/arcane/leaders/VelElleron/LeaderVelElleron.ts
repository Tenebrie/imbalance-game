import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellSteelSpark from './SpellSteelSpark'
import SpellFireball from './SpellFireball'
import SpellFieryEntrance from './SpellFieryEntrance'
import SpellAnEncouragement from './SpellAnEncouragement'

export default class LeaderVelElleron extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.ARCANE,
			relatedCards: [SpellSteelSpark, SpellAnEncouragement, SpellFireball, SpellFieryEntrance],
			sortPriority: 0
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound
		}
	}

	getDeckAddedSpellCards(): any[] {
		return [SpellSteelSpark, SpellAnEncouragement, SpellFireball, SpellFieryEntrance]
	}
}
