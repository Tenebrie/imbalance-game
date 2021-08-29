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
	color: Array<CardColor> | null
	faction: Array<CardFaction> | null
	experimental: boolean
}

export const useDecksRouteQuery = (): ComputedRef => {
	return computed(
		(): Query => ({
			get color(): Array<CardColor> | null {
				if (routeData.value.query['color'] === undefined) {
					return null
				}

				return routeData.value.query['color'].split(',').map((c: string) => Number(c))
			},
			set color(value: Array<CardColor> | null) {
				const color = value === null ? undefined : value.join(',')
				router.push({ query: { ...router.currentRoute.value.query, color: color } })
			},

			get faction(): Array<CardFaction> | null {
				if (routeData.value.query['faction'] === undefined) {
					return null
				}
				return routeData.value.query['faction'].split(',').map((f: string) => Number(f))
			},
			set faction(value: Array<CardFaction> | null) {
				const faction = value === null ? undefined : value.join(',')
				router.push({ query: { ...router.currentRoute.value.query, faction: faction } })
			},

			get experimental(): boolean {
				return !!routeData.value.query['experimental']
			},
			set experimental(value: boolean) {
				router.push({ query: { ...router.currentRoute.value.query, experimental: value ? 'true' : undefined } })
			},
		})
	)
}
