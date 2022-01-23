import CardTribe from '@shared/enums/CardTribe'
import BuffRowBurning from '@src/game/buffs/BuffRowBurning'
import { BaseRitesActiveItem } from '@src/game/cards/12-rites/items/ItemRitesBase'
import ServerGame from '@src/game/models/ServerGame'
import { asDirectSpellDamage, asSplashSpellDamage } from '@src/utils/LeaderStats'

export class LabyrinthItemRustedSword extends BaseRitesActiveItem {
	damage = asDirectSpellDamage(1)

	constructor(game: ServerGame) {
		super(game, {
			tier: 0,
			slot: CardTribe.RITES_WEAPON,
			stats: {
				cost: 1,
			},
			upgrades: [LabyrinthItemSteelSword],
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}
		this.createLocalization({
			en: {
				name: 'Rusted Sword',
				description: 'Deal {damage} Damage to an enemy unit.',
			},
		})

		this.addSingleTargetDamage(this.damage)
	}
}

export class LabyrinthItemSteelSword extends BaseRitesActiveItem {
	damage = asDirectSpellDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.RITES_WEAPON,
			stats: {
				cost: 1,
			},
			upgrades: [LabyrinthItemObsidianSword, LabyrinthItemFlamingSword],
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}
		this.createLocalization({
			en: {
				name: 'Steel Sword',
				description: 'Deal {damage} Damage to an enemy unit.',
			},
		})

		this.addSingleTargetDamage(this.damage)
	}
}

export class LabyrinthItemObsidianSword extends BaseRitesActiveItem {
	damage = asDirectSpellDamage(5)

	constructor(game: ServerGame) {
		super(game, {
			tier: 2,
			slot: CardTribe.RITES_WEAPON,
			stats: {
				cost: 1,
			},
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}
		this.createLocalization({
			en: {
				name: 'Obsidian Sword',
				description: 'Deal {damage} Damage to an enemy unit.',
			},
		})

		this.addSingleTargetDamage(this.damage)
	}
}

export class LabyrinthItemFlamingSword extends BaseRitesActiveItem {
	damage = asDirectSpellDamage(3)
	splashDamage = asSplashSpellDamage(1)

	constructor(game: ServerGame) {
		super(game, {
			tier: 2,
			slot: CardTribe.RITES_WEAPON,
			stats: {
				cost: 1,
			},
			upgrades: [LabyrinthItemDragonsteelSword],
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}
		this.createLocalization({
			en: {
				name: 'Flaming Sword',
				description: 'Deal {damage} Damage to an enemy unit.\nDeal {splashDamage} Damage to adjacent units.',
			},
		})

		this.addSingleTargetDamageWithSplash(this.damage, this.splashDamage)
	}
}

export class LabyrinthItemDragonsteelSword extends BaseRitesActiveItem {
	damage = asDirectSpellDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			tier: 2,
			slot: CardTribe.RITES_WEAPON,
			stats: {
				cost: 1,
			},
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}
		this.createLocalization({
			en: {
				name: 'Flaming Sword',
				description: 'Deal {damage} Damage to an enemy unit.\nApply *Burning* to the target row.',
			},
		})

		this.addSingleTargetDamageWithEffect(this.damage, BuffRowBurning)
	}
}
