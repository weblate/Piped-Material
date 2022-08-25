<template>
    <v-app :style="bgStyles">
        <v-app-bar
            app
            dense
            color="#efcac3"
            light
            v-if="$vuetify.breakpoint.width > 1000 && !$store.getters['prefs/isEmbedded']"
            class="desktop-buttons-container"
        >
            <v-btn
                v-for="link in links" :key="link.id"
                link
                text
                :to="link.to"
            >
                {{ $t(link.name) }}
            </v-btn>
            <AuthenticationModal />
            <v-btn icon @click="toggleDarkMode">
                <v-icon>{{ mdiBrightness6 }}</v-icon>
            </v-btn>
            <v-select
                class="mt-6"
                style="max-width: 15vw"
                dense
                :items="languageOptions"
                label="Language"
                :value="$i18n.locale"
                @input="changeLocale"
                outlined
            />
            <SearchMenu class="search-menu" />
            <!-- ^^^ The above breakpoint is manually determined to be the minimum sustainable width where everything works w/o overlapping -->
            <!-- Might need changing when buttons change -->
            <div class="desktop-buttons-container">
            </div>
        </v-app-bar>
        <div v-else-if="!$store.getters['prefs/isEmbedded']">
            <v-navigation-drawer
                v-model="drawer"
                app
            >
                <v-list nav>
                    <v-list-item
                        v-for="link in links"
                        :key="link.id"
                        link
                        :to="link.to"
                    >
                        {{ $t(link.name) }}
                    </v-list-item>
                    <AuthenticationModal :list-mode="true" />
                </v-list>
                <v-switch
                    dense
                    class="mx-2 mt-0 pt-0"
                    :input-value="$store.getters['prefs/getPreferenceBoolean']('darkMode', false)"
                    @change="toggleDarkMode"
                    label="Dark Mode"
                />
                <v-select
                    dense
                    :items="languageOptions"
                    label="Language"
                    :value="$i18n.locale"
                    @input="changeLocale"
                    outlined
                    class="mx-2"
                />
            </v-navigation-drawer>

            <v-app-bar app dense light color="#efcac3">
                <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

                <v-toolbar-title>Piped Material</v-toolbar-title>
                <v-spacer />
                <v-dialog
                    v-model="searchMenuOpened"
                    fullscreen hide-overlay
                    transition="dialog-bottom-transition"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            icon
                            large
                            v-bind="attrs"
                            v-on="on"
                            aria-label="Open Search Menu"
                        >
                            <v-icon>
                                {{ mdiMagnify }}
                            </v-icon>
                        </v-btn>
                    </template>
                    <v-card>
                        <v-toolbar
                            dark
                            color="primary"
                        >
                            <v-btn
                                icon
                                dark
                                @click="searchMenuOpened = false"
                            >
                                <v-icon>{{ mdiClose }}</v-icon>
                            </v-btn>
                            <v-toolbar-title>Search</v-toolbar-title>
                        </v-toolbar>
                        <v-card-text class="mt-2">
                            <SearchMenu @selected="searchMenuOpened = false" />
                        </v-card-text>
                    </v-card>
                </v-dialog>
            </v-app-bar>
        </div>

        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<style lang="scss">
.desktop-buttons-container {
    * {
        margin-right: 4px;
    }

    :last-child {
        margin-right: 0px;
    }
}
</style>

<script>
import { mdiBrightness6, mdiMagnify, mdiClose } from '@mdi/js'

import SearchMenu from '@/routes/SearchMenu'
import { changeLocale, SUPPORTED_LANGUAGES } from '@/plugins/i18n'
import AuthenticationModal from '@/components/AuthenticationModal'
import { COLOR_SCHEME_STATES } from '@/store/prefs-store'

export default {
	name: 'App',
	components: {
		AuthenticationModal,
		SearchMenu
	},
	metaInfo () {
		return {
			title: this.$t('titles.homepage'),
			// all titles will be injected into this template
			titleTemplate: '%s - Piped'
		}
	},

	data: () => ({
		drawer: false,
		// Only used on phones
		searchMenuOpened: false,

		mdiBrightness6,
		mdiMagnify,
		mdiClose
	}),

	computed: {
		bgStyles () {
			return {
				backgroundColor: this.$vuetify.theme.currentTheme.bgOne
			}
		},

		links () {
			const links = [
				{
					id: 'trending',
					name: 'titles.trending',
					to: '/trending'
				},
				{
					id: 'prefs',
					name: 'titles.preferences',
					to: '/preferences'
				},
				{
					id: 'watch-history',
					name: 'titles.history',
					to: '/watch-history'
				}
			]

			if (this.$store.getters['auth/isCurrentlyAuthenticated']) {
				links.splice(0, 0, {
					id: 'feed',
					name: 'titles.feed',
					to: '/feed'
				})
				links.push({
					id: 'playlists',
					name: 'titles.playlists',
					to: '/playlists'
				})
			}

			return links
		},

		languageOptions () {
			return SUPPORTED_LANGUAGES.map(code => {
				return {
					text: this.$store.getters['i18n/fmtLanguage'](code),
					value: code
				}
			}).sort((a, b) => this.$store.getters['i18n/compare'](a.text, b.text))
		}
	},

	methods: {
		changeLocale (lang) {
			return changeLocale(lang)
		},

		toggleDarkMode () {
			let colorSchemeState
			const newDarkState = !this.$vuetify.theme.dark
			this.$vuetify.theme.dark = newDarkState

			if (newDarkState) {
				colorSchemeState = COLOR_SCHEME_STATES.DARK
			} else {
				colorSchemeState = COLOR_SCHEME_STATES.LIGHT
			}

			this.$store.commit('prefs/setColorScheme', {
				colorScheme: colorSchemeState
			})
		},

		syncDarkMode (newVal = this.$store.state.prefs.colorScheme) {
			switch (newVal) {
				case COLOR_SCHEME_STATES.SYSTEM:
					this.$vuetify.theme.dark = window.matchMedia('(prefers-color-scheme: dark)').matches
					break
				case COLOR_SCHEME_STATES.DARK:
					this.$vuetify.theme.dark = true
					break
				case COLOR_SCHEME_STATES.LIGHT:
					this.$vuetify.theme.dark = false
					break
			}
		}
	},

	watch: {
		'$store.state.prefs.colorScheme': 'syncDarkMode',
		'$store.state.i18n.rtl' (newVal) {
			this.$vuetify.rtl = newVal
		}
	},

	created () {
		this.$vuetify.rtl = this.$store.state.i18n.rtl
		this.syncDarkMode()
	}
}
</script>
