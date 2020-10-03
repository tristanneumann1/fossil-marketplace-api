<template>
  <v-container fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar
            color="primary"
            dark
            flat
          >
            <v-toolbar-title>Sign Up form</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                label="Email"
                name="email"
                :value="email"
                prepend-icon="mdi-email"
                type="text"
              ></v-text-field>

              <v-text-field
                id="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
              ></v-text-field>

              <v-text-field
                id="password-confirm"
                label="Confirm Password"
                name="passwordConfirm"
                prepend-icon="mdi-lock-outline"
                type="password"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary">Sign up</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import { mapState } from 'vuex'

export default {
  name: 'login',
  data: () => ({
    email: '',
  }),
  // computed: ...mapState(['accountId']),
  methods: {
    signUp() {
      this.$store.dispatch('register', { email: this.email });
      this.$router.push('/home')
    }
  }
}
</script>

<style>

</style>