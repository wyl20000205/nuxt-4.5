<script setup lang="ts">
import "../Chart/echarts";

const option = shallowRef<ECOption>({
  animationDuration: 650,
  backgroundColor: "transparent",
  color: ["#2cbe74", "#31b5c2", "#7895e8", "#9b7be8", "#ffad5b"],
  tooltip: {
    trigger: "item",
    confine: true,
    valueFormatter: (value) => `${value}K Token`,
  },
  series: [
    {
      name: "上下文 Token",
      type: "pie",
      radius: ["43%", "70%"],
      center: ["50%", "46%"],
      itemStyle: {
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: {
        scaleSize: 5,
        label: {
          show: true,
          position: "center",
          color: "#52616b",
          fontSize: 11,
          fontWeight: 600,
          formatter: "{b}\n{d}%",
        },
      },
      data: [
        { value: 25, name: "系统提示词" },
        { value: 39, name: "用户输入" },
        { value: 47, name: "历史上下文" },
        { value: 31, name: "工具结果" },
        { value: 22, name: "模型输出" },
      ],
    },
  ],
});
</script>

<template>
  <VChartFull class="echart-context-token" :option="option" autoresize />
</template>

<style scoped>
.echart-context-token {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
</style>
