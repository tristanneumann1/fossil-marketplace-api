<template>
  <div id="home">
    <v-toolbar
      class="fossil-search"
      dense
      flat
      rounded
    >
      <v-text-field
        hide-details
        append-icon="search"
        single-line
      ></v-text-field>
    </v-toolbar>
    <v-container grid-list-xs fluid>
      <v-list>
        <dinosaur-fossils v-for="dinosaur in dinosaurs" :key="dinosaur.name" :dinosaur="dinosaur"></dinosaur-fossils>
      </v-list>
    </v-container>
  </div>
</template>

<script>
import fossilList from '../../assets/fossils.json';
import DinosaurFossils from '../../components/DinosaurFossils.vue';
export default {
  components: {
    DinosaurFossils
  },
  data() {
    return {
      accountId: 'admin',
      fossilList,
    }
  },
  created() {
    this.accountId = this.$route.query.accountId || 'admin';
  },
  computed: {
    dinosaurs() {
      const dinosaurs = []
      for(let fossil of fossilList) {
        if(!fossil.parent) {
          dinosaurs.push({
            name: fossil.fossilId,
            fossils: [fossil]
          })
          continue;
        }
        const dinosaur = dinosaurs.find((dinosaur) => {
          return dinosaur.name === fossil.parent
        })
        if (dinosaur) {
          dinosaur.fossils.push(fossil)
          continue;
        }
        dinosaurs.push({
          name: fossil.parent,
          fossils: [fossil]
        })
      }
      return dinosaurs
    }
  }
}
</script>

<style>
.fossil-search {
  right: 0;
  top: 48px;
  z-index: 1;
  position: fixed;
}
#home .fossil-card {
  color: white;
  display: flex;
  justify-content: space-between;
}
</style>