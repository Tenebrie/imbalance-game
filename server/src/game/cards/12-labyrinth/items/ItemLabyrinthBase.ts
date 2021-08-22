import CardTribe from '@shared/enums/CardTribe'
import CardFeature from '@shared/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffHiddenStrength from '@src/game/buffs/BuffHiddenStrength'
import LeaderStatType from '@shared/enums/LeaderStatType'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import Keywords from '@src/utils/Keywords'

const tierToFeature = (tier: number): CardFeature => {
	switch (tier) {
		case 0:
			return CardFeature.LABYRINTH_ITEM_T0
		case 1:
			return CardFeature.LABYRINTH_ITEM_T1
		case 2:
			return CardFeature.LABYRINTH_ITEM_T2
		case 3:
			return CardFeature.LABYRINTH_ITEM_T3
		case 4:
			return CardFeature.LABYRINTH_ITEM_T4
		default:
			throw new Error(`No tier feature for tier ${tier}`)
	}
}

const propsToFeatures = (props?: LabyrinthPassiveItemProps): CardFeature[] => {
	if (!props) {
		return []
	}
	return [tierToFeature(props.tier)]
}

type LabyrinthPassiveItemProps = {
	slot:
		| CardTribe.LABYRINTH_WEAPON
		| CardTribe.LABYRINTH_ARMOR
		| CardTribe.LABYRINTH_GLOVES
		| CardTribe.LABYRINTH_BOOTS
		| CardTribe.LABYRINTH_TREASURE
	tier: number
	stats?: Partial<Record<LeaderStatType, number>>
}

type LabyrinthActiveItemProps = LabyrinthPassiveItemProps & {
	stats: {
		cost: number
	} & Partial<Record<LeaderStatType, number>>
}

class ItemLabyrinthBase extends ServerCard {
	public addLeaderPower(value: number | (() => number)): void {
		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroupInGame.owns(this) && target === this.ownerPlayerInGame.leader)
			.provide(BuffHiddenStrength, value)
	}

	public addLeaderPowerPerGame(valuePerGame: number): void {
		this.addLeaderPower(() => {
			const state = this.game.progression.labyrinth.state.run
			return valuePerGame * state.encounterHistory.length
		})
	}

	public addBonusUnitPower(value: number | (() => number)): void {
		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroupInGame.owns(this) && target.location === CardLocation.BOARD)
			.provide(BuffHiddenStrength, value)
	}

	public addManaRegen(value: number | (() => number)): void {
		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.HAND])
			.require(({ group }) => group.owns(this))
			.perform(() => Keywords.generateMana(this, value))
	}
}

export class BaseLabyrinthPassiveItem extends ItemLabyrinthBase {
	constructor(game: ServerGame, props?: LabyrinthPassiveItemProps) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: props ? [props.slot] : [],
			features: propsToFeatures(props).concat(CardFeature.PASSIVE),
			stats: {
				cost: 0,
				...props?.stats,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
	}
}

export class BaseLabyrinthActiveItem extends ItemLabyrinthBase {
	constructor(game: ServerGame, props?: LabyrinthActiveItemProps) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: props ? [props.slot] : [],
			features: propsToFeatures(props).concat(CardFeature.HERO_POWER),
			stats: {
				cost: props?.stats.cost || 0,
				...props?.stats,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
	}
}

export class BaseLabyrinthArtifactItem extends ItemLabyrinthBase {
	constructor(game: ServerGame, props?: LabyrinthActiveItemProps) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: props ? [props.slot] : [],
			features: propsToFeatures(props).concat(CardFeature.HERO_ARTIFACT),
			stats: {
				cost: props?.stats.cost || 0,
				...props?.stats,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
	}
}
