import router from '@/Vue/router'
import { computed, ComputedRef, ref } from 'vue'

const routeData = ref({
	params: {},
	query: {},
})

router.afterEach((route) => {
	routeData.value.params = route.params
	routeData.value.query = route.query
})

interface Params {
	gameId: string | null
	playerId: string | null
}

export const useAdminRouteParams = (): ComputedRef => {
	return computed(
		(): Params => ({
			get gameId(): string {
				if (routeData.value.params['gameId'] === undefined) {
					return null
				}
				return routeData.value.params['gameId']
			},

			get playerId(): string | null {
				if (routeData.value.params['playerId'] === undefined) {
					return null
				}
				return routeData.value.params['playerId']
			},
		})
	)
}
