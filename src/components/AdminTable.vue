<template>
  <v-data-table
    :headers="validHeaders"
    :items="items"
    sort-by="name"
    class="elevation-2 mx-8"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title> {{ title }} </v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mx-2"
              fab
              small
              :offset-x="true"
              v-bind="attrs" v-on="on"
            >
              <v-icon dark>
                mdi-format-list-bulleted-square
              </v-icon>
            </v-btn>
          </template>
          <v-list 
            style="max-height: 300px"
            class="overflow-y-auto"
          >
            <v-list-item
              v-for="(column, index) in headers"
              :key="index"
            >
              <v-checkbox
                :key="index"
                v-model="selectedHeaders"
                :label="column.value"
                :value="column.value"
                @click="storeColumnValues"
              ></v-checkbox>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mx-2"
              fab
              dark
              small
              color="primary"
              v-bind="attrs" v-on="on"
            >
              <v-icon dark>
                mdi-plus
              </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-container>
                  <v-row>
                    <v-col cols="12" v-for="(column, cidx) in headers" :key="cidx">
                      <v-switch
                        v-if="column.info.uiField === 'boolean'"
                        v-model="form[column.value]"
                        :label="`${column.info.required ? '*' : ''} ${column.text}`"
                      ></v-switch>

                      <v-select
                        v-if="column.info.uiField === 'text' && !column.info.isArray && column.info.enum"
                        :items="column.info.enum"
                        v-model="form[column.value]"
                        :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        item-text="name"
                        item-value="_id"
                        return-object
                      ></v-select>

                      <v-text-field
                        class="mx-0"
                        v-if="column.info.uiField === 'text' && !column.info.isArray && !column.info.enum"
                        v-model="form[column.value]"
                        :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        :rules="getRequiredRules(column)"
                      ></v-text-field>

                      <v-select
                        v-if="column.info.uiField === 'text' && column.info.isArray"
                        :items="options[column.value]"
                        v-model="form[column.value]"
                        :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        item-text="name"
                        item-value="_id"
                        multiple
                        chips
                        return-object
                      ></v-select>

                      <LatLong
                        v-if="column.info.uiField === 'latlong'"
                        :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        v-model="form[column.value]"
                        class="mx-0"
                      />

                      <v-file-input
                        v-if="column.info.uiField === 'file'"
                        v-model="form[column.value]"
                        :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        :prepend-icon="column.text === 'image' ? 'mdi-camera' : 'mdi-file'"
                        outlined
                        dense
                      />

                      <ImageInput
                        v-if="column.info.uiField === 'imagefile'"
                        v-model="form[column.value]"
                        :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        @onLocation="(ll) => setLocation(column, ll)"
                      />
                      
                      <v-select
                        v-if="column.info.uiField === 'multiselect'"
                        v-model="form[column.value]"
                        :items="options[column.value]"
                        :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        :item-text="keyLabel[column.value] ? keyLabel[column.value].label : 'label'"
                        :item-value="keyLabel[column.value] ? keyLabel[column.value].key : '_id'"
                        multiple
                        chips
                      ></v-select>

                      <div
                        v-if="column.info.uiField === 'content'"
                      >
                        <strong> {{ `${column.info.required ? '*' : ''} ${column.text}` }} </strong>
                        <quill-editor
                          v-model="form[column.value]"
                          ref="myQuillEditor"
                          :options="quillOptions"
                        >
                        </quill-editor>
                      </div>

                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-for="(column, cidx) in headers" v-slot:[`item.${column.value}`]="{ item }">
      <div :key="cidx">
        <div
          v-if="column.info.uiField === 'imagefile' && isImage(item[column.value])"
        >
          <a :href="item[column.value].path" target="_blank" rel="noopener noreferrer">
            <img :src="item[column.value].path" alt="Image" style="max-width: 100px;max-height: 100px;">
          </a>
        </div>
        <div
          v-else-if="column.info.uiField === 'file' && isImage(item[column.value])"
        >
          <a :href="item[column.value].path" target="_blank" rel="noopener noreferrer">
            <v-icon>mdi-link</v-icon>
          </a>
        </div>
        <div
          v-else-if="column.info.uiField === 'multiselect'"
        >
          <v-chip v-for="item in item[column.value]" :key="item">
            {{ getReadableOption(column.value, item) }}
          </v-chip>
        </div>
        <div
          v-else
        >
          {{ item[column.value] }}
        </div>
      </div>
    </template>
    <template v-slot:[`item.__actions`]="{ item }">
      <v-icon small class="mr-2" @click="onEditItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon small @click="onDeleteItem(item)">
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <p>
        <br>
        No items here
        <br>
      </p>
    </template>
  </v-data-table>
