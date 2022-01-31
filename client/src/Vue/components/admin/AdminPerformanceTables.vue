<template>
	<div class="admin-performance-tables">
		<div>
			<h2>Gaia CPU time</h2>
			<table class="performance-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Sync % time</th>
						<th>Total % time</th>
						<th>Average time</th>
						<th>Total time</th>
						<th>Number of calls</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="entry in performanceData.entries.filter((entry) => !entry.isAsync)" :key="entry.key">
						<td>
							<span class="functionName">{{ entry.key.split(':')[2] }}</span>
							<span class="filename"> @ {{ entry.key.split(':')[0] }}:{{ entry.key.split(':')[3] }}</span>
						</td>
						<td>{{ entry.syncPercentage }}%</td>
						<td>{{ entry.totalPercentage }}%</td>
						<td>{{ Math.round(entry.average * 100) / 100 }}ms</td>
						<td>{{ Math.round(entry.total) }}ms</td>
						<td>
							{{ entry.calls }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div>
			<h2>Gaia Async Time</h2>
			<table class="performance-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Async % time</th>
						<th>Total % time</th>
						<th>Average time</th>
						<th>Total time</th>
						<th>Number of calls</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="entry in performanceData.entries.filter((entry) => entry.isAsync)" :key="entry.key">
						<td>
							<span class="filename">async</span> <span class="functionName">{{ entry.key.split(':')[2] }}</span>
							<span class="filename"> @ {{ entry.key.split(':')[0] }}:{{ entry.key.split(':')[3] }}</span>
						</td>
						<td>{{ entry.asyncPercentage }}%</td>
						<td>{{ entry.totalPercentage }}%</td>
						<td>{{ Math.round(entry.average * 100) / 100 }}ms</td>
						<td>{{ Math.round(entry.total) }}ms</td>
						<td>
							{{ entry.calls }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts">
import moment from 'moment'
import { defineComponent, PropType, ref } from 'vue'

import { PerformanceData } from './AdminPerformanceView.vue'

export default defineComponent({
	props: {
		performanceData: {
			type: Object as PropType<PerformanceData>,
			required: true,
		},
	},

	setup(props) {
		const hasLoaded = ref(false)

		return {
			moment,
			hasLoaded,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

h2 {
	text-align: center;
}

.performance-table {
	width: 100%;
	text-align: left;
	border: none;
	border-collapse: collapse;
	margin-bottom: 64px;
}

.functionName {
	color: lighten($COLOR-SECONDARY, 10);
}

.filename {
	color: darken($COLOR-SECONDARY, 20);
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
