<script lang="ts" setup>
import { useEcharts } from "@/hooks/use-echarts";

const database = await Database.create();
const config = await Database.get<IConfig>(database, Const.DB_CONFIG, Const.DB_KEY_CONFIG);
const data = ref(await Database.get<IRecord>(database, Const.DB_RECORD, config.Y));

type Grouped = { [text: string]: IBalance[] };

function groupByType(data: any) {
  const grouped: Grouped = {};

  for (const key in data.items) {
    if (data.items.hasOwnProperty(key)) {
      const balances = data.items[key].balance;
      if (balances) {
        balances.forEach((balance: IBalance) => {
          const { text } = balance;
          if (!grouped[text]) grouped[text] = [];
          grouped[text].push(balance);
        });
      }
    }
  }

  return grouped;
}

const calcTotalCost = (obj: Grouped) => {
  function recursiveSum(o: Grouped): number {
    return Object.values(o).reduce((total, value) => {
      if (Array.isArray(value)) {
        return (
          total +
          value.reduce((sum: number, item: IBalance) => {
            return sum + (item.hasOwnProperty("cost") ? Number(item.cost) : 0);
          }, 0)
        );
      } else if (typeof value === "object" && value !== null) {
        return total + recursiveSum(value);
      }
      return total;
    }, 0);
  }

  return recursiveSum(obj);
};

function calcSize(obj: Grouped): number {
  function recursiveCount(o: Grouped): number {
    return Object.values(o).reduce((total, value) => {
      if (Array.isArray(value)) {
        return total + value.length;
      } else if (typeof value === "object" && value !== null) {
        return total + recursiveCount(value);
      }
      return total;
    }, 0);
  }

  return recursiveCount(obj);
}

const calcTotalBudget = (items: IRecord["items"]) => {
  return Object.values(items).reduce((total, item) => total + Number(item.budget), 0);
};

const grouped = groupByType(data.value);

const calcCost = (balances: IBalance[]) => {
  return balances.reduce((total, item) => total + Number(item.cost), 0);
};

const calcTotalSurplus = (items: IRecord["items"]) => {
  return calcTotalBudget(items) - calcTotalCost(grouped);
};

const isChart = ref(null);

function formatData(data: any, max = 36) {
  return Object.entries(data)
    .slice(0, max)
    .map(([key, value]) => ({
      value: calcCost(value as any),
      name: key
    }));
}

onMounted(() => {
  if (!config.isChart) {
    return;
  }

  const createChart = (dom: any, data: any) => {
    useEcharts({
      dom,
      options: {
        legend: {
          orient: "vertical",
          left: "left",
          textStyle: {
            color: "#E5EAF3"
          }
        },
        series: [
          {
            label: {
              show: false
            },
            center: ["65%", "50%"],
            type: "pie",
            radius: "50%",
            data: formatData(data)
          }
        ]
      }
    });
  };

  if (grouped) {
    createChart(isChart.value, grouped);
  }
});
</script>

<template>
  <div>
    <div class="mb-4">
      <div>预算统计</div>
      <div class="text-0.8rem text-text-secondary">统计 {{ config.Y }} 全年的预算情况</div>
    </div>
    <div class="mb-4 f-c-b flex-wrap">
      <div class="flex-basis-33.33% max-w-33.33%">
        <div class="text-0.8rem f-c-s">
          <div class="i-tabler-coin mr-1"></div>
          全年预算 ({{ Object.keys(data.items).length }})
        </div>
        <div class="text-gray text-0.8rem">{{ calcTotalBudget(data.items).toFixed(2) }}</div>
      </div>
      <div class="flex-basis-33.33% max-w-33.33%">
        <div class="text-0.8rem f-c-s">
          <div class="i-tabler-minus mr-1"></div>
          全年计划 ({{ calcSize(grouped) }})
        </div>
        <div class="text-red text-0.8rem">{{ calcTotalCost(grouped).toFixed(2) }}</div>
      </div>
      <div class="flex-basis-33.33% max-w-33.33%">
        <div class="text-0.8rem f-c-s">
          <div class="i-tabler-plus-minus mr-1"></div>
          全年剩余
        </div>
        <div class="text-gray text-0.8rem">
          {{ calcTotalSurplus(data.items).toFixed(2) }}
        </div>
      </div>
    </div>
    <template v-if="grouped">
      <div class="mb-4">
        <div>计划项</div>
        <div class="text-0.8rem text-text-secondary">有 {{ Object.keys(grouped).length }} 类支出</div>
      </div>
      <el-table :data="Object.entries(grouped)" border stripe>
        <el-table-column label="名称">
          <template v-slot="scope">
            {{ scope.row[0] }}
          </template>
        </el-table-column>
        <el-table-column label="计划数">
          <template v-slot="scope">
            {{ scope.row[1].length }}
          </template>
        </el-table-column>
        <el-table-column label="总金额">
          <template v-slot="scope">
            {{ calcCost(scope.row[1]).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4" ref="isChart" style="width: 90vw; height: 50vh"></div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
