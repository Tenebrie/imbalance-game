import router from '@/Vue/router'
import { computed, ComputedRef, ref } from 'vue'

const routeData = ref({
	params: {} as Record<string, string>,
	query: {} as Record<string, string>,
})

router.afterEach((route) => {
	routeData.value.params = route.params as Record<string, string>
	routeData.value.query = route.query as Record<string, string>
})

interface Params {
	cardId: string | null
	gameId: string | null
	playerId: string | null
}

export const useAdminRouteParams = (): ComputedRef => {
	return computed(
		(): Params => ({
			get cardId(): string | null {
				if (routeData.value.params['cardId'] === undefined) {
					return null
				}
				return routeData.value.params['cardId']
			},

			get gameId(): string | null {
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
