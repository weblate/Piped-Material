<template>
    <v-dialog
      v-model="dialogOpen"
      :width="768"
      v-if="!$store.getters['auth/isCurrentlyAuthenticated']"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-list-item
          v-if="listMode === true"
          v-bind="attrs"
          v-on="on"
        >
          Log In/Sign Up
        </v-list-item>
        <v-btn
          v-else
          text
          small
          v-bind="attrs"
          v-on="on"
        >
          Log In/Sign Up
        </v-btn>
      </template>
      <v-card>
        <v-card-title>Authentication</v-card-title>
        <v-card-text>
          <v-text-field v-model="username" label="Username" />
          <v-text-field type="password" v-model="password" label="Password" />
          <v-alert outlined color="error" v-if="error != null">{{ error }}</v-alert>
          <v-btn @click="login" :disabled="requestInProgress" :loading="requestInProgress" color="primary" outlined large>Log In</v-btn>
          <v-btn @click="register" :disabled="requestInProgress" :loading="requestInProgress" color="primary" class="ml-2" outlined large>Sign Up</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  <v-list-item
    v-else-if="listMode === true"
    @click="logOut"
  >
    Log Out
  </v-list-item>
  <v-btn text small @click="logOut" v-else>Log Out</v-btn>
</template>

<script>
import { AuthenticationError } from '@/store/authentication-store'

export default {
	name: 'AuthenticationModal',
	props: ['listMode'],
	data: () => ({
		error: null,
		requestInProgress: false,
		dialogOpen: false,
		username: '',
		password: ''
	}),
	methods: {
		async doCall (path) {
			this.error = null
			try {
				this.requestInProgress = true
				await this.$store.dispatch('auth/loginOrRegister', {
					path,
					username: this.username,
					password: this.password
				})
				this.dialogOpen = false
			} catch (e) {
				if (!(e instanceof AuthenticationError)) {
					throw e
				}

				this.error = e.message
			} finally {
				this.requestInProgress = false
			}
		},

		logOut () {
			this.$store.commit('auth/deleteAuthToken', {
				apiURL: this.$store.getters['prefs/apiUrl']
			})
		},

		login () {
			return this.doCall('login')
		},

		register () {
			return this.doCall('register')
		}
	}
}
</script>
