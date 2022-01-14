<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <slot /> {{ timeAgo }}
      </span>
    </template>
    <span>{{ formattedDate }}</span>
  </v-tooltip>
</template>

<script>
export default {
	name: 'ExpandableDate',
	props: ['date'],
	computed: {
		timeAgo () {
			return this.$store.getters['i18n/fmtRelative'](this.date)
		},

		formattedDate () {
			return this.$store.getters['i18n/fmtDateTime'](this.date)
		}
	}
}
</script>
