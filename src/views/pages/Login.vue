<template>
  <div>
    <v-card class="text-center pa-1">
      <v-card-title class="justify-center display-1 mb-2">Welcome</v-card-title>
      <v-card-subtitle>Sign in to your account</v-card-subtitle>

      <!-- sign in form -->
      <v-card-text>
        <v-form ref="form" v-model="isFormValid" lazy-validation>
          <v-alert
            v-if="errorProvider"
            dense
            dismissible
            tile
            border="left"
            color="red"
            close-icon="mdi-close"
            type="error"
            class="text-left text-body-2"
          >{{ errorProviderMessages }}</v-alert>

          <v-text-field
            v-model="username"
            :rules="[rules.required]"
            :validate-on-blur="false"
            :error="error"
            label="Username"
            name="username"
            outlined
            @keyup.enter="submit"
            @change="resetErrors"
          ></v-text-field>

          <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required]"
            :type="showPassword ? 'text' : 'password'"
            :error="error"
            :error-messages="errorMessages"
            label="Password"
            name="password"
            outlined
            @change="resetErrors"
            @keyup.enter="submit"
            @click:append="showPassword = !showPassword"
          ></v-text-field>

          <v-btn
            :loading="isLoading"
            :disabled="isLoading"
            block
            x-large
            color="primary"
            @click="submit"
          >Sign In</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // sign in buttons
      isLoading: false,

      // form
      isFormValid: true,
      username: '',
      password: '',

      // form error
      error: false,
      errorMessages: '',

      errorProvider: false,
      errorProviderMessages: '',

      // show password field
      showPassword: false,

      // input rules
      rules: {
        required: (value) => (value && Boolean(value)) || 'Required'
      }
    }
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.isLoading = true
        this.signIn(this.username, this.password)
      }
    },
    signIn(username, password) {
      this.$store.dispatch('auth/login', { username, password })
        .then(() => { 
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
          this.errorProvider = true
          this.errorProviderMessages = error.message || 'An error occured.'
        })
    },
    resetErrors() {
      this.error = false
      this.errorMessages = ''

      this.errorProvider = false
      this.errorProviderMessages = ''
    }
  }
}
</script>
