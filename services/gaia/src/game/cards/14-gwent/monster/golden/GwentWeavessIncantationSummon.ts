import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentWeavessIncantation from './GwentWeavessIncantation'

export default class GwentWeavessIncantationSummon extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			boost: GwentWeavessIncantationSummon.BOOST,
		}
		this.addRelatedCards().requireTribe(CardTribe.RELICT).requireCollectible().requireAnyColor([CardColor.BRONZE, CardColor.SILVER])

		this.createLocalization({
			en: {
				name: 'Summoning Incantation',
				description: 'Play a Bronze or Silver Relict from your deck and *Strengthen* it by {boost}.',
				flavor: 'Oh, and for you, little one, I have special plans...',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE || targetCard.color === CardColor.SILVER)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.RELICT))
			.perform(({ targetCard, player }) => {
				const weavess = game.board.getUnitsOwnedByPlayer(player).find((unit) => unit.card instanceof GwentWeavessIncantation)?.card
				Keywords.playCardFromDeck(targetCard)
				targetCard.buffs.addMultiple(BuffBaseStrength, GwentWeavessIncantationSummon.BOOST, weavess || this)
			})
	}
}
