import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentAlzursThunder extends ServerCard {
	public static readonly DAMAGE = 9

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SPELL],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentAlzursThunder.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: "Alzur's Thunder",
				description: 'Deal {damage} damage.',
				flavor:
					"We stand not the slightest chance of incanting a spell so complex as Alzur's Thunder. It is claimed Alzur had a voice like a hunting horn and the diction of a master orator.",
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			targetUnit.dealDamage(DamageInstance.fromCard(GwentAlzursThunder.DAMAGE, this))
		})
	}
}
