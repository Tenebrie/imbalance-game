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

export default class UnitOracleApprentice extends ServerCard {
	deckToLook: 'player' | 'opponent' | undefined

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 8
		this.baseTribes = [CardTribe.HUMAN]
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		const builder = PostPlayTargetDefinitionBuilder.base(this.game)
			.multipleTargets(2)

		if (!this.deckToLook) {
			builder
				.require(TargetType.CARD_IN_LIBRARY)
				.validate(TargetType.CARD_IN_LIBRARY, args => args.targetCard.instanceOf(TokenPlayerDeck) || args.targetCard.instanceOf(TokenOpponentDeck))
		} else if (this.deckToLook === 'player') {
			builder
				.require(TargetType.CARD_IN_UNIT_DECK)
				.inPlayersDeck()
				.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.deckPosition === args.targetCard.owner.cardDeck.unitCards.length - 1))
		} else if (this.deckToLook === 'opponent') {
			builder
				.require(TargetType.CARD_IN_UNIT_DECK)
				.inOpponentsDeck()
				.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.deckPosition === args.targetCard.owner.cardDeck.unitCards.length - 1))
		}

		return builder
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
