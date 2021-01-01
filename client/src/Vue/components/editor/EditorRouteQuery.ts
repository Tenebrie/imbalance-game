import Vue from 'vue'
import router from '@/Vue/router'
import { computed } from '@vue/composition-api'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

const routeData = Vue.observable({
	params: {},
	query: {}
})

router.afterEach(route => {
	routeData.params = route.params
	routeData.query = route.query
})

interface Query {
	color: CardColor | null,
	faction: CardFaction | null,
	experimental: boolean,
}

export const useDecksRouteQuery = () => {
	return computed((): Query => ({

		get color(): CardColor | null {
			if (routeData.query['color'] === undefined) {
				return null
			}
			return Number(routeData.query['color'])
		},
		set color(value: CardColor | null) {
			const color = value === null ? undefined : String(value)
			router.push({ query: { ...router.currentRoute.query, color: color }})
		},

		get faction(): CardFaction | null {
			if (routeData.query['faction'] === undefined) {
				return null
			}
			return Number(routeData.query['faction'])
		},
		set faction(value: CardFaction | null) {
			const faction = value === null ? undefined : String(value)
			router.push({ query: { ...router.currentRoute.query, faction: faction }})
		},

		get experimental(): boolean {
			return !!routeData.query['experimental']
		},
		set experimental(value: boolean) {
			router.push({ query: { ...router.currentRoute.query, experimental: value ? 'true' : undefined }})
		}
	}))
}
