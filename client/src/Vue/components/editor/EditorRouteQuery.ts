import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import { computed, ComputedRef, ref } from 'vue'

import router from '@/Vue/router'

const routeData = ref({
	params: {} as Record<string, string>,
	query: {} as Record<string, string>,
})

router.afterEach((route) => {
	routeData.value.params = route.params as Record<string, string>
	routeData.value.query = route.query as Record<string, string>
})

interface Query {
	color: CardColor[] | null
	faction: CardFaction[] | null
	community: boolean
	experimental: boolean
	searchQuery: string

	toggleColor(color: CardColor | null): void
	toggleFaction(faction: CardFaction | null): void
	toggleExactColor(color: CardColor): void
	toggleExactFaction(faction: CardFaction): void
}

export const useDecksRouteQuery = (): ComputedRef<Query> => {
	const query = computed(
		(): Query => ({
			get color(): CardColor[] | null {
				if (routeData.value.query['color'] === undefined) {
					return null
				}

				return routeData.value.query['color'].split(',').map((c: string) => Number(c))
			},
			set color(value: CardColor[] | null) {
				const color = value === null ? undefined : value.join(',')
				router.push({ query: { ...router.currentRoute.value.query, color: color } })
			},

			get faction(): CardFaction[] | null {
				if (routeData.value.query['faction'] === undefined) {
					return null
				}
				return routeData.value.query['faction'].split(',').map((f: string) => Number(f))
			},
			set faction(value: CardFaction[] | null) {
				const faction = value === null ? undefined : value.join(',')
				router.push({ query: { ...router.currentRoute.value.query, faction: faction } })
			},

			get community(): boolean {
				return !!routeData.value.query['community']
			},
			set community(value: boolean) {
				router.push({ query: { ...router.currentRoute.value.query, community: value ? 'true' : undefined } })
			},

			get experimental(): boolean {
				return !!routeData.value.query['experimental']
			},
			set experimental(value: boolean) {
				router.push({ query: { ...router.currentRoute.value.query, experimental: value ? 'true' : undefined } })
			},

			get searchQuery(): string {
				return routeData.value.query['q'] || ''
			},
			set searchQuery(value: string) {
				router.push({ query: { ...router.currentRoute.value.query, q: value?.length > 0 ? value : undefined } })
			},

			toggleColor(color: CardColor | null) {
				const selectedColor = query.value.color

				if (color === null) {
					query.value.color = null
				} else if (selectedColor !== null) {
					if (selectedColor.includes(color)) {
						if (selectedColor.length === 1) {
							query.value.color = null
						} else {
							query.value.color = selectedColor.filter((c) => c !== color)
						}
					} else {
						query.value.color = selectedColor.concat(color)
					}
				} else {
					query.value.color = [color]
				}
			},

			toggleExactColor(color: CardColor) {
				const selectedColor = query.value.color
				if (selectedColor?.includes(color)) {
					query.value.color = null
					if (selectedColor?.length >= 2) {
						query.value.color = [color]
					} else {
						query.value.color = null
					}
				} else {
					query.value.color = [color]
				}
			},

			toggleFaction(faction: CardFaction | null) {
				const selectedFaction = query.value.faction

				if (faction === null) {
					query.value.faction = null
				} else if (selectedFaction !== null) {
					if (selectedFaction.includes(faction)) {
						if (selectedFaction.length === 1) {
							query.value.faction = null
						} else {
							query.value.faction = selectedFaction.filter((f) => f !== faction)
						}
					} else {
						query.value.faction = selectedFaction.concat(faction)
					}
				} else {
					query.value.faction = [faction]
				}
			},

			toggleExactFaction(faction: CardFaction) {
				const selectedFaction = query.value.faction
				if (selectedFaction?.includes(faction)) {
					if (selectedFaction?.length >= 2) {
						query.value.faction = [faction]
					} else {
						query.value.faction = null
					}
				} else {
					query.value.faction = [faction]
				}
			},
		})
	)
	return query
}
