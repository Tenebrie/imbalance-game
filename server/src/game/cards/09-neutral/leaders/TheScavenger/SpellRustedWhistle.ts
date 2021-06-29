import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '@src/utils/Keywords'
import CardTribe from '@src/../../shared/src/enums/CardTribe'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'
import CardFeature from '@src/../../shared/src/enums/CardFeature'
import UnitStrayDog from '../../tokens/UnitStrayDog'
import GameEventType from '@src/../../shared/src/enums/GameEventType'

export default class SpellRustedWhistle extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SALVAGE],
			features: [CardFeature.KEYWORD_CREATE],
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
