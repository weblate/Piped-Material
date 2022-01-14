<template>
    <div :class="$vuetify.breakpoint.mdAndUp ? 'grid' : 'grid-mobile'">
        <slot />
    </div>
</template>

<script>
// A customized grid row container, to be used with GridCol
export default {
	name: 'GridRow'
}
</script>

<style scoped>
/* A 60-point grid generated for this page and this page only */
/* Why, one might ask, when you have the Vuetify grid? */
/* The reason being that Vuetify grid is 12-point, therefore 5 column layouts don't work */
.grid {
    display: grid;
    grid-template-columns: repeat(60, 1fr);
    grid-gap: 16px;
}

.grid-mobile * {
    margin-bottom: 8px;
}

.grid-col {
    max-width: 100%;
}
.grid-col-12{grid-column: span 12 / auto;}
.grid-col-15{grid-column: span 15 / auto;}
.grid-col-10{grid-column: span 10 / auto;}
</style>
