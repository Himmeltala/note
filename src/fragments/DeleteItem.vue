<script lang="ts" setup>
import { PropType } from "vue";

const props = defineProps({
  database: {
    type: Object as PropType<IDBDatabase>
  },
  data: {
    type: Object as PropType<IRecord>,
    required: true
  },
  value: {
    type: Object,
    required: true
  },
  currY: {
    type: String,
    required: true
  },
  currM: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

const isShowDialog = ref(false);

async function confirmSubmit() {
  const { data, currM, value, database, currY } = props;
  const balanceItems = data.items[currM].balance;
  const foundItemIndex = balanceItems.findIndex(item => item.id === value.id);

  if (foundItemIndex !== -1) {
    balanceItems.splice(foundItemIndex, 1);
    await Database.put(database, Const.DB_RECORD, Utils.Objects.raw(data), currY);
    isShowDialog.value = !isShowDialog.value;
  } else {
    ElMessage.error("未找到删除的计划");
  }
}
</script>

<template>
  <div>
    <el-button size="small" text type="danger" @click="isShowDialog = !isShowDialog"> 删除计划 </el-button>
    <el-dialog v-model="isShowDialog" append-to-body title="删除计划" width="90%">
      <el-form ref="formInst" hide-required-asterisk label-position="left" label-width="auto" status-icon>
        <el-form-item label="备注" prop="text">
          {{ data.items[currM].balance[index].text }}
        </el-form-item>
        <el-form-item label="金额" prop="cost">
          {{ data.items[currM].balance[index].cost }}
        </el-form-item>
        <el-form-item label="日期" prop="datetime">
          <el-date-picker
            v-model="data.items[currM].balance[index].datetime"
            disabled
            placeholder="请输入日期"
            style="width: 100%"
            type="date" />
        </el-form-item>
        <el-form-item class="mt-10">
          <div class="f-c-c w-100%">
            <el-button class="mr-4" plain round type="danger" @click="confirmSubmit">
              <template #icon>
                <div class="i-tabler-trash"></div>
              </template>
            </el-button>
            <el-button plain round type="primary" @click="isShowDialog = !isShowDialog">
              <template #icon>
                <div class="i-tabler-x"></div>
              </template>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
