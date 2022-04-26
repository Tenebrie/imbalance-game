import Constants from '@shared/Constants'
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
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

export default class GwentGarrison extends ServerCard {
	public static readonly BOOST = 2

	private validCardClasses: string[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			tribes: [CardTribe.TACTIC],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Garrison',
				description: `*Create* a Bronze or Silver unit from your opponent's starting deck and boost it by ${GwentGarrison.BOOST}.`,
				flavor: 'Knock, knock… anybody home?',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const enemyStartingDecks = owner.opponent.players
				.flatMap((player) => player.startingDeck.unitCards)
				.filter((card) => card.color === CardColor.BRONZE || card.color === CardColor.SILVER)
				.map((card) => card.class)
			this.validCardClasses = getMultipleRandomArrayValues(enemyStartingDecks, Constants.CREATE_KEYWORD_CARD_COUNT)
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.validCardClasses.includes(targetCard.class))
			.perform(({ targetCard, player }) => {
				Keywords.createCard
					.for(player)
					.with((card) => {
						card.boostBy(GwentGarrison.BOOST, this)
					})
					.fromInstance(targetCard)
			})
	}
}
