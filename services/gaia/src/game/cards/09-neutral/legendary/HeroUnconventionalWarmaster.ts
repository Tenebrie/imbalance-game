import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitBoxOfCats from '@src/game/cards/09-neutral/tokens/UnitBoxOfCats'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class HeroUnconventionalWarmaster extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.NOBLE],
			stats: {
				power: 24,
			},
			relatedCards: [UnitBoxOfCats],
			expansionSet: ExpansionSet.BASE,
			generatedArtworkMagicString: '2',
		})

		this.createLocalization({
			en: {
				name: "Fel'Corra",
				title: 'Unconventional Warmaster',
				description: '*Deploy:*\n*Summon* a *Box of Cats* on every enemy row.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			game.board.getControlledRows(this.ownerGroup.opponent).forEach((row) => {
				game.animation.thread(() =>
					Keywords.summonUnit({
						owner: row.owner!.players[0],
						cardConstructor: UnitBoxOfCats,
						rowIndex: row.index,
						unitIndex: row.cards.length,
					})
				)
			})
			game.animation.syncAnimationThreads()
		})
	}
}
