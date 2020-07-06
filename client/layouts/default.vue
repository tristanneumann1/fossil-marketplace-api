<template>
  <v-app id="fossil-marketplace">
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="fossil-logo"
          class="shrink mr-2"
          contain
          :src="require('./120px-Identified_Fossil_NH_Icon.png')"
          transition="scale-transition"
          width="40"
        />
        <span>Fossil Marketplace</span>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      > Sign In </v-btn>
    </v-app-bar>

    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    //
  }),
};
</script>

<style lang="sass">
  @import '~vuetify/src/styles/styles.sass'
</style>
