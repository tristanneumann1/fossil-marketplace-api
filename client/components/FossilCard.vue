<template>
  <v-card class="my-2" elevation="3" color="secondary">
    <v-card-title class="headline">{{fossil.fossilId}}</v-card-title>
    <v-card-actions>
      <v-btn class="mx-2" fab small color="primary">
        <v-icon dark>add_shopping_cart</v-icon>
      </v-btn>
      <v-btn class="mx-2" fab small color="primary">
        <v-icon dark>redeem</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: ['fossil']
}
</script>

<style>
</style>