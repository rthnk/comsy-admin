<template>
  <div class="FileInput">
    <img ref="image1" class="FileInput-image" :src="url" v-if="url">
    <v-file-input
      v-model="info"
      :label="label"
      :prepend-icon="label.toLowerCase().includes('image') ? 'mdi-camera' : 'mdi-file'"
      outlined
      dense
      @change="updateFile"
      @click:clear="clearFile"
    />
  </div>
</template>

<script>

export default {
  name: "FileInput",
  props: {
    label: {
      String,
      default: ''
    }
  },
  data: () => ({
    info: null,
    meta: null,
    location: null,
    url: ''
  }),
  methods: {
    clearFile() {
      this.url = '';
      this.meta = null;
      this.location = null;
    },
    async updateFile() {
      if (!this.info) {
        return;
      }
      const buff = await this.info.arrayBuffer();
      const parser = window.ExifParser.create(buff);
      const result = await parser.parse()
      this.$set(this, 'meta', result);
      const location = {
        longitude: result.tags.GPSLongitude,
        latitude: result.tags.GPSLatitude
      };
      this.$set(this, 'location', location);
      this.$emit('onLocation', location);
      this.$emit('input', this.info);
    }
  }
}
</script>

<style lang="scss">
.FileInput {
  text-align: center;

  &-image {
    max-width: 200px;
    max-height: 200px;
    display: inline-block;
    border: 1px solid rgba(10, 10, 10, 0.2);
    border-radius: 3px;
  }
}
</style>