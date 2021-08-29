<template>
	<div class="register">
		<the-register-form />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TheRegisterForm from '../components/login/TheRegisterForm.vue'

export default defineComponent({
	components: { TheRegisterForm },

	computed: {},
})
</script>
