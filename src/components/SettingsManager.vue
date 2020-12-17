<template>
  <v-row align="center" justify="center">
    <v-col class="my-4">
      <v-form ref="form" v-model="password.validation" lazy-validation>
        <v-card class="mx-auto" max-width="344" elevation="10">
          <v-card-text>
            <div>Change password</div>
            <v-text-field
              v-model="password.currentPassword"
              label="Current password"
              :rules="rules.current"
              :append-icon="password.showCurrentPasswd ? 'mdi-eye' : 'mdi-eye-off'"
              :type="password.showCurrentPasswd ? 'text' : 'password'"
              @click:append="password.showCurrentPasswd = !password.showCurrentPasswd"
              required
            ></v-text-field>

            <v-text-field
              v-model="password.password"
              label="Password"
              :rules="rules.password"
              :append-icon="password.showPasswd ? 'mdi-eye' : 'mdi-eye-off'"
              :type="password.showPasswd ? 'text' : 'password'"
              @click:append="password.showPasswd = !password.showPasswd"
              required
            ></v-text-field>

            <v-text-field
              label="Confirm password"
              v-model="password.confirm"
              required
              :rules="rules.password"
              :append-icon="password.showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
              :type="password.showConfirm ? 'text' : 'password'"
              @click:append="password.showConfirm = !password.showConfirm"
            ></v-text-field>
            <p v-if="password.confirm !== password.password" class="red--text darken-2">
              Password are not matching
            </p>
            <p v-if="!password.valid" class="red--text darken-2">
              Invalid form information
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="blue-grey darken-3" @click="changePassword">
              Change
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
  
    </v-col>
  </v-row>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  name: "SettingsManager",
  data: () => ({
    password: {
      valid: true,
      showPasswd: false,
      showConfirm: false,
      showCurrentPasswd: false,
      currentPassword: '',
      password: '',
      confirm: ''
    },
    rules: {
      current: [
        v => !!v || 'This value is required',
      ],
      password: [
        v => !!v || 'This value is required',
        v => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(v) || 'Password must be valid'
      ]
    }
  }),
  methods: {
    async changePassword() {
      this.password.valid = this.$refs.form.validate();
      if (this.password.valid) {
        try {
          const resp = await this.$store.dispatch('auth/changePassword', {
            currentPassword:this.password.currentPassword,
            newPassword: this.password.password
          });
          await Swal.fire({
            title: 'Change password',
            text: resp
              ? 'Password changed successfully'
              : 'Failure changing password',
            icon: resp? 'success' : 'warning',
          });
        } catch(error) {
          await Swal.fire({
            title: 'Change password',
            text: 'Failure changing password',
            icon: 'warning',
          });
        }
      }
    }
  }
};
</script>

<style>
</style>
