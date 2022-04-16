import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentIceGiant extends ServerCard {
	public static readonly BONUS_POWER = 6

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			bonusPower: GwentIceGiant.BONUS_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Ancient Foglet',
				description: 'Boost by {bonusPower} if *Biting Frost* is anywhere on the board.',
				flavor: "Fled one time in my life. From the Ice Giant. And I'm not a bit ashamed.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => game.board.rows.some((row) => row.buffs.has(BuffGwentRowFrost)))
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentIceGiant.BONUS_POWER, this)
			})
	}
}
