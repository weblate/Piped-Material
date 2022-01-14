<template>
  <v-container fluid>
    <h1 class="text-h4 text-center">{{ $t('titles.preferences') }}</h1>
    <v-divider class="ma-4" />
    <div v-for="(opt, optId) in options" :key="optId">
      <v-checkbox
        v-if="opt.type === 'bool'"
        dense
        :label="$t('preferences.' + opt.id)"
        :input-value="$store.getters['prefs/getPreferenceBoolean'](opt.id, opt.default)"
        @change="setValue(opt.id, $event)"
      />
      <v-text-field
        v-else-if="opt.type === 'number'"
        type="number"
        :label="$t('preferences.' + opt.id)"
        :value="$store.getters['prefs/getPreferenceNumber'](opt.id, opt.default)"
        @input="setValue(opt.id, Number($event))"
      />
      <v-select
        v-else-if="opt.type === 'select'"
        :label="$t('preferences.' + opt.id)"
        :value="$store.getters['prefs/getPreference'](opt.id, opt.default)"
        :attach="opt.multi"
        :chips="opt.multi"
        :multiple="opt.multi"
        @input="setValue(opt.id, $event)" :items="opt.options"
      />
    </div>
    <h5 class="text-h5">{{ $t('actions.instances_list') }}</h5>
    <v-data-table :headers="tableHeaders" :items="instances" />
  </v-container>
</template>

<script>
import Countries from 'i18n-iso-countries'
import EnglishNames from 'i18n-iso-countries/langs/en.json'
Countries.registerLocale(EnglishNames)

export default {
	data () {
		return {
			instances: [],

			options: [
				{
					id: 'playerAutoplay',
					type: 'bool',
					default: true
				},
				{
					id: 'listen',
					type: 'bool',
					default: false
				},
				{
					id: 'disableLBRY',
					type: 'bool',
					default: true
				},
				{
					id: 'proxyLBRY',
					type: 'bool',
					default: true
				},
				{
					id: 'skipToLastPoint',
					type: 'bool',
					default: true
				},
				{
					id: 'homepage',
					type: 'select',
					label: 'Default Homepage',
					default: 'trending',
					options: [
						{
							text: 'Trending',
							value: 'trending'
						},
						{
							text: 'Feed',
							value: 'feed'
						}
					]
				},
				{
					id: 'feedColumns',
					type: 'select',
					label: 'Amount of Columns on Feed Pages',
					default: 4,
					options: [
						{
							text: '4 columns',
							value: 4
						},
						{
							text: '5 columns',
							value: 5
						},
						{
							text: '6 columns',
							value: 6
						}
					]
				},
				{
					id: 'quality',
					type: 'select',
					default: 0,
					options: [
						{
							text: 'Auto',
							value: 0
						},
						...([144, 240, 360, 480, 720, 1080, 1440, 2160, 4320].map(i => ({
							text: i.toString() + 'p',
							value: i
						})))
					]
				},
				{
					id: 'bufferGoal',
					type: 'number',
					default: 10
				},
				{
					id: 'sponsorblock',
					type: 'bool',
					default: true
				},
				{
					id: 'selectedSkip',
					type: 'select',
					label: 'Selected Segments to Skip',
					multi: true,
					options: [
						{ text: 'Sponsor Segments ', value: 'sponsors' },
						{ text: 'Intermission/Intro Animation Segments', value: 'intro' },
						{ text: 'Endcards/Credits Segments', value: 'outro' },
						{ text: 'Preview/Recap Segments', value: 'preview' },
						{ text: 'Interaction Reminder (Subscribe) Segments', value: 'interaction' },
						{ text: 'Unpaid/Self Promotion Segments', value: 'selfpromo' },
						{ text: 'Music: Non-Music Segments', value: 'music_offtopic' }
					]
				},
				{
					id: 'region',
					type: 'select',
					label: 'Country',
					default: 'US',
					options: Object.entries(Countries.getNames('en', { select: 'official' })).map(([code, name]) => ({
						text: name,
						value: code
					}))
				}
			],
			tableHeaders: [
				{
					text: 'Name',
					value: 'name'
				},
				{
					text: 'API URL',
					value: 'apiurl'
				},
				{
					text: 'Locations',
					value: 'locations'
				},
				{
					text: 'CDN enabled?',
					value: 'cdn'
				}
			]
		}
	},
	metaInfo () {
		return {
			title: this.$t('titles.preferences')
		}
	},

	mounted () {
		if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} })

		fetch('https://raw.githubusercontent.com/wiki/TeamPiped/Piped-Frontend/Instances.md')
			.then(resp => resp.text())
			.then(body => {
				let skipped = 0
				const lines = body.split('\n')
				lines.forEach(line => {
					const split = line.split('|')
					if (split.length === 5) {
						if (skipped < 2) {
							skipped++
							return
						}
						this.instances.push({
							name: split[0].trim(),
							apiurl: split[1].trim(),
							locations: split[2].trim(),
							cdn: split[3].trim()
						})
					}
				})
				this.options.push({
					id: 'instance',
					type: 'select',
					default: this.$store.getters['prefs/apiUrl'],
					label: 'Instance',
					options: this.instances.map(i => ({
						text: i.name,
						value: i.apiurl
					}))
				})
			})
	},
	methods: {
		setValue (k, v) {
			this.$store.commit('prefs/setPrefs', {
				id: k,
				value: v
			})
		},

		sslScore (url) {
			return 'https://www.ssllabs.com/ssltest/analyze.html?d=' + new URL(url).host + '&latest'
		}
	}
}
</script>
