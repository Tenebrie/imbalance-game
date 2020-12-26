import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import CardLibrary from '../../../libraries/CardLibrary'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitMasterOfMirrors extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
			sortPriority: 0,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => !this.ownerInGame.cardDeck.hasDuplicates)
			.perform(() => {
				this.ownerInGame.cardDeck.unitCards.slice().forEach((card) => {
					const copy = CardLibrary.instantiateByInstance(this.game, card)
					this.ownerInGame.cardDeck.addUnitToBottom(copy)
				})
				this.ownerInGame.cardDeck.shuffle()
			})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => this.ownerInGame.cardDeck.hasDuplicates)
			.perform(() => {
				this.ownerInGame.cardDeck.shuffle()
			})
	}
}
