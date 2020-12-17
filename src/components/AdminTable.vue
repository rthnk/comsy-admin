<template>
  <div>
    <v-data-table
      :headers="validHeaders"
      :items="items"
      :server-items-length="totalCount"
      :options.sync="tableOptions"
      :loading="isLoading"
      :footer-props="{'items-per-page-options':[5, 10, 20, 50, 100]}"
      sort-by="name"
      class="elevation-2 mx-8"
      data-intro="Las tablas contienen la informacoón de la colección"
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
                data-intro="Puedes escoger las columnas que quieres ver"
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
          <v-dialog persistent v-model="dialog" max-width="800px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="mx-2"
                fab
                dark
                small
                color="primary"
                data-intro="puedes agregar nuevos datos a la colección"
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
                <v-spacer />
                <v-btn :disabled="isSaving" color="blue darken-1" icon @click="save">
                  <v-icon>mdi-content-save-outline</v-icon>
                </v-btn>
                <v-btn :disabled="isSaving" color="blue darken-1" icon @click="close">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-form ref="form" v-model="valid">
                  <v-container>
                    <v-row>
                      <v-col cols="12" v-for="(column, cidx) in headers" :key="cidx">
                        <StringArray
                          v-if="column.info.uiMeta.uiField === 'stringarray'"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        />
                        <v-switch
                          v-if="column.info.uiMeta.uiField === 'boolean'"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                        ></v-switch>

                        <v-select
                          v-if="column.info.uiMeta.uiField === 'text' && !column.info.isArray && column.info.enum"
                          :items="column.info.enum"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          item-text="name"
                          item-value="_id"
                          return-object
                        ></v-select>

                        <v-select
                          v-if="column.info.uiMeta.uiField === 'array' && column.info.enum"
                          :items="column.info.enum"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          item-text="name"
                          item-value="_id"
                          multiple
                          return-object
                        ></v-select>

                        <v-text-field
                          class="mx-0"
                          v-if="column.info.uiMeta.uiField === 'text' && !column.info.isArray && !column.info.enum"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          :rules="getRequiredRules(column)"
                        ></v-text-field>

                        <v-select
                          v-if="column.info.uiMeta.uiField === 'text' && column.info.isArray"
                          :items="options[column.value]"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          :rules="getRequiredRules(column)"
                          item-text="name"
                          item-value="_id"
                          multiple
                          chips
                          return-object
                        ></v-select>

                        <LatLong
                          v-if="column.info.uiMeta.uiField === 'latlong'"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          v-model="form[column.value]"
                          class="mx-0"
                        />

                        <v-file-input
                          v-if="column.info.uiMeta.uiField === 'file'"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          :prepend-icon="column.info.uiMeta.uiIcon || 'mdi-file'"
                          :rules="getRequiredRules(column)"
                          outlined
                          dense
                        />

                        <ImageInput
                          v-if="column.info.uiMeta.uiField === 'imagefile'"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          :rules="getRequiredRules(column)"
                          @onLocation="(ll) => setLocation(column, ll)"
                        />
                        
                        <v-select
                          v-if="column.info.uiMeta.uiField === 'multiselect'"
                          v-model="form[column.value]"
                          :items="options[column.info.uiMeta.linkedWith || column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          :item-text="keyLabel[column.info.uiMeta.linkedWith || column.value] ? keyLabel[column.info.uiMeta.linkedWith || column.value].label : 'label'"
                          :item-value="keyLabel[column.info.uiMeta.linkedWith || column.value] ? keyLabel[column.info.uiMeta.linkedWith || column.value].key : '_id'"
                          :rules="getRequiredRules(column)"
                          multiple
                          chips
                        ></v-select>

                        <v-select
                          v-if="column.info.uiMeta.uiField === 'select'"
                          v-model="form[column.value]"
                          :items="options[column.info.uiMeta.linkedWith || column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          :item-text="keyLabel[column.info.uiMeta.linkedWith || column.value] ? keyLabel[column.info.uiMeta.linkedWith || column.value].label : 'label'"
                          :item-value="keyLabel[column.info.uiMeta.linkedWith || column.value] ? keyLabel[column.info.uiMeta.linkedWith || column.value].key : '_id'"
                          :rules="getRequiredRules(column)"
                        ></v-select>

                        <v-text-field
                          class="mx-0"
                          v-if="column.info.uiMeta.uiField === 'icon'"
                          v-model="form[column.value]"
                          :label="`${column.info.required ? '*' : ''} ${column.text}`"
                          :rules="getRequiredRules(column)"
                        ></v-text-field>

                        <div
                          v-if="column.info.uiMeta.uiField === 'json'"
                        >
                          <label>
                            {{ `${column.info.required ? '*' : ''} ${column.text}` }}
                          </label>
                          <!--
                          <VueJSONEditor
                            v-model="form[column.value]"
                          />
                          -->
                          <monaco-editor
                            language="json"
                            v-model="form[column.value]"
                            :reload-editor="dialog"
                          />
                        </div>

                        <div
                          v-if="column.info.uiMeta.uiField === 'content'"
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
                <v-spacer />
                <v-btn :disabled="isSaving" color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn :disabled="isSaving" color="blue darken-1" text @click="save">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-for="(column, cidx) in headers" v-slot:[`item.${column.value}`]="{ item }">
        <div :key="cidx">
          <div
            v-if="column.info.uiMeta.uiField === 'imagefile' && isImage(item[column.value])"
          >
            <a :href="getFilePath(item[column.value].path)" target="_blank" rel="noopener noreferrer">
              <img :src="getFilePath(item[column.value].path)" alt="Image" style="max-width: 100px;max-height: 100px;">
            </a>
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'file' && isAudioFile(item[column.value])"
          >
            <audio v-if="item[column.value]" :src="getFilePath(item[column.value].path)" controls />
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'file'"
          >
            <a v-if="item[column.value]" :href="getFilePath(item[column.value].path)" target="_blank" rel="noopener noreferrer">
              <v-icon>mdi-link</v-icon>
            </a>
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'content'"
          >
            <div v-html="item[column.value]" style="max-height: 70px; overflow-y:scroll; background-color: rgba(1,1,1,0.1); padding: 0.2em; margin: 0.2em;" ></div>
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'multiselect'"
          >
            <v-chip v-for="item in item[column.value]" :key="item">
              {{ getReadableOption(column.value, item) }}
            </v-chip>
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'array' || column.info.uiMeta.uiField === 'stringarray'"
          >
            <v-chip v-for="(item, svidx) in getReadableText(column, item)" :key="svidx" x-small>
              {{ item }}
            </v-chip>
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'select'"
          >
            <div v-if="!isArray(column, item)">
              <v-chip x-small>
                {{ getReadableText(column, item) }}
              </v-chip>
            </div>
            <div v-else>
              <v-chip x-small v-for="(item, svidx) in getReadableText(column, item)" :key="svidx">
                {{ item }}
              </v-chip>
            </div>
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'boolean'"
          >
              <v-icon color="green" v-if="item[column.value]">mdi-checkbox-marked</v-icon>
              <v-icon color="orange" v-else>mdi-checkbox-blank</v-icon>
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'json'"
          >
            {{ keysOf(item[column.value]) }}
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'icon'"
          >
            <v-icon>{{ item[column.value] }} </v-icon>
          </div>
          <div
            v-else-if="column.info.uiMeta.uiField === 'latlong'"
          >
            <a v-if="item[column.value]" :href="getMapsURL(item[column.value])" target="_blank" rel="noopener noreferrer">
              <v-icon>mdi-map-marker-outline</v-icon>
            </a>
            <span v-else>
              <v-icon>mdi-map-marker-off-outline</v-icon>
            </span>
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
  </div>
