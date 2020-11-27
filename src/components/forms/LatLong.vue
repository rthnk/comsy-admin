<template>
  <div>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="info.latitude"
          class="pa-2"
          label="Latitude"
          @change="updateValue"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="info.longitude"
          class="pa-2"
          label="Longitude"
          @change="updateValue"
        ></v-text-field>
      </v-col>
    </v-row>
    <div id="Map" />
  </div>
</template>

<script>
const TOKEN = 'pk.eyJ1IjoiY29ycGNpdWRhZGxhdGVudGUiLCJhIjoiY2tnOHUwM2J0MDFxYjJ6cDV1dGN2eGZzcSJ9.OQFLINe2UTN6m-K2yyFg9Q';

export default {
  name: 'LatLong',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    info: {},
    map: null,
  }),
  watch: {
    value(newVal) {
      if (newVal.latitude && newVal.longitude) {
        if (this.marker) {
          this.marker.setLatLng([newVal.latitude, newVal.longitude]);
        }
        if (this.map) {
          this.map.setView([newVal.latitude, newVal.longitude]);
        }
      }
      this.info = newVal;
    }
  },
  created() {
    if (this.value) {
      this.info = this.value;
    } else {
      this.info = {
        latitude: null,
        longitude: null,
      };
    }
  },
  mounted() {
    this.initMap();
    this.updateToCurrentPosition();
    this.$nextTick(() => {
      this.map.invalidateSize(true);
    })
  },
  methods: {
    getCurrentPosition() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            resolve(position.coords);
          }, (error) => {
            console.log(error);
            reject(error);
          });
        } else {
          reject(new Error('Geolocation is not supported.'))
        }
      });
    },
    initMap() {
      let posArray = [4.7906272149218285, -75.68756103515626];
      this.map = window.L.map("Map")
        .setView(posArray, 15)
        ;
      window.L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
        {
          maxZoom: 18,
          attribution: "Admin",
          id: "mapbox/streets-v11",
          accessToken: TOKEN, 
        }
      ).addTo(this.map);
      this.marker = window.L.marker(posArray).addTo(this.map);
      this.map.zoomControl.setPosition("bottomright");
      this.map.on("click", e => {
        this.$set(this.info, 'longitude', e.latlng.lng);
        this.$set(this.info, 'latitude', e.latlng.lat);
        this.marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      });
      window.map = this.map;
    },
    async updateToCurrentPosition() {
      const current = await this.getCurrentPosition();
      this.$set(this.info, 'longitude', current.longitude);
      this.$set(this.info, 'latitude', current.latitude);
      this.map.setView([current.latitude, current.longitude]);
    },
    updateValue() {
      this.map.setView([this.info.latitude, this.info.longitude]);
      this.marker.setLatLng([this.info.latitude, this.info.longitude]);
      this.$emit('input', {...this.info});
    }
  }
}
</script>

<style lang="scss">
#Map {
  min-height: 200px;
}
</style>