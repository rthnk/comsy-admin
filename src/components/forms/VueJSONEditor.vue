<template>
  <div class="JSONEditor">
    <div class="JSONEditor-holder"></div>
    <button class="btn" @click="save($event)">Apply</button>
    <div>
      {{ value }}
    </div>
  </div>
</template>

<script>
const schema = require('./JsonSchema.json');

export default {
  name: 'VueJsonEditor',
  props: ['value'],
  watch: {
    value(newValue) {
      if ((typeof newValue) === 'string'){
        this.updateValue(newValue)
      }
    }
  },
  mounted () {
    const element = document.querySelector('.JSONEditor-holder');
    this.editor = new window.JSONEditor(element, {
      schema,
      theme: 'foundation6',
      // theme: 'bootstrap2',
      // theme: 'bootstrap2',
      // theme: 'barebones',
      iconlib: 'fontawesome4',
      disable_array_reorder: true,
      disable_edit_json: true,
      disable_properties: true,
    });
    if (this.value) {
      this.updateValue(this.value);
    }
    window.editor = this.editor;
    // setInterval(() => {
    //   const value = this.editor.getValue();
    //   this.$emit('input', value);
    // }, 1000)
  },
  methods: {
    updateValue (newValue) {
      console.log('->', newValue);
      const values = JSON.parse(newValue);
      const keys = Object.keys(values);
      const final = keys.map(name => {
        return {
          field_name: name,
          ...values[name]
        };
      });
      console.log(final);
      this.editor.setValue(final);
    },
    save(event) {
      event.preventDefault();
      const value = this.editor.getValue();
      this.$emit('input', JSON.stringify(
        value.reduce((acc, item) => {
          acc[item.field_name] = {
            ...item,
            field_name: undefined
          };
          return acc;
        }, {})
      ));
    }
  }
}
</script>

<style lang="scss">
.JSONEditor {
  h3 {
    font-size: 14px;
    margin: 0;
  }
  .secondary {
    position: relative;
    padding: 8px;
  }
  .row {
    position: relative;
    padding: 4px;
  }
  .btn-group {
    display: inline-block;
    margin: 2px 0;
  }
  .btn {
    border: 1px solid lightgray;
    box-shadow: 0 2px 3px lightgray;
    border-radius: 3px;
    padding: 1px 2px;
  }
  select, input {
    border: 1px solid rgba(1, 1, 1, 0.1);
    margin: 4px 2px;
    border-radius: 2px;
  }
  select {
    position: relative;
    &::before {
      font: normal normal normal 14px/1 FontAwesome;
      content: "\f0d7";
      color: rgba(1, 1, 1, 0.4);
      position: absolute;
      right: 5px;
    }
  }

  .row {
    border: 1px solid white;
    position: relative;
  }

  .columns {
    width: 100%;
  }

}
.v-application .JSONEditor .secondary {
  background-color: #fff !important;
  border: 1px solid rgba(1, 1, 1, 0.1) !important;
  border-radius: 4px;
}

.callout .secondary {
  padding: 8px 12px;
  margin: 14px 0;
}

input[name^="root"] {
  background-color: rgba(1, 1, 1, 0.05);
}

.row .form-control label {
  display: flex !important;
  align-items: center;
}

.row .form-control input,
.row .form-control select {
  flex-grow: 1;
  margin: 0 !important;
  padding: 0 !important;
  margin-left: 1em !important;
}

</style>