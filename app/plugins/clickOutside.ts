export default defineNuxtPlugin((nuxtApp) => {
    // Register a simple directive
    nuxtApp.vueApp.directive('click-outside', {
        mounted(el, binding) {
            el._clickOutsideHandler = (e: any) => {
                if (!el.contains(e.target)) binding.value(e);
            };
            document.addEventListener('pointerdown', el._clickOutsideHandler);
        },
        beforeUnmount(el) {
            document.removeEventListener('pointerdown', el._clickOutsideHandler);
        }
    });
})