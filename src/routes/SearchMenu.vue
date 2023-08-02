<template>
  <v-autocomplete
    ref="searchMenu"
    v-model="select"
    :prepend-inner-icon="mdiMagnify"
    :loading="requestInProgress"
    :items="searchSuggestions"
    :search-input.sync="searchText"
    cache-items
    flat
    dense
    auto-select-first
    hide-no-data
    hide-details
    :label="$t('misc.searchBarLabel')"
    solo-inverted
  />
</template>

<script>
import _debounce from 'lodash-es/debounce'
import { setupKeybindings } from 'psychic-tiny-keys'

import { mdiMagnify } from '@mdi/js'

export default {
	name: 'SearchMenu',
	data () {
		return {
			selected: 0,
			select: '',
			searchText: '',
			requestInProgress: false,
			actualSuggestions: [],

			mdiMagnify
		}
	},
	watch: {
		searchText (val) {
			if (val && val !== this.select) {
				this.refreshSuggestions()
			}
		},

		async select (val) {
			if (val === '') {
				return
			}
			try {
				await this.$router.push({
					name: 'SearchResults',
					query: { search_query: val }
				})
				this.$emit('selected', val)
			} catch (e) {
				console.log('???', e)
			} finally {
				this.select = ''
				this.searchText = ''
			}
		}
	},
	computed: {
		searchSuggestions () {
			if (this.searchText.length === 0) {
				return this.actualSuggestions
			} else {
				return [this.searchText].concat(this.actualSuggestions)
			}
		}
	},

	methods: {
		refreshSuggestions: _debounce(async function refreshSuggestions () {
			this.requestInProgress = true
			const suggestions = await this.$store.dispatch('auth/makeRequest', {
				path: '/suggestions',
				params: {
					query: this.searchText
				}
			})

			this.actualSuggestions = suggestions
			this.requestInProgress = false
		}, 500)
	},

	mounted () {
		this.unsubToKeybindings = setupKeybindings(window, {
			'/': (e) => {
				this.$refs.searchMenu.focus()
				e.preventDefault()
			}
		})
	},

	beforeDestroy () {
		this.unsubToKeybindings()
	}
}
</script>
