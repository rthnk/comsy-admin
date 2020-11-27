<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app clipped data-intro="Colecciones de datos disponibles.">
      <v-list
        dense
      >
        <v-list-item v-for="(section, idx) in validSections" :key="idx" :to="section.link">
          <v-list-item-action>
            <v-icon>{{ section.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ section.label }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left :dark="dark">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu
        bottom
        left
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon data-intro='Menu de usuarios'>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title @click="closeSession"> Close Session</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import introJs from 'intro.js';
import 'intro.js/minified/introjs.min.css';

export default {
  name: "Admin",
  data: () => ({
    drawer: null,
    sections: [
      {
        link: '/admin/root',
        icon: 'mdi-view-dashboard',
        label: 'Dashboard',
        roles: ['all']
      },
      {
        link: '/admin/posts',
        icon: 'mdi-image-multiple',
        label: 'Posts',
        roles: ['admin', 'writer']
      },
      {
        link: '/admin/galleries',
        icon: 'mdi-image-multiple',
        label: 'Galleries',
        roles: ['admin', 'editor']
      },
      {
        link: '/admin/images',
        icon: 'mdi-image',
        label: 'Images',
        roles: ['admin', 'editor']
      },
      {
        link: '/admin/subjects',
        icon: 'mdi-shape',
        label: 'Subjects',
        roles: ['admin', 'editor']
      },
      {
        link: '/admin/users',
        icon: 'mdi-account-multiple',
        label: 'Users',
        roles: ['admin']
      },
      {
        link: '/admin/settings',
        icon: 'mdi-cog',
        label: 'Settings',
        roles: ['admin']
      }
    ]
  }),
  computed: {
    ...mapState({
      dark: ({settings}) => settings.isDark,
      user: ({auth}) => auth.user,
      validSections ({auth}) {
        return this.sections.filter(section => section.roles.includes(auth.user.role) || section.roles.includes('all'))
      },
    })
  },
  created () {
    if (this.dark) {
      this.$vuetify.theme.dark = true;
    }
  },
  methods: {
    startHelp(){
      introJs().start();
    },
    closeSession() {
      this.logout();
      this.$router.push('/');
    },
    ...mapActions({
      logout: 'auth/logout'
    })
  }
};
</script>

<style>
</style>