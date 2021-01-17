import router from '@/Vue/router'
import { computed, ComputedRef, ref } from 'vue'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

const routeData = ref({
	params: {},
	query: {},
})

router.afterEach((route) => {
	routeData.value.params = route.params
	routeData.value.query = route.query
})

interface Query {
	color: CardColor | null
	faction: CardFaction | null
	experimental: boolean
}

export const useDecksRouteQuery = (): ComputedRef => {
	return computed(
		(): Query => ({
			get color(): CardColor | null {
				if (routeData.value.query['color'] === undefined) {
					return null
				}
				return Number(routeData.value.query['color'])
			},
			set color(value: CardColor | null) {
				const color = value === null ? undefined : String(value)
				router.push({ query: { ...router.currentRoute.value.query, color: color } })
			},

			get faction(): CardFaction | null {
				if (routeData.value.query['faction'] === undefined) {
					return null
				}
				return Number(routeData.value.query['faction'])
			},
			set faction(value: CardFaction | null) {
				const faction = value === null ? undefined : String(value)
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
