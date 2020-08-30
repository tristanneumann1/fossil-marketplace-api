<template>
  <div class="dinosaur-fossils mx-4">
    <h2>{{dinosaur.name}}</h2>
    <div class="mx-4">
      <fossil-card class="fossil-card" v-for="fossil in dinosaur.fossils" :key="fossil.fossilId" :fossil="fossil"></fossil-card>
    </div>
  </div>
</template>
<script>
import FossilCard from './FossilCard.vue';
export default {
  components: {
    FossilCard
  },
  props: ['dinosaur']
}
</script>

<style>

</style>