</template>

<script>

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import LatLong from './forms/LatLong.vue';
import ImageInput from './forms/ImageInput.vue';
import Swal from 'sweetalert2';
import { quillEditor } from 'vue-quill-editor'


export default {
  name: '',
  components: {
    LatLong,
    ImageInput,
    quillEditor
  },
  props: {
    title: {
      type: String,
      default: 'Item'
    },
    headers: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({})
    },
    keyLabel: {
      type: Object,
      default: () => ({})
    },
    saveItem: {
      type: Function,
      default: () => {}
    },
    deleteItem: {
      type: Function,
      default: () => {}
    },
  },
  data: () => ({
    valid: false,
    form: {},
    dialog: false,
    formIndex: -1,
    noRules: [],
    selectedHeaders: [],
    quillOptions: {
      handlers: {
        image: function(value) {
          if (value) {
            var href = prompt('Enter the URL');
            this.quill.format('link', href);
          } else {
            this.quill.format('link', false);
          }
        }
      }
    }
  }),
  computed: {
    formTitle () {
      return this.formIndex === -1 ? `New ${this.title}` : `Edit ${this.title}`
    },
    validHeaders() {
      return [
        ...this.headers
          .filter(header => (this.selectedHeaders || []).includes(header.value))
          .filter(header => header.value !== '__actions'),
        { text: "Actions", value: "__actions", sortable: false }
      ]
    }
  },
  watch: {
    headers(_newVal) {
      this.updateHeaders();
    },
    dialog(newVal) {
      if (!newVal) {
        this.$nextTick(() => {
          this.form = {};
          this.formIndex = -1;
          this.image = null;
        });
        this.$refs.form.reset()
      }
    }
  },
  mounted() {
    this.updateHeaders();
  },
  methods: {
    setLocation(column, ll) {
      if (column.info.uiMeta && column.info.uiMeta.locationTarget) {
        this.$set(this.form, column.info.uiMeta.locationTarget, {...ll});
      }
    },
    storeColumnValues() {
      this.$nextTick(this.saveColumns)
    },
    saveColumns() {
      let store = {};
      try {
        store = JSON.parse(localStorage.getItem('$ADMIN_TABLE'));
      } catch (error) {
        store = {
          [this.$route.name]: [this.headers[0].value]
        };
      } finally {
        store = store ? store : {};
      }
      store[this.$route.name] = [...(Array.isArray(this.selectedHeaders) ? this.selectedHeaders : [this.selectedHeaders] )];
      localStorage.setItem('$ADMIN_TABLE', JSON.stringify(store));
    },
    isImage(file) {
      if (file && file.path) {
        const [ext] = file.path.split(/\./g).reverse();
        if (['jpg', 'png', 'jpeg', 'gif'].includes(ext)) {
          return true
        }
      }
      return false;
    },
    updateHeaders() {
      if (this.headers.length) {
        let columns = [];
        try {
          columns = JSON.parse(localStorage.getItem('$ADMIN_TABLE'))[this.$route.name];
        } catch (error) {
          columns = [...this.headers.filter((col, idx) => idx < 3).map(col => col.value)]
        }
        this.selectedHeaders = columns;
      }
    },
    getRequiredRules(column) {
      if (column.info.required) {
        return [v => !!v || `${column.text} is required`]
      }
    },
    getReadableOption(name, item){
      if (this.options[name] && this.keyLabel[name]) {
        const kl = this.keyLabel[name];
        const val = this.options[name].filter(elm => elm[kl.key] === item).pop()
        if (val) {
          return val[kl.label];
        }
      }
      return item;
    },
    close() {
      this.dialog = false;
    },
    open() {
      this.dialog = true;
    },
    async save() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        const resp = this.saveItem({...this.form}, this.formIndex > -1);
        if (resp) {
          this.close();
        }
      }
    },
    onEditItem(item) {
      this.formIndex = this.items.indexOf(item);
      this.form = Object.assign({}, item);
      this.dialog = true;
    },
    async onDeleteItem(item) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      })
      if (result.isConfirmed) {
        this.deleteItem(item)
      }
    }
  }
};
</script>

<style>
</style>