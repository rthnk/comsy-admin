<template>
  <v-container class="fill-height" fluid>
    <v-row
      align="center"
      justify="center"
    >
      <v-img
        max-width="400"
        :src="`${publicPath}image.png`"
      ></v-img>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "AdminRoot",
  data: () => ({
    publicPath: process.env.BASE_URL
  }),
  computed: {
  },
  created() {
  },
  methods: {
  }
};
</script>
