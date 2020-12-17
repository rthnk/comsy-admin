<template>
  <v-row align="stretch" justify="center">
    <v-col sm="12">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="headline">{{ label }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-col>
    <v-col sm="12">
      <AdminTable
        :title="label"
        :resource="resource"
      />
    </v-col>
  </v-row>
</template>

<script>
import AdminTable from './AdminTable.vue';

export default {
  name: 'ResourceManager',
  props: {
    resource: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  components: {
    AdminTable
  },
  data: () => ({
    options: {},
    keyLabel: {}
  })
}
</script>

<style lang="scss">
.headline {
  text-transform: capitalize;
}
</style>
