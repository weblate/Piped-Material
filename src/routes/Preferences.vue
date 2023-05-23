<template>
    <v-container style="max-width: 1080px">
        <h1 class="text-h4 text-center">{{ $t('titles.preferences') }}</h1>
        <v-divider class="ma-4"/>
        <v-select
            :label="$t('preferences.colorScheme')"
            :value="$store.state.prefs.colorScheme"
            @input="$store.commit('prefs/setColorScheme', { colorScheme: $event })"
            :items="colorSchemeOptions"
        />
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
                    :items="opt.options"
                    @input="setValue(opt.id, $event)"
            />
        </div>
        <h5 class="text-h5">{{ $t('actions.instances_list') }}</h5>
        <v-data-table :headers="tableHeaders" :items="instances" :items-per-page="-1">
			<!-- eslint-disable-next-line vue/valid-v-slot -->
			<template v-slot:item.registered="{ item }">
				{{ $store.getters['i18n/fmtFullNumber'](item.registered) }}
			</template>
        </v-data-table>
    </v-container>
</template>

<script>
import { COUNTRY_I18N_EXCEPTIONS } from '@/plugins/i18n'
import { COLOR_SCHEME_STATES } from '@/store/prefs-store'

export default {
	data () {
		return {
			instances: [],
			instanceOption: null,
			countryOptions: null,
			tableHeaders: [
				{
					text: 'Name',
					value: 'name'
				},
				{
					text: 'API URL',
					value: 'api_url'
				},
				{
					text: 'Locations',
					value: 'locations'
				},
				{
					text: 'CDN enabled?',
					value: 'cdn'
				},
				{
					text: 'Registered users',
					value: 'registered'
				}
			]
		}
	},
	metaInfo () {
		return {
			title: this.$t('titles.preferences')
		}
	},
	watch: {
		'$i18n.locale': 'getCountries'
	},
	computed: {
		colorSchemeOptions () {
			return [
				{ text: this.$t('actions.auto'), value: COLOR_SCHEME_STATES.SYSTEM },
				{ text: this.$t('actions.light'), value: COLOR_SCHEME_STATES.LIGHT },
				{ text: this.$t('actions.dark'), value: COLOR_SCHEME_STATES.DARK }
			]
		},
		options () {
			const opts = [
				{
					id: 'playerAutoplay',
					type: 'bool',
					default: true
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
					id: 'clickbaitThumbnailAvoidance',
					type: 'bool',
					default: false
				},
				{
					id: 'homepageButton',
					type: 'bool',
					default: false
				},
				{
					id: 'homepage',
					type: 'select',
					label: 'Default Homepage',
					default: 'trending',
					options: [
						{
							text: this.$i18n.t('titles.trending'),
							value: 'trending'
						},
						{
							text: this.$i18n.t('titles.feed'),
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
							text: this.$i18n.t('preferences.column_opts.4'),
							value: 4
						},
						{
							text: this.$i18n.t('preferences.column_opts.5'),
							value: 5
						},
						{
							text: this.$i18n.t('preferences.column_opts.6'),
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
							text: this.$i18n.t('preferences.quality_opts.auto'),
							value: 0
						},
						...([144, 240, 360, 480, 720, 1080, 1440, 2160, 4320].map(i => ({
							text: this.$i18n.t('preferences.quality_opts.' + i.toString() + 'p'),
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
					id: 'disableCommentsByDefault',
					type: 'bool',
					default: false
				},
				{
					id: 'showRelatedVideos',
					type: 'bool',
					default: true
				},
				{
					id: 'showMarkers',
					type: 'bool',
					default: true
				},
				{
					id: 'disableDuplicateHistoryEntries',
					type: 'bool',
					default: false
				},
				{
					id: 'selectedSkip',
					type: 'select',
					label: 'Selected Segments to Skip',
					multi: true,
					options: [
						{
							text: 'actions.skip_sponsors',
							value: 'sponsor'
						},
						{
							text: 'actions.skip_intro',
							value: 'intro'
						},
						{
							text: 'actions.skip_outro',
							value: 'outro'
						},
						{
							text: 'actions.skip_preview',
							value: 'preview'
						},
						{
							text: 'actions.skip_interaction',
							value: 'interaction'
						},
						{
							text: 'actions.skip_self_promo',
							value: 'selfpromo'
						},
						{
							text: 'actions.skip_non_music',
							value: 'music_offtopic'
						},
						{
							text: 'actions.skip_poi_highlights',
							value: 'poi_highlight'
						},
						{
							text: 'actions.skip_filler',
							value: 'filler'
						}
					].map(o => {
						o.text = this.$i18n.t(o.text)
						return o
					})
				}
			]

			if (this.countryOptions != null) {
				opts.push(this.countryOptions)
			}
			if (this.instanceOption != null) {
				opts.push(this.instanceOption)
			}

			return opts
		}
	},
	mounted () {
		if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} })
		Promise.all([
			this.getInstances(),
			this.getCountries()
		])
	},
	methods: {
		async getCountries () {
			const locale = COUNTRY_I18N_EXCEPTIONS[this.$i18n.locale] || this.$i18n.locale
			const [Countries, LocalizedNames] = await Promise.all([
				import('i18n-iso-countries'),
				import(/* webpackChunkName: "countries-[request]" */ `i18n-iso-countries/langs/${locale}.json`)
			])
			Countries.registerLocale(LocalizedNames)
			this.countryOptions = {
				id: 'region',
				type: 'select',
				label: 'Country',
				default: 'US',
				options: Object.entries(Countries.getNames(locale, { select: 'official' }))
					.sort((a, b) => this.$store.getters['i18n/compare'](a[1], b[1]))
					.map(([code, name]) => ({
						text: name,
						value: code
					}))
			}
		},

		async getInstances () {
			const resp = await fetch(process.env.VUE_APP_PIPED_INSTANCES_API ?? 'https://piped-instances.kavin.rocks/', {
				referrerPolicy: 'no-referrer'
			}).then(resp => resp.json())

			const instances = resp.map((v) => {
				try {
					v._locations = v.locations.split(',')
				} catch (e) {
					v._locations = []
					console.error('Error while parsing locations:', v.locations)
				}
				v._cdn = v.cdn
				v.cdn = v._cdn === true ? '✔️' : '❌'
				return v
			})

			if (process.env.VUE_APP_PIPED_URL && !instances.includes(process.env.VUE_APP_PIPED_URL)) {
				const u = new URL(process.env.VUE_APP_PIPED_URL)

				instances.push({
					name: u.hostname,
					api_url: process.env.VUE_APP_PIPED_URL,
					locations: '???',
					_locations: [],
					registered: -1,
					cdn: '???',
					_cdn: false
				})
			}

			instances.sort((a, b) => this.$store.getters['i18n/compare'](a.name, b.name))
			instances.sort((a, b) => b.registered - a.registered)
			instances.sort((a, b) => ((a._cdn === b._cdn) ? 0 : a._cdn ? 1 : -1))
			instances.sort((a, b) => {
				return b._locations.length - a._locations.length
			})

			this.instances = instances
			this.instanceOption = {
				id: 'instance',
				type: 'select',
				default: this.$store.getters['prefs/apiUrl'],
				label: 'Instance',
				options: instances.map(i => ({
					text: i.name,
					value: i.api_url
				}))
			}
		},

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
