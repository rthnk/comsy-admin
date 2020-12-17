<template>
  <div class="StringArray">
    <v-text-field
      :label="label"
      v-model="partialValue"
      hide-details="auto"
      @keypress.enter="addValue($event)"
    ></v-text-field>
    <div class="StringArray-chipsContainer text-center">
      <span
        v-for="(value, iidx) in items"
        :key="value"
        class="StringArray-chip ma-2"
      >
        {{ value }}
        <v-btn
          class="mx-2"
          fab
          dark
          x-small
          color="primary"
          @click="removeString(value, iidx)"
        >
          <v-icon dark>
            mdi-minus
          </v-icon>
        </v-btn>
        <button >
        </button>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => {}
    },
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    value(newValue) {
      this.items = newValue || [];
    }
  },
  data: () => ({
    items: [],
    partialValue: ''
  }),
  mounted() {
    this.items = this.value || [];
    this.$emit('input', this.items);
  },
  methods: {
    removeString(value, _index) {
      this.items = this.items.filter(item => item !== value);
      this.$emit('input', this.items);
    },
    addValue(event) {
      event.stopPropagation();
      this.items.push(this.partialValue);
      this.partialValue = '';
      this.$emit('input', this.items);
    }
  }
}
</script>

<style lang="scss">
.StringArray {
  &-chipsContainer {
    margin-top: 2em;
    display: flex;
    flex-wrap: wrap;
  }
  &-chip {
    border: 1px solid gray;
    padding: 1em 0.2em 1em 1em;
    border-radius: 2em;
  }
}
</style>