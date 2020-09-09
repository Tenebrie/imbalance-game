import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import TargetType from '@shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TokenPlayerDeck from '../tokens/TokenPlayerDeck'
import TokenOpponentDeck from '../tokens/TokenOpponentDeck'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitOracleApprentice extends ServerCard {
	deckToLook: 'player' | 'opponent' | undefined

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployEffectTargets()
			.totalTargets(2)
			.target(TargetType.CARD_IN_LIBRARY)
			.require(TargetType.CARD_IN_LIBRARY, () => this.deckToLook === undefined)
			.require(TargetType.CARD_IN_LIBRARY, args => args.targetCard.instanceOf(TokenPlayerDeck) || args.targetCard.instanceOf(TokenOpponentDeck))

		this.createDeployEffectTargets()
			.totalTargets(2)
			.target(TargetType.CARD_IN_UNIT_DECK)
			.requireCardInPlayersDeck()
			.require(TargetType.CARD_IN_LIBRARY, () => this.deckToLook === 'player')
			.require(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.deckPosition === args.targetCard.owner.cardDeck.unitCards.length - 1))

		this.createDeployEffectTargets()
			.totalTargets(2)
			.target(TargetType.CARD_IN_UNIT_DECK)
			.requireCardInOpponentsDeck()
			.require(TargetType.CARD_IN_LIBRARY, () => this.deckToLook === 'opponent')
			.require(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.deckPosition === args.targetCard.owner.cardDeck.unitCards.length - 1))

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	private onTargetSelected(target: ServerCard): void {
		if (target.instanceOf(TokenPlayerDeck)) {
			this.deckToLook = 'player'
		} else if (target.instanceOf(TokenOpponentDeck)) {
			this.deckToLook = 'opponent'
		}
	}

	private onTargetsConfirmed(): void {
		this.deckToLook = undefined
	}
}
