<template>
	<div class="build-footer" v-if="isLoaded">
		<span>State of Imbalance {{ version }} (Build {{ timestamp }})</span>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import moment from 'moment'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
	setup() {
		const isLoaded = ref<boolean>(false)
		const version = ref<string>('')
		const timestamp = ref<string>('')

		onMounted(async () => {
			const response = await axios.get('/api/version')
			const responseData = response.data as { version: string; timestamp: string }

			version.value = responseData.version
			timestamp.value = moment(parseInt(responseData.timestamp)).format('yyyy.MM.DD HH:mm:ss')
			isLoaded.value = true
		})

		return {
			isLoaded,
			version,
			timestamp,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.build-footer {
	right: 0;
	bottom: 0;
	width: 100vw;
	height: 100vh;
	position: absolute;
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	font-family: monospace, monospace;
	pointer-events: none;

	& > span {
		color: gray;
		padding: 4px;
		pointer-events: all;
	}
}
</style>