</template>

<script>
import { mapState } from 'vuex';

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import LatLong from './forms/LatLong.vue';
// import VueJSONEditor from './forms/VueJSONEditor.vue';
import MonacoEditor from './forms/MonacoEditor.vue';
import ImageInput from './forms/ImageInput.vue';
import StringArray from './forms/StringArray.vue';
import Swal from 'sweetalert2';
import { quillEditor } from 'vue-quill-editor'
import { capitalize, uploadImage } from '../utils';


export default {
  name: '',
  components: {
    MonacoEditor,
    LatLong,
    // VueJSONEditor,
    ImageInput,
    StringArray,
    quillEditor
  },
  props: {
    title: {
      type: String,
      default: 'Item'
    },
    resource: {
      type: String,
      default: 'Item'
    }
  },
  data: () => ({
    headers: [],
    items: [],
    
    isLoading: false,
    totalCount: 0,
    tableOptions: {},

    form: {},
    formIndex: -1,
    dialog: false,

    options: {},
    keyLabel: {},

    valid: false,
    isSaving: false,
    noRules: [],
    selectedHeaders: [],
    // /*
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
    // */
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
    },
    ...mapState({
      resourceInfo(state) {
        return Object.keys((state[this.resource] || {}).resourceInfo || [])
          .map(key => ({text: capitalize(key.replace(/_/g, ' ')), value: key, info: state[this.resource].resourceInfo[key]}))
      },
      resourceItems(state) {
        return state[this.resource].items;
      }
    })
  },
  watch: {
    resource() {
      this.loadResourceInfo();
    },
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
    },
    tableOptions: {
      handler () {
        this.getDataFromApi();
      },
      deep: true,
    }
  },
  mounted() {
    this.loadResourceInfo();
  },
  methods: {
    keysOf(obj){
      let data;
      try {
        data = JSON.parse(obj);
      } catch(error) {
        data = []
      }
      return Object.keys(data).join(', ');
    },
    async loadResourceInfo() {
      const headersInfo = await this.getItemsInfo();
      this.headers = Object.keys((headersInfo || {}) || [])
          .map(key => {
            // this.form[key] = ''; // TODO
            return ({
              text: capitalize(key.replace(/_/g, ' ')),
              value: key,
              info: headersInfo[key]
            })
          });
      const linkedResources = this.resourceInfo
        .filter(res => res.info.uiMeta.linkedWith)
        .map(res => ({
          name: res.info.uiMeta.linkedWith,
          keyLabel: res.info.uiMeta.keyLabel
        }));
      await this.loadLinkedResources(linkedResources);
      this.updateHeaders();
      this.getDataFromApi();
    },
    async loadLinkedResources(resources) {
      await Promise.all(resources.map(async (resource) => {
        try {
          const resourceInfo = await this.$store.dispatch(`${resource.name}/getItems`);
          this.$set(this.keyLabel, resource.name, resource.keyLabel);
          this.$set(this.options, resource.name, resourceInfo);
        } catch (error) {
          window.console.log(error);
        }
      }));
      return {
        keyLabel: this.keyLabel,
        options: this.options
      }
    },
    async getDataFromApi() {
      this.isLoading = true;
      // { sortBy, sortDesc, page, itemsPerPage }
      const { page, itemsPerPage } = this.tableOptions;
      const pageInfo = await this.getItems(page, itemsPerPage);
      this.totalCount = pageInfo.totalCount;
      this.items = pageInfo.pageItems;
      this.isLoading = false;
    },
    getItems(page, itemsPerPage) {
      return this.$store.dispatch(`${this.resource}/getPaginatedItems`, {page, itemsPerPage});
    },
    getItemsInfo() {
      return this.$store.dispatch(`${this.resource}/getResourceInfo`);
    },
    updateHeaders() {
      if (this.headers.length) {
        let columns = [];
        try {
          columns = JSON.parse(localStorage.getItem('$ADMIN_TABLE'))[this.$route.name];
          if (!columns) {
            columns = [...this.headers.filter((col, idx) => idx < 3).map(col => col.value)];
          }
        } catch (error) {
          columns = [...this.headers.filter((col, idx) => idx < 3).map(col => col.value)];
        }
        this.selectedHeaders = columns;
      }
    },
    getRequiredRules(column) {
      if (column.info.required) {
        return [v => !!v || `${column.text} is required`]
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
    close() {
      this.dialog = false;
    },
    open() {
      this.form = {};
      this.dialog = true;
    },
    async save() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        const isEditing = this.formIndex > -1;
        this.$set(this, 'isSaving', true);
        const result = await this.saveItem({...this.form}, isEditing);
        this.$set(this, 'isSaving', false);
        if (result.status === 201 || result.status === 202) {
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
        const delResp = await this.deleteItem(item);
        await Swal.fire({
          title: 'Delete item',
          text: delResp
            ? 'Item deleted successfully'
            : `Error deleting item. ${delResp.message}`,
          icon: delResp? 'success' : 'warning',
        });
      }
    },
    isArray(column, item){
      return Array.isArray(item[column.value]);
    },
    getReadableText(column, item){
      const linkedWith = column.info.uiMeta.linkedWith;
      const value = item[column.value];
      if (this.options[linkedWith]) {
        const kl = this.keyLabel[linkedWith];
        const choosen = this.options[linkedWith].filter(option => option[kl.key] === value).pop();
        if (choosen) {
          return choosen[kl.label];
        }
      }
      return item[column.value];
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
    getMapsURL(latlon) {
      if (latlon) {
        return `https://www.google.com/maps/@${latlon.latitude},${latlon.longitude},15z`;
      }
      return '#';
    },
    setLocation(column, ll) {
      if (column.info.uiMeta && column.info.uiMeta.locationTarget) {
        this.$set(this.form, column.info.uiMeta.locationTarget, {...ll});
      }
    },
    getFilePath(path){
      return path.split('?')[0];
    },
    isImage(file) {
      if (file && file.path) {
        const [ext] = file.path.split('?')[0].split(/\./g).reverse();
        if (['jpg', 'png', 'jpeg', 'gif', 'webm'].includes(ext.toLowerCase())) {
          return true
        }
      }
      return false;
    },
    isAudioFile(file) {
      if (file && file.path) {
        const [ext] = file.path.split('?')[0].split(/\./g).reverse();
        if (['mp3', 'wav', 'ogg'].includes(ext.toLowerCase())) {
          return true
        }
      }
      return false;
    },
    async saveItem(item, isEditing) {
      try {
        const filesContent = {}
        const validFiles = this.resourceInfo
          .filter(resource => ['imagefile', 'file'].includes(resource.info.uiMeta.uiField));
        validFiles.forEach(resource => {
            const now = (new Date()).getTime();
            const file = item[resource.value];
            filesContent[resource.value] = file;
            if (file && file.name) {
              item[resource.value] = {
                name: `${now}_${file.name.replace(' ','_')}`,
                type: file.type
              };
            }
          })
          ;
        let result;
        if (isEditing) {
          result = await this.updateItem(item)
        } else {
          result = await this.createItem(item);
        }
        let uploadsResult = false;
        if (result && result.status > 199 && result.status < 300) {
          const fileUploads = await Promise.all(validFiles.map(resource => {
            return uploadImage({
              file: filesContent[resource.value],
              target: result[result.$meta.model.name][resource.value].path
            })
          }));
          uploadsResult = fileUploads.reduce((acc, curr) => acc && curr, true);
        }
        if (result.status === 201 || result.status === 202) {
          await Swal.fire({
            icon: 'success',
            title: 'Awesome',
            text: `${this.resource} item created properly. ${result.message}`
          })
          if (!uploadsResult && validFiles.length) {
            await Swal.fire({
              icon: 'warning',
              title: 'Warning',
              text: `${this.resource} item created but attached files need to be verified.`
            });
          }
        } else {
          if (/timeout of .+ exceeded/.test(result.message)) {
            await Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: `${this.resource} item can't be created. Your internet connection is very slow.`
            });
          } else {
            await Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: `${this.resource} item can't be created. ${result.message}`
            });
          }
        }
        await this.getItems();
        return result;
      } catch (error) {
        window.console.log(error);
        return null;
      }
    },
    async createItem(item) {
      try {
        const resp = await this.$store.dispatch(`${this.resource}/addItem`, item);
        this.getDataFromApi();
        return resp;
      } catch (error) {
        window.console.log(error);
      }
    },
    async updateItem(item) {
      try {
        const resp = await this.$store.dispatch(`${this.resource}/updateItem`, item);
        this.getDataFromApi();
        return resp;
      } catch (error) {
        window.console.log(error);
      }
    },
    async deleteItem(item) {
      try {
        const resp = await this.$store.dispatch(`${this.resource}/deleteItem`, item);
        this.getDataFromApi();
        return resp;
      } catch (error) {
        window.console.log(error);
      }
    }
  }
};
</script>

<style>

.editor {
  width: 600px;
  height: 800px;
}

</style>