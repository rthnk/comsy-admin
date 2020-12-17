<template>
  <v-container fill-height fluid>
    <v-row align="center"
        justify="center">
        <v-card
          class="mx-auto"
          max-width="344"
          min-width="344"
          elevation="10"
          outlined
        >
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="headline">Admin Login</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-form
                ref="form"
                v-model="valid"
                lazy-validation
              >
                <v-text-field
                  v-model="username"
                  label="Username"
                  :rules="nameRules"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="password"
                  :append-icon="showPasswd ? 'mdi-eye' : 'mdi-eye-off'"
                  :rules="passwdRules"
                  :type="showPasswd ? 'text' : 'password'"
                  name="input-10-1"
                  label="Password"
                  @keypress.enter="loginAction"
                  @click:append="showPasswd = !showPasswd"
                ></v-text-field>

                <v-btn
                  color="success"
                  class="mr-4"
                  @click="loginAction"
                >
                  Login
                </v-btn>
              </v-form>
            </v-list-item-content>
          </v-list-item>
        </v-card>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: 'Login',
  data: () => ({
    username: '',
    password: '',
    nameRules: [
      v => !!v || 'Username is required',
    ],
    passwdRules: [
      v => !!v || 'Password is required',
    ],
    showPasswd: false,
    valid: false
  }),
  computed: {
    ...mapState({
      loggedIn: ({auth}) => auth.loggedIn
    })
  },
  created() {
    if (this.loggedIn) {
      this.$router.push('/admin');
    }
  },
  methods: {
    async loginAction() {
      if (this.username && this.password) {
        const credentials = {
          username: this.username,
          password: this.password
        };
        try {
          const resp = await this.login(credentials);
          if (resp) {
            if (this.$route.query.next) {
              return this.$router.push({path: this.$route.query.next});
            }
            return this.$router.push({path: '/admin/root'});
          }
          alert('Invalid credentials');
        } catch (error) {
          console.error(error);
        }
      }
    },
    ...mapActions({
      login: 'auth/login'
    })
  }
}
</script>

<style lang="scss">
</style>
