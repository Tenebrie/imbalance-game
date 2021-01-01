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

interface Params {
	gameId: string | null
	playerId: string | null
}

export const useAdminRouteParams = () => {
	return computed((): Params => ({

		get gameId(): string {
			if (routeData.params['gameId'] === undefined) {
				return null
			}
			return routeData.params['gameId']
		},

		get playerId(): string | null {
			if (routeData.params['playerId'] === undefined) {
				return null
			}
			return routeData.params['playerId']
		},
	}))
}
