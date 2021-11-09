import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import UnitStrayDog from '../../tokens/UnitStrayDog'

export default class SpellRustedWhistle extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SALVAGE],
			relatedCards: [UnitStrayDog],
			sortPriority: 4,
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => Keywords.createCard.for(owner).fromConstructor(UnitStrayDog))
		this.createEffect(GameEventType.CARD_PRE_RESOLVED).perform(() => {
			this.buffs.add(BuffSpellExtraCostThisRound, this)
		})
	}
}
