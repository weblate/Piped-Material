<template>
  <v-app id="inspire">
    <v-app-bar
      app
      color="primary"
      dark
      flat
    >
      <v-container class="py-0 fill-height">
        <v-btn
          v-for="link in links"
          :key="link.id"
          text
          link
          :to="link.to"
        >
          {{ link.name }}
        </v-btn>

        <v-spacer></v-spacer>

        <v-responsive max-width="720">
          <v-text-field
            dense
            flat
            hide-details
            rounded
            solo-inverted
          ></v-text-field>
        </v-responsive>
      </v-container>
    </v-app-bar>

    <v-main class="grey lighten-3">
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    links: [
      {
        id: 'prefs',
        name: 'Preferences',
        to: '/preferences'
      },
      {
        id: 'login',
        name: 'Login',
        to: '/login'
      },
      {
        id: 'register',
        name: 'Register',
        to: '/register'
      },
      {
        id: 'feed',
        name: 'Feed',
        to: '/feed'
      },
      {
        id: 'trending',
        name: 'Trending',
        to: '/'
      }
    ]
  })
}
</script>
