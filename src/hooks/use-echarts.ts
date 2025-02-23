import { LineChart, PieChart, RadarChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  RadarChart,
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent
]);

/**
 * 正常渲染图形
 */
function rendering(dom: HTMLElement, options: any) {
  const theChart = echarts.init(dom, options.darkMode || false);
  theChart.setOption(options);
}

/**
 * 渲染图表
 */
export function useEcharts(config: { dom: HTMLElement; options?: any }) {
  const options = {};

  rendering(config.dom, { ...options, ...config.options });
}
