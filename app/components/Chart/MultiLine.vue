<script setup lang="ts">
import "./echarts";

const option = shallowRef<ECOption>({
  animationDuration: 700,
  backgroundColor: "#ffffff",
  color: ["#5BAE8E", "#58B293", "#FF9949", "#849FEA"],
  tooltip: {
    trigger: "axis",
    confine: true,
    axisPointer: {
      type: "line",
    },
    valueFormatter: (value) => `${value}K`,
  },
  grid: {
    top: 46,
    right: 20,
    bottom: 18,
    left: 20,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
    show: false,
  },
  yAxis: {
    type: "value",
    show: false,
    splitNumber: 4,
    splitLine: {
      show: true,
      lineStyle: { color: "#edf0f5" },
    },
  },
  series: [
    {
      name: "推理请求",
      type: "line",
      smooth: true,
      showSymbol: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 3 },
      data: [51, 72, 76, 61, 48, 73],
    },
    {
      name: "缓存命中",
      type: "line",
      smooth: true,
      showSymbol: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 3 },
      data: [45, 45, 49, 47, 65, 61],
    },
    {
      name: "输出 Token",
      type: "line",
      smooth: true,
      showSymbol: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 3 },
      data: [22, 33, 36, 15, 30, 43],
    },
    {
      name: "输入 Token",
      type: "line",
      smooth: true,
      showSymbol: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 3 },
      data: [35, 54, 61, 32, 40, 28],
    },
  ],
});
</script>

<template>
  <VChartFull class="chart-multi-line" :option="option" autoresize />
</template>

<style scoped>
.chart-multi-line {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
</style>
