<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      v-if="$vuetify.breakpoint.width > 1675"
    >
      <!-- ^^^ The above breakpoint is manually determined to be the minimum sustainable width where everything works w/o overlapping -->
      <!-- Might need changing when buttons change -->
      <v-row dense align="center" justify="center">
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
        <v-col md="1">
          <AuthenticationModal />
        </v-col>
        <v-col md="2" class="mx-4">
          <v-select
            class="mt-6"
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
          <AuthenticationModal :list-mode="true" />
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
      { value: 'zh_Hant', text: 'Chinese (Traditional)' },
      { value: 'en', text: 'English' },
      { value: 'fr', text: 'French' },
      { value: 'de', text: 'German' },
      { value: 'el', text: 'Greek' },
      { value: 'zh_Hans', text: 'Chinese (Simplified, only loads the font)' },
      { value: 'jp', text: 'Japanese (only loads fonts)' },
      { value: 'kr', text: 'Korean (only loads fonts)' },
      { value: 'cyrl', text: 'Cyrillic Languages (fonts)' },
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

  computed: {
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
    }
  },

  created () {
    this.$store.dispatch('prefs/loadState')
    this.$store.dispatch('auth/initializeAuth')
  }
}
</script>
