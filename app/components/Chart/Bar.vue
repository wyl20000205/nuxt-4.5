<script setup lang="ts">
  import "./echarts";

  type ChartRow = [period: string, inputTokens: number, outputTokens: number];

  const defaultSource: ChartRow[] = [
    ["Mon", 42, 28],
    ["Tue", 58, 36],
    ["Wed", 71, 44],
    ["Thu", 63, 39],
    ["Fri", 86, 57],
    ["Sat", 74, 48],
  ];

  const props = defineProps<{
    source?: ChartRow[];
  }>();

  const isMobile = ref(false);
  let mobileMedia: MediaQueryList | undefined;

  const chartSource = computed(() => {
    const source = props.source?.length ? props.source : defaultSource;

    return isMobile.value ? source.slice(0, 6) : source;
  });

  function handleMobileChange(event: MediaQueryListEvent) {
    isMobile.value = event.matches;
  }

  onMounted(() => {
    mobileMedia = window.matchMedia("(max-width: 520px)");
    isMobile.value = mobileMedia.matches;
    mobileMedia.addEventListener("change", handleMobileChange);
  });

  onBeforeUnmount(() => {
    mobileMedia?.removeEventListener("change", handleMobileChange);
  });

  function getData(): ECOption {
    return {
      animationDuration: 600,
      backgroundColor: "transparent",
      grid: {
        left: 12,
        right: 12,
        top: 18,
        bottom: 18,
      },
      tooltip: {
        trigger: "axis",
        confine: true,
        axisPointer: {
          type: "shadow",
        },
        valueFormatter: (value) => `${value}K`,
      },
      dataset: {
        dimensions: ["period", "Input Token", "Output Token"],
        source: chartSource.value,
      },
      xAxis: {
        type: "category",
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#58B090" } },
      },
      series: [
        {
          name: "Input Token",
          type: "bar",
          barMaxWidth: 18,
          itemStyle: { color: "#5BAE8E", borderRadius: [4, 4, 0, 0] },
        },
        {
          name: "Output Token",
          type: "bar",
          barMaxWidth: 18,
          itemStyle: { color: "#7b96eb", borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }

  const option = computed(getData);

</script>

<template>
  <VChartFull class="chart-bar" :option="option" autoresize />
</template>

<style scoped>
  .chart-bar {
    display: block;
    width: 100%;
    height: 100%;
    min-width: 0;
  }
</style>
