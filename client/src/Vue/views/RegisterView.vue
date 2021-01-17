<template>
	<div class="register">
		<the-register-form />
	</div>
</template>

<script lang="ts">
import TheRegisterForm from '../components/login/TheRegisterForm.vue'
import { defineComponent } from 'vue'

export default defineComponent({
	components: { TheRegisterForm },

	computed: {},
})
</script>
