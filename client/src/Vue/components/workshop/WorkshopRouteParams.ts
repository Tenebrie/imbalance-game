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
	from: string
}

export const useWorkshopRouteQuery = (): ComputedRef<Query> => {
	return computed(
		(): Query => ({
			get from(): string {
				return routeData.value.query['from'] || ''
			},
		})
	)
}
