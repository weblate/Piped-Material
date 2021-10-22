<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      class="pt-3"
      v-if="$vuetify.breakpoint.mdAndUp"
    >
      <v-row dense>
        <v-col md="1" v-for="link in links" :key="link.id">
          <v-btn
            text
            link
            min-width="100%"
            :to="link.to"
          >
            {{ $t(link.name) }}
          </v-btn>
        </v-col>
        <v-col md="2">
          <v-select
            dense
            :items="languageOptions"
            label="Language"
            :value="$i18n.locale"
            @input="changeLocale"
            outlined
          />
        </v-col>
        <v-col>
          <SearchMenu />
        </v-col>
      </v-row>
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
        </v-list>
        <v-select
          dense
          :items="languageOptions"
          label="Language"
          :value="$i18n.locale"
          @input="changeLocale"
          outlined
          class="mx-2"
        />
        <SearchMenu class="mx-2" />
      </v-navigation-drawer>

      <v-app-bar app color="primary" dark>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>Piped Material</v-toolbar-title>
      </v-app-bar>
    </div>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import SearchMenu from '@/routes/SearchMenu'
import { changeLocale } from '@/plugins/i18n'

export default {
  name: 'App',
  components: {
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
    links: [
      {
        id: 'prefs',
        name: 'titles.preferences',
        to: '/preferences'
      },
      {
        id: 'trending',
        name: 'titles.trending',
        to: '/'
      },
      {
        id: 'watch-history',
        name: 'titles.history',
        to: '/watch-history'
      }
    ],
    languageOptions: [
      { value: 'zh_Hant', text: 'Chinese (Traditional)' },
      { value: 'en', text: 'English' },
      { value: 'fr', text: 'French' },
      { value: 'de', text: 'German' },
      { value: 'el', text: 'Greek' },
      { value: 'lt', text: 'Lithuanian' },
      { value: 'ml', text: 'Malayalam' },
      { value: 'nb_NO', text: 'Norwegian Bokmål' },
      { value: 'tr', text: 'Turkish' },
      { value: 'bn_beng', text: 'Bengali (বাংলা)' }
      // Incomplete, DO NOT USE
      /* { value: 'bn_latn', text: 'Bengali (Latin)' }, */
    ].sort((a, b) => {
      return a.text.localeCompare(b.text)
    }),
    drawer: false
  }),

  methods: {
    changeLocale (lang) {
      return changeLocale(lang)
    }
  },
  created () {
    this.$store.dispatch('prefs/loadState')
    this.$store.dispatch('auth/initializeAuth')
  }
}
</script>
