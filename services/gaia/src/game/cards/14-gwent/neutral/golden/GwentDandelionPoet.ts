import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentDandelionPoet extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SUPPORT],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Dandelion: Poet`,
				description: `Draw a card, then play a card.`,
				flavor: `The quill is mightier than the sword.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			Keywords.draw.topUnitCard(owner)
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND).perform(({ targetCard }) => Keywords.playCardFromHand(targetCard))
	}
}
