import { debounce } from 'throttle-debounce'
import { Ref, ref } from 'vue'

import { useAdminRouteQuery } from '../../editor/AdminRouteParams'

type ReturnValue = {
	scrollerRef: Ref
	onScroll: (e: Event) => void
	restoreScrollState: () => void
}

const usePreserveTableScrollState = (): ReturnValue => {
	const scrollerRef = ref<HTMLDivElement | null>(null)
	const routeQuery = useAdminRouteQuery()

	const onScroll = (e: Event) => {
		const target = e.target as HTMLDivElement
		saveScrollValueDebounced(target.scrollTop)
	}
	const saveScrollValueDebounced = debounce(100, (value: number) => {
		routeQuery.value.scroll = value
	})

	const restoreScrollState = () => {
		requestAnimationFrame(() => {
			const scroller = scrollerRef.value
			const targetValue = routeQuery.value.scroll
			if (targetValue > 0 && scroller) {
				scroller.scrollTo({
					top: targetValue,
				})
			}
		})
	}

	return {
		onScroll,
		scrollerRef,
		restoreScrollState,
	}
}

export default usePreserveTableScrollState
