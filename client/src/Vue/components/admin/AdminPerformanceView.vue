<template>
	<div class="admin-performance-view" v-if="hasLoaded" :onscroll="onScroll" ref="scrollerRef">
		<admin-performance-tables :performance-data="performanceData" />
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent, onMounted, ref } from 'vue'

import AdminPerformanceTables from '@/Vue/components/admin/AdminPerformanceTables.vue'

import usePreserveTableScrollState from './utils/usePreserveTableScrollState'

export type PerformanceData = { totalTime: number; entries: PerformanceData[] }

export type FunctionPerformanceEntry = {
	calls: number
	total: number
	average: number
	syncPercentage: number
	asyncPercentage: number
	totalPercentage: number
	isAsync: boolean
}

export default defineComponent({
	components: { AdminPerformanceTables },

	setup() {
		const hasLoaded = ref(false)
		const performanceData = ref<PerformanceData>({
			totalTime: 0,
			entries: [],
		})
		const { onScroll, scrollerRef, restoreScrollState } = usePreserveTableScrollState()

		const loadData = async () => {
			const response = await axios.get('/api/admin/performance')
			performanceData.value = response.data as PerformanceData
			hasLoaded.value = true
			restoreScrollState()
		}

		onMounted(() => {
			loadData()
			setInterval(() => {
				loadData()
			}, 5000)
		})

		return {
			hasLoaded,
			performanceData,
			onScroll,
			scrollerRef,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.admin-performance-view {
	overflow-y: scroll;
}

.games-table {
	width: 100%;
	text-align: left;
	border: none;
	border-collapse: collapse;
	margin-bottom: 64px;
}

tr {
	border: none;
}
thead > tr {
	background-color: rgba(black, 0.5);
}
tr:nth-child(even) {
	background-color: rgba(white, 0.05);
}

td,
th {
	padding: 12px 24px;
}

.user-input {
	vertical-align: bottom;
	display: inline-block;
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 180px;
	white-space: nowrap;
}

.action-link {
	cursor: pointer;
	user-select: none;
}

.no-errors {
	color: lightgreen;
}
.has-errors {
	color: lighten(red, 15);
}
.clickable-issues {
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
}

select {
	padding: 2px 4px;
}
</style>
