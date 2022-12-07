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
                {{ $t('actions.logInSignUp') }}
            </v-list-item>
            <v-btn
                    v-else
                    text
                    v-bind="attrs"
                    v-on="on"
            >
                {{ $t('actions.logInSignUp') }}
            </v-btn>
        </template>
        <v-card>
            <v-card-title>{{ $t('auth_dialog.title') }}</v-card-title>
            <v-card-text>
                <v-text-field v-model="username" :label="$t('auth_dialog.username')"/>
                <v-text-field type="password" v-model="password" :label="$t('auth_dialog.password')"/>
                <v-alert outlined color="error" v-if="error != null">{{ error }}</v-alert>
                <v-btn @click="login" :disabled="requestInProgress" :loading="requestInProgress" color="primary" outlined large>
                    {{ $t('auth_dialog.log_in') }}
                </v-btn>
                <v-btn @click="register" :disabled="requestInProgress" :loading="requestInProgress" color="primary" class="ml-2" outlined large>
                    {{ $t('auth_dialog.sign_up') }}
                </v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog
            v-model="dialogOpen"
            :width="1024"
            v-else
    >
        <template v-slot:activator="{ on, attrs }">
            <v-list-item
                    v-if="listMode === true"
                    v-bind="attrs"
                    v-on="on"
            >
                {{ $t('actions.accounts') }}
            </v-list-item>
            <v-btn
                    v-else
                    text
                    v-bind="attrs"
                    v-on="on"
            >
                {{ $t('actions.accounts') }}
            </v-btn>
        </template>
        <v-card>
            <v-card-title>{{ $t('actions.accounts') }}</v-card-title>
            <v-card-text>
                <v-alert outlined color="error" v-if="error != null">{{ error }}</v-alert>
                <v-btn @click="logOut" outlined large class="mr-2">{{ $t('actions.logOut') }}</v-btn>
                <v-btn @click="logOutAllDevices" outlined large>{{ $t('actions.logOutFromAllDevices') }}</v-btn>
                <v-divider class="my-2" />
                <h5 class="text-subtitle-1">{{ $t('actions.delAccountMessage') }}</h5>
                <v-text-field type="password" v-model="password" label="Password"/>
                <v-btn outlined style="display: inline-block; white-space: normal; height: auto; padding: 8px" small @click="delAccount">{{ $t('actions.confirmPWToDelAcc') }}</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
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
			this.dialogOpen = false
		},

		async logOutAllDevices () {
			const { error } = await this.$store.dispatch('auth/makeRequest', {
				path: '/logout',
				method: 'POST'
			})
			if (error != null) {
				this.error = error
			} else {
				this.logOut()
			}
		},

		async delAccount () {
			const { error } = await this.$store.dispatch('auth/makeRequest', {
				path: '/user/delete',
				method: 'POST',
				data: {
					password: this.password
				}
			})
			if (error != null) {
				this.error = error
			} else {
				this.logOut()
			}
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
