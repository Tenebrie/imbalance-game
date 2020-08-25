import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellShadowSpark from './SpellShadowSpark'
import SpellNightmareDrain from './SpellNightmareDrain'
import SpellCrystalBarrage from './SpellCrystalBarrage'
import SpellShadowArmy from './SpellShadowArmy'
import {mapRelatedCards} from '../../../../../utils/Utils'

export default class LeaderNighterie extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.LEADER, CardFaction.ARCANE)
		this.basePower = 0
		this.sortPriority = 2
		this.baseRelatedCards = [SpellShadowSpark, SpellNightmareDrain, SpellCrystalBarrage, SpellShadowArmy]
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound
		}
	}

	getDeckAddedSpellCards(): any[] {
		return [SpellShadowSpark, SpellNightmareDrain, SpellCrystalBarrage, SpellShadowArmy]
	}
}
