import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellSteelSpark from './SpellSteelSpark'
import SpellFireball from './SpellFireball'
import SpellFieryEntrance from './SpellFieryEntrance'
import SpellAnEncouragement from './SpellAnEncouragement'
import {mapRelatedCards} from '../../../../../utils/Utils'

export default class LeaderVelElleron extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.LEADER, CardFaction.ARCANE)
		this.basePower = 0
		this.sortPriority = 0
		this.baseRelatedCards = [SpellSteelSpark, SpellAnEncouragement, SpellFireball, SpellFieryEntrance]
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound
		}
	}

	getDeckAddedSpellCards(): any[] {
		return [SpellSteelSpark, SpellAnEncouragement, SpellFireball, SpellFieryEntrance]
	}
}
