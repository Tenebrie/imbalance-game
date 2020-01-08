import Vue from 'vue';
import App from './Vue/App.vue';
import router from './Vue/router';
import store from './Vue/store';
Vue.config.productionTip = false;
new Vue({
    router,
    store: store.original,
    render: h => h(App)
}).$mount('#app');
//# sourceMappingURL=main.js.map