<script setup lang="ts">
import "../Chart/echarts";

const option = shallowRef<ECOption>({
  animationDuration: 600,
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
    confine: true,
    axisPointer: { type: "shadow" },
    valueFormatter: (value) => `${value}K`,
  },
  grid: {
    top: 10,
    right: 8,
    bottom: 8,
    left: 8,
  },
  xAxis: {
    type: "category",
    data: ["08:00", "10:00", "12:00", "14:00", "16:00"],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
  },
  yAxis: {
    type: "value",
    max: 120,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { lineStyle: { color: "#edf0f5" } },
  },
  series: [
    {
      name: "Input Token",
      type: "bar",
      barMaxWidth: 14,
      itemStyle: { color: "#43bbc6", borderRadius: [4, 4, 0, 0] },
      data: [36, 54, 48, 71, 63],
    },
    {
      name: "Output Token",
      type: "bar",
      barMaxWidth: 14,
      itemStyle: { color: "#7895e8", borderRadius: [4, 4, 0, 0] },
      data: [19, 31, 27, 42, 36],
    },
  ],
});
</script>

<template>
  <VChartFull class="echart-realtime-token" :option="option" autoresize />
</template>

<style scoped>
.echart-realtime-token {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
</style>
