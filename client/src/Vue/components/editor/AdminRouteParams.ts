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

interface Params {
	cardId: string | null
	gameId: string | null
	playerId: string | null
}

export const useAdminRouteParams = (): ComputedRef<Params> => {
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

interface Query {
	scroll: number
}

export const useAdminRouteQuery = (): ComputedRef<Query> => {
	return computed(
		(): Query => ({
			get scroll(): number {
				if (routeData.value.query['scroll'] === undefined) {
					console.log('no')
					return 0
				}
				try {
					return Number(routeData.value.query['scroll'])
				} catch (err) {
					console.log('nope')
					return 0
				}
			},

			set scroll(value: number) {
				const scroll = Math.round(value).toString()
				router.push({ query: { ...router.currentRoute.value.query, scroll: scroll } })
			},
		})
	)
}
