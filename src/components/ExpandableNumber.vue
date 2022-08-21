<template>
    <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on" v-if="messageKey == null">
                {{ abbreviated }}
            </span>
            <span v-bind="attrs" v-on="on" v-else>
                {{ $tc(messageKey, num, { n: abbreviated }) }}
            </span>
        </template>
        <span v-if="messageKey == null" >{{ full }}</span>
        <span v-else>{{ $tc(messageKey, num, { n: full }) }}</span>
    </v-tooltip>
</template>

<script>
export default {
	name: 'ExpandableNumber',
	props: ['num', 'messageKey'],
	computed: {
		abbreviated () {
			return this.$store.getters['i18n/fmtAbbreviatedNum'](this.num)
		},

		full () {
			return this.$store.getters['i18n/fmtFullNumber'](this.num)
		}
	}
}
</script>
