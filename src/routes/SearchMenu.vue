<template>
  <v-autocomplete
    ref="searchMenu"
    v-model="select"
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

export default {
	name: 'SearchMenu',
	data () {
		return {
			selected: 0,
			select: '',
			searchText: '',
			requestInProgress: false,
			searchSuggestions: []
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
			} catch (e) {
				console.log('???', e)
			} finally {
				this.select = ''
				this.searchText = ''
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

			{
				const idx = suggestions.indexOf(this.searchText)
				if (idx !== -1) {
					suggestions.splice(idx, 1)
				}
			}
			suggestions.unshift(this.searchText)

			this.searchSuggestions = suggestions
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
