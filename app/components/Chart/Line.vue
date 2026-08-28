<script setup lang="ts">
import "./echarts";

const option = shallowRef<ECOption>({
  animationDuration: 700,
  backgroundColor: "transparent",
  color: ["#5BAE8E", "#80d6de"],
  tooltip: {
    trigger: "axis",
    confine: true,
  },
  grid: {
    top: 8,
    right: 16,
    bottom: 28,
    left: 16,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: ["Wed", "Thu", "Fri", "Sat", "Sun"],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "#5BAE8E", fontSize: 11 },
  },
  yAxis: {
    type: "value",
    show: false,
  },
  series: [
    {
      type: "line",
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 3 },
      areaStyle: { color: "rgba(49, 181, 194, 0.2)" },
      data: [42, 74, 61, 89, 76],
    },
  ],
});
</script>

<template>
  <VChartFull class="chart-line" :option="option" autoresize />
</template>

<style scoped>
.chart-line {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
</style>
