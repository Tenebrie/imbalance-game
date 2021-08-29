<template>
	<div class="login">
		<the-login-form />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TheLoginForm from '../components/login/TheLoginForm.vue'

export default defineComponent({
	components: { TheLoginForm },

	computed: {},
})
</script>
