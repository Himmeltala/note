<script lang="ts" setup>
import DeleteRecord from "@/fragments/DeleteRecord.vue";

const database = await Database.create();
const config = await Database.get<IConfig>(database, Const.DB_CONFIG, Const.DB_KEY_CONFIG);
const currY = ref(config.Y);
const currM = ref(config.M);
const data = ref(await Database.get<IRecord>(database, Const.DB_RECORD, currY.value));
const MList = ref(Object.keys(data.value.items));
const YList = ref<string[]>(await Database.keys(database, Const.DB_RECORD));
const risingRate = ref(0);

function calcGrowthRate() {
  if (!data?.value.items[currM.value]) return 0;

  let result: number;
  let lCost = 0;
  let cCost = 0;

  const keys = MList.value.sort((a, b) => Number(a) - Number(b));
  const index = keys.findIndex(item => item === currM.value);
  const isFirst = index === 0;

  if (index !== -1) {
    if (!isFirst) {
      data.value.items[keys[index - 1]].balance.forEach(item => (lCost += Number(item.cost)));
      data.value.items[keys[index]].balance.forEach(item => (cCost += Number(item.cost)));
    }

    result = lCost !== 0 ? (((cCost - lCost) / lCost) * 100 * 10) / 10 : 0;
  } else {
    result = 0;
  }
  return result;
}

function calcTotalCost(data: IBalance[]) {
  let total = 0;
  data.forEach(item => {
    total += Number(item.cost);
  });
  return total;
}

function calcSurplus() {
  if (!data?.value.items[currM.value]) return 0;

  const total = calcTotalCost(data.value.items[currM.value].balance);
  data.value.items[currM.value].surplus = Number(data.value.items[currM.value].budget - total);
  Database.put(database, Const.DB_RECORD, Utils.Objects.raw(data.value), currY.value).then(() => {
    risingRate.value = calcGrowthRate();
  });

  return data.value.items[currM.value].surplus;
}

function calcOutcome() {
  if (!data?.value.items[currM.value]) return 0;
  return calcTotalCost(data.value.items[currM.value].balance);
}

function onCurrYChange() {
  config.Y = currY.value;
  config.M = currM.value;
  Database.put(database, Const.DB_CONFIG, Utils.Objects.raw(config), Const.DB_KEY_CONFIG);
  Database.get<IRecord>(database, Const.DB_RECORD, currY.value).then(_data => {
    data.value = _data;
    MList.value = Object.keys(data.value.items);
    currM.value = MList.value[0];
  });
}

function onCurrMChange() {
  config.Y = currY.value;
  config.M = currM.value;
  Database.put(database, Const.DB_CONFIG, Utils.Objects.raw(config), Const.DB_KEY_CONFIG);
}

async function onCreatedR(nextY: string) {
  Database.get<IRecord>(database, Const.DB_RECORD, nextY).then(_data => {
    data.value = _data;
    Database.keys(database, Const.DB_RECORD).then(_YList => {
      YList.value = _YList;
      currY.value = nextY;
      MList.value = Object.keys(data.value.items);
      currM.value = MList.value[0];
      config.Y = currY.value;
      config.M = currM.value;
      Database.put(database, Const.DB_CONFIG, Utils.Objects.raw(config), Const.DB_KEY_CONFIG);
    });
  });
}

function onDeletedR(nextM: string) {
  currM.value = nextM;
  config.Y = currY.value;
  config.M = currM.value;
  Database.put(database, Const.DB_CONFIG, Utils.Objects.raw(config), Const.DB_KEY_CONFIG);
}

