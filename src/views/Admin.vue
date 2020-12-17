<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      data-intro="Colecciones de datos disponibles."
    >
      <v-list dense>
        <v-list-item :to="'/admin/root'">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-group
          :value="true"
          prepend-icon="mdi-file-document-edit-outline"
          no-action
        >
          <template v-slot:activator>
            <v-list-item-title>Collections</v-list-item-title>
          </template>

          <v-list-group
            v-for="(sectionInfo, sectionKey) in sections"
            :key="sectionKey"
            v-show="sectionInfo && sectionInfo.length"
            no-action
            sub-group
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title v-text="sectionKey"></v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              v-for="(section, idx) in sectionInfo"
              :key="idx"
              :to="section.link"
            >
              <v-list-item-action>
                <v-icon>{{ section.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ section.label }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left :dark="dark">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon data-intro="Menu de usuarios">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-avatar
                  color="primary"
                  size="56"
                >
                  {{avatarLetters}}
                </v-avatar>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{user.firstname}} {{user.lastname}}</v-list-item-title>
                <v-list-item-subtitle>{{user.username}} as {{ user.role }}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn icon @click="closeSession">
                  <v-icon>mdi-exit-run</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list dense>
            <v-list-item-group color="primary">
              <v-list-item
                v-for="(item, i) in userItems"
                :key="i"
                @click="menuAction(item)"
              >
                <v-list-item-icon>
                  <v-icon v-text="item.icon"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="item.text"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn text @click="menu = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-app-bar>

    <v-main v-if="!['root', 'settings'].includes(resource)">
      <ResourceManager :resource="resource" :label="resource" />
    </v-main>

    <v-main v-if="resource === 'root'">
      <AdminRoot />
    </v-main>

    <v-main v-if="resource === 'settings'">
      <SettingsManager />
    </v-main>

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState, mapActions } from "vuex";
import routesInfo from '../routesInfo';
import AdminRoot from "../components/AdminRoot.vue";
import ResourceManager from "../components/ResourceManager.vue";
import SettingsManager from "../components/SettingsManager.vue";
import introJs from "intro.js";
import "intro.js/minified/introjs.min.css";
import { capitalize } from '../utils';

export default {
  name: "Admin",
  components: {
    AdminRoot,
    ResourceManager,
		SettingsManager,
  },
  data: () => ({
    drawer: null,
    userItems: [
      {
        id: 'settings',
        icon: 'mdi-cog',
        text: 'Settings'
      },
      {
        id: 'help',
        icon: 'mdi-help-box',
        text: 'Help'
      },
    ],
  }),
  computed: {
    resource() {
      return this.$route.params.resource || 'root';
    },
    ...mapState({
      dark: ({ settings }) => settings.isDark,
      resources: ({resources}) => resources.items,
      collections: ({collections}) => collections.items.reduce((acc, collection) => {
        acc[collection.name.toLowerCase()] = collection;
        return acc;
      }, {}),
      sections() {
        const baseCategory = 'More';
        // console.log(this.resources);
        // console.log(this.collections);
        const data = this.resources.map(localResource => {
          const elements = routesInfo.filter(resource => resource.resource === localResource);
          if (elements[0]) {
            const element = elements[0];
            element.link = `/admin/${localResource}`;
            element.category = capitalize(element.category)
            return element;
          } else {
            const collection = this.collections[localResource] || {};
            return {
              link: `/admin/${localResource}`,
              resource: localResource,
              category: collection.category || baseCategory,
              icon: collection.icon || "mdi-code-array",
              label: collection.label || capitalize(localResource),
              roles: collection.allowed_for || ['admin'],
            }
          }
        })
          .reduce((acc, section) => {
            if (!section) {
              return acc;
            }
            const category = section.category || baseCategory;
            if (!acc[category]) {
              acc[category] = [];
            }
            if (section.roles.includes(this.user.role) || section.roles.includes("all")) {
              acc[category].push(section);
            }
            return acc;
          }, {})
          ;
        const more = data[baseCategory];
        delete data[baseCategory];
        data[baseCategory] = more;
        return data;
      },
      user: ({ auth }) => auth.user,
      avatarLetters: ({ auth }) => `${
        (auth.user.firstname || '').substring(0,1) || 'N'
      }${
        (auth.user.lastname || '').substring(0,1) || 'N'
      }`.toUpperCase()
    })
  },
  async created() {
    await this.getCollections();
    await this.getResources();
    if (this.dark) {
      this.$vuetify.theme.dark = true;
    }
  },
  methods: {
    startHelp() {
      introJs().start();
    },
    menuAction(item) {
      if (item.id === 'help') {
        this.startHelp();
      } else if (item.id === 'settings') {
        if (this.$route.name !== 'Settings') {
					this.$router.push({name: 'AdminResource', params: {resource: 'settings'}});
        }
      }
      // /admin/settings
    },
    closeSession() {
      this.logout();
      this.$router.push("/");
    },
    ...mapActions({
      logout: "auth/logout",
      getResources: 'resources/getItems',
      getCollections: 'collections/getItems'
    })
  }
};
</script>

<style>
</style>