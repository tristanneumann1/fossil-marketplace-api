<template>
  <v-app id="fossil-marketplace">
    <v-app-bar
      app
      color="primary"
      dark
      dense
      flat
    >
      <div class="d-flex align-center">
        <v-img
          alt="fossil-logo"
          class="shrink mr-2"
          contain
          :src="require('../assets/120px-Identified_Fossil_NH_Icon.png')"
          transition="scale-transition"
          width="40"
        />
        <span>Fossil Marketplace</span>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        to="/sign-up"
        text
        nuxt
      > Sign Up </v-btn>
    </v-app-bar>

    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
};
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'
html
  overflow-y: auto
</style>