function groupData(data: IRecord) {
  const grouped: Record<string, IBalance[]> = {};

  const balanceEntries = data?.items[currM.value]?.balance || [];
  balanceEntries.forEach(entry => {
    const date = Utils.Dates.formatDate("YY-MM-DD HH:mm:ss", String(entry.datetime)).split(" ")[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(entry);
  });

  const sortedGrouped: Record<string, IBalance[]> = {};
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (!config.itemAsc) {
    sortedDates.reverse();
  }

  sortedDates.forEach(date => {
    sortedGrouped[date] = grouped[date];
  });

  return sortedGrouped;
}
</script>

<template>
  <div class="main">
    <div class="mb-4">
      <div class="mb-2">日期</div>
      <div class="f-c-b">
        <el-select v-model="currY" class="mr-4" @change="onCurrYChange">
          <el-option v-for="item in YList" :key="item" :label="item + '年'" :value="item" />
        </el-select>
        <el-select v-model="currM" @change="onCurrMChange">
          <el-option v-for="item in MList" :key="item + '月'" :label="item + '月'" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="mb-4">
      <div class="mb-2">操作</div>
      <div class="f-c-b">
        <DeleteRecord
          :curr-m="currM"
          :curr-y="currY"
          :data="data"
          :database="database"
          :m-list="MList"
          @on-deleted="onDeletedR" />
        <CreateRecord
          :curr-m="currM"
          :curr-y="currY"
          :data="data"
          :database="database"
          :m-list="MList"
          @on-created="onCreatedR" />
        <UpdateRecord :curr-m="currM" :curr-y="currY" :data="data" :database="database" />
        <AddItem :curr-m="currM" :curr-y="currY" :data="data" :database="database" />
      </div>
    </div>
    <div>
      <div class="mb-4">
        <div class="mb-2">数据</div>
        <div class="f-c-s text-text-regular text-0.8rem">
          <div class="f-c-c">
            <div class="i-tabler-coin text-text-secondary mr-1"></div>
            <span class="text-text-secondary mr-1">本月预算</span>
            <span>
              {{ data?.items[currM]?.budget }}
            </span>
            <span class="text-text-secondary mr-1">，剩余</span>
            <span v-show="data?.items[currM]?.surplus >= 0" class="text-green">
              {{ calcSurplus().toFixed(2) }}
            </span>
            <span v-show="data?.items[currM]?.surplus < 0" class="text-red">
              {{ calcSurplus().toFixed(2) }}
            </span>
          </div>
        </div>
        <div class="f-c-e text-text-regular text-0.8rem">
          <div class="f-c-c">
            <div class="i-tabler-minus text-text-secondary mr-1"></div>
            <span class="text-text-secondary mr-1">已计划</span>
            <span>
              {{ calcOutcome().toFixed(2) }}
            </span>
          </div>
          <span class="text-text-secondary mr-1">，较上月</span>
          <div v-show="risingRate > 0" class="f-c-c text-red">
            {{ risingRate.toFixed(2) }}%
            <div class="i-tabler-caret-up"></div>
          </div>
          <div v-show="risingRate <= 0" class="f-c-c text-green">
            {{ risingRate.toFixed(2) }}%
            <div class="i-tabler-caret-down"></div>
          </div>
        </div>
      </div>
      <div>
        <div v-for="(entries, date) in groupData(data)" :key="date" class="mb-4">
          <div class="mb-2 text-0.9rem text-text-secondary">{{ date }}</div>
          <el-dropdown
            v-for="(value, index) in entries"
            :key="index"
            class="w-100% bg-bg-overlay p-4 rd-2 mt-2"
            trigger="click">
            <div class="w-100% f-c-b">
              <div class="f-c-s">
                {{ value.text }}
              </div>
              <div class="text-text-secondary">{{ value.cost }}</div>
            </div>
            <template #dropdown>
              <div class="m-2">
                <UpdateItem
                  :curr-m="currM"
                  :curr-y="currY"
                  :data="data"
                  :database="database"
                  :index="index"
                  :value="value"
                  class="mb-2" />
                <DeleteItem
                  :curr-m="currM"
                  :curr-y="currY"
                  :data="data"
                  :database="database"
                  :index="index"
                  :value="value" />
              </div>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>
