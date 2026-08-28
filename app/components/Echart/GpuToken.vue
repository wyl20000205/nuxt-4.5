<script setup lang="ts">
import "../Chart/echarts";

const option = shallowRef<ECOption>({
  animationDuration: 650,
  backgroundColor: "transparent",
  color: ["#5BAE8E"],
  tooltip: {
    trigger: "axis",
    confine: true,
    valueFormatter: (value) => `${value}K Token/s`,
  },
  grid: {
    top: 16,
    right: 10,
    bottom: 10,
    left: 10,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: ["08:00", "10:00", "12:00", "14:00", "16:00"],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
  },
  yAxis: {
    type: "value",
    min: 40,
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { lineStyle: { color: "#edf0f5" } },
  },
  series: [
    {
      name: "GPU Token 吞吐",
      type: "line",
      smooth: true,
      showSymbol: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: { width: 3 },
      areaStyle: { color: "rgba(49, 181, 194, 0.16)" },
      data: [58, 69, 82, 75, 91],
    },
  ],
});
</script>

<template>
  <VChartFull class="echart-gpu-token" :option="option" autoresize />
</template>

<style scoped>
.echart-gpu-token {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
</style>
