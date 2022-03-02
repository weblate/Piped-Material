<template>
    <v-app :style="bgStyles">
        <v-app-bar
            app
            color="primary"
            dark
            dense
            v-if="$vuetify.breakpoint.width > 1000"
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
        <div v-else>
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

            <v-app-bar app color="primary" dark dense>
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
                        >
                            <v-icon large>
                                {{ mdiCardSearchOutline }}
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
                            <SearchMenu />
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
import { mdiBrightness6, mdiCardSearchOutline, mdiClose } from '@mdi/js'

import SearchMenu from '@/routes/SearchMenu'
import { changeLocale } from '@/plugins/i18n'
import AuthenticationModal from '@/components/AuthenticationModal'

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
		languageOptions: [
			{
				value: 'en',
				text: 'English'
			},
			{
				value: 'fr',
				text: 'French'
			},
			{
				value: 'de',
				text: 'German'
			},
			{
				value: 'el',
				text: 'Greek'
			},
			{
				value: 'zh-Hans',
				text: 'Chinese (Simplified, only loads the font)'
			},
			{
				value: 'zh-Hant',
				text: 'Chinese (Traditional)'
			},
			{
				value: 'ja',
				text: 'Japanese (only loads fonts)'
			},
			{
				value: 'ko',
				text: 'Korean (only loads fonts)'
			},
			{
				value: 'ru',
				text: 'Russian (only loads fonts)'
			},
			{
				value: 'lt',
				text: 'Lithuanian'
			},
			{
				value: 'ml',
				text: 'Malayalam'
			},
			{
				value: 'nb-NO',
				text: 'Norwegian Bokmål'
			},
			{
				value: 'tr',
				text: 'Turkish'
			},
			{
				value: 'bn-Beng',
				text: 'Bengali (বাংলা)'
			},
			{
				value: 'ar',
				text: 'Arabic'
			},
			{
				value: 'ckb',
				text: 'Sorani Kurdish'
			}
			// Incomplete, DO NOT USE
			/* { value: 'bn_latn', text: 'Bengali (Latin)' }, */
		].sort((a, b) => {
			return a.text.localeCompare(b.text)
		}),
		drawer: false,
		// Only used on phones
		searchMenuOpened: false,

		mdiBrightness6,
		mdiCardSearchOutline,
		mdiClose
	}),

	computed: {
		bgStyles () {
			return {
				backgroundColor: this.$vuetify.theme.dark ? '#282828' : '#fbf1c7'
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
			}

			return links
		}
	},

	methods: {
		changeLocale (lang) {
			return changeLocale(lang)
		},

		toggleDarkMode () {
			this.$vuetify.theme.dark = !this.$vuetify.theme.dark
			this.$store.commit('prefs/setPrefs', {
				id: 'darkMode',
				value: this.$vuetify.theme.dark
			})
		}
	},

	watch: {
		'$store.state.prefs.prefs.darkMode' (newVal) {
			this.$vuetify.theme.dark = newVal
		},

		'$store.state.i18n.rtl' (newVal) {
			this.$vuetify.rtl = newVal
		}
	},

	created () {
		this.$vuetify.rtl = this.$store.state.i18n.rtl
	}
}
</script>
