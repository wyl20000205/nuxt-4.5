<script setup lang="ts">
import "./echarts";

const option = shallowRef<ECOption>({
  animationDuration: 700,
  backgroundColor: "transparent",
  color: ["#31b5c2", "#5b8def", "#9b7be8"],
  tooltip: {
    trigger: "item",
    confine: true,
    valueFormatter: (value) => `${value}%`,
  },
  series: [
    {
      name: "Token 消耗占比",
      type: "pie",
      radius: ["43%", "70%"],
      center: ["50%", "46%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderColor: "rgba(255, 255, 255, 0.92)",
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      emphasis: {
        scaleSize: 4,
        label: {
          show: true,
          color: "#52616b",
          fontSize: 12,
          fontWeight: 600,
          formatter: "{b}\n{d}%",
        },
      },
      data: [
        { value: 58, name: "OpenAI" },
        { value: 27, name: "Grok" },
        { value: 15, name: "DeepSeek" },
      ],
    },
  ],
});
</script>

<template>
  <VChartFull class="chart-pie" :option="option" autoresize />
</template>

<style scoped>
.chart-pie {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
}
</style>
