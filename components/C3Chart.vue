<template>
  <div>
    <div :id="options.bindto.slice(1)"></div>

    <svg
      v-if="options.bindto.indexOf('boxplot') >= 0"
      style="height: 0; width: 0; position: absolute;"
    >
      <defs>
        <linearGradient id="lgrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" style="stop-color:rgb(30,30,30);stop-opacity:1" />
          <stop offset="47%" style="stop-color:rgb(30,30,30);stop-opacity:1" />
          <stop offset="49%" style="stop-color:rgb(0,229,255);stop-opacity:1" />
          <stop offset="50%" style="stop-color:rgb(0,229,255);stop-opacity:1" />
          <stop offset="51%" style="stop-color:rgb(0,229,255);stop-opacity:1" />
          <stop offset="53%" style="stop-color:rgb(30,30,30);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(30,30,30);stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

</template>

<script>
import 'c3/c3.min.css'

export default {
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.generateChart()
  },
  updated() {
    this.generateChart()
  },
  methods: {
    generateChart: function() {
      let legend = {}

      if ((this.options.bindto.indexOf('percentile') >= 0) || (this.options.bindto.indexOf('cdf') >= 0)) {
        let vm = this        
        legend = {
          hide: Object.keys(this.options.data.types).filter(x => x.startsWith('bar')),
          item: {
            onclick: function(id) {
              vm.chart.toggle(id)
              vm.chart.toggle('bar' + id)
            }
          }
        }
      }
      this.chart = this.$c3.generate({
        color: {
          pattern: [
            '#00BCD4',
            '#03A9F4',
            '#00E5FF',
            '#00838F',
            '#00BFA5',
            '#1565C0',
          ]
        },
        legend,
        ...this.options
      })
      setTimeout(() => {
        this.chart.resize({
          width: document.querySelector(this.options.bindto).clientWidth
        })
      }, 1)
    }
  }
}
</script>

<style>
path.domain {
  stroke: #00bcd4;
  stroke-width: 1px;
  /* fill: red; */
}
.c3 line {
  stroke: #2dbcad;
  /* stroke-width: 2px; */
}
.tick text {
  font-family: 'Share Tech Mono';
  stroke: #00bcd4;
  /* @TODO Font responsiveness for desktop */
  /* font-size: 0.9rem; */
  /* stroke-width: 1.5px; */
}
.c3-legend-item text {
  stroke: none;
  font-family: 'Share Tech Mono';
  font-weight: bold;
  fill: #00bcd4;
  /* font-size: 1.2rem; */
}
.c3 .c3-axis-y-label,
.c3 .c3-axis-x-label {
  stroke: #2dbcad;
  font-family: 'Share Tech Mono';
  /* font-size: 1rem; */
  /* stroke-width: 1.5px; */
}
.c3-chart-arcs-title {
  font-family: 'Share Tech Mono';
  stroke: #00bcd4;
}
.c3-chart-arc {
  font-family: 'Share Tech Mono';
}
.c3 .c3-tooltip-container {
  color: #00bcd4;
  /* stroke: steelblue; */
  /* fill: chocolate; */
}
.c3 .c3-tooltip td {
  background: rgba(0, 0, 0, 0.99);
}
.c3 .c3-tooltip th {
  background: #00bcd4;
}
.c3 .c3-line {
  /* stroke-width: 6px; */
}
.c3 .c3-circle {
  r: 2.5;
}

/* Boxplot (Candlestick) start */

.c3-bars-low path,
.c3-bars-high path,
.c3-bars-m path {
  stroke-width: 3px;
  shape-rendering: crispEdges;
}

.c3-bars-a1 path,
.c3-bars-a2 path {
  fill: url(#lgrad) !important;
}

.c3-bars-min path {
  fill: transparent !important;
  stroke: transparent !important;
}
/* Boxplot (Candlestick) end */

.c3 .c3-axis-x g,
.c3 .c3-axis-y g {
  /* stroke: red; */
}
.c3 .c3-legend-item-data text {
  /* stroke: red; */
}
.c3 .c3-axis-y-label,
.c3 .c3-axis-x-label {
  /* stroke: red; */
}
.c3 .c3-legend-item {
  /* stroke: steelblue; */
  /* fill: chocolate; */
}

.c3 text.c3-text {
  /* stroke: steelblue;  */
  /* fill: chocolate; */
}

.c3 {
  /* fill: none; */
}

.c3-axis-x,
.c3-axis-y {
  /* stroke: #fff; */
  /* fill: forestgreen; */
}
.c3 path {
  /* fill: darkgoldenrod;
  stroke: white; */
}

.tick text {
  /* fill: cyan;
  stroke: darkcyan; */
}
.c3-axis-x .tick {
  /* fill: #a8a8a8;
  stroke: brown; */
}
.c3-axis-x path,
.c3-axis-x line {
  /* fill: #303130;
 stroke: red; */
}
.c3-axis-y path,
.c3-axis-y line {
  /* fill: fuchsia;
 stroke: darkkhaki; */
}
.c3-legend-item {
  /* fill: #a8a8a8;
 stroke:cornflowerblue; */
}

.c3-chart {
  /* background: yellow; */
}

.c3-chart-line {
}

.c3-chart-lines {
  /* background: yellow; */
}

.c3-chart-bar {
}

.c3-chart-bars {
}

.c3-chart-text {
}

.c3-chart-texts {
  /* fill: yellow;
color: orange; */
}

.c3-chart-arc {
}

.c3-chart-arcs {
}

.c3-chart-arcs-title {
}

.c3-chart-arcs-background {
}

.c3-focused {
}

.c3-region {
}

.c3-regions {
}

.c3-tooltip {
}

.c3-tooltip-name {
}

.c3-shape {
}

.c3-shapes {
}

.c3-line {
}

.c3-lines {
}

.c3-bar {
}

.c3-bars {
}

.c3-circle {
}

.c3-circles {
}

.c3-arc {
}

.c3-arcs {
}

.c3-area {
}

.c3-areas {
}

.c3-empty {
}

.c3-texts {
  /* fill: tomato; */
  /* stroke: turquoise; */
}

.c3-grid {
}

.c3-xgrid {
}

.c3-xgrids {
}

.c3-xgrid-line {
}

.c3-xgrid-lines {
}

.c3-xgrid-focus {
}

.c3-ygrid {
}

.c3-ygrids {
}

.c3-ygrid-line {
}

.c3-ygrid-lines {
}

.c3-axis {
  /* fill: tomato; */
  /* stroke: turquoise; */
}

.c3-axis-x {
}

.c3-axis-x-label {
}

.c3-axis-y {
}

.c3-axis-y-label {
  /* fill: tomato; */
  /* stroke: turquoise; */
}

.c3-axis-y2 {
}

.c3-axis-y2-label {
}

.c3-legend-item {
  /* fill: tomato; */
  /* stroke: turquoise; */
}

.c3-legend-item-event {
}

.c3-legend-item-tile {
}

.c3-legend-item-hidden {
}

.c3-legend-item-focused {
}
</style>