<script lang="ts" setup>
import { disabledDate } from "@/utils/forms";
import { ChatDotRound, Coin } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
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
  index: {
    type: Number,
    required: true
  },
  currM: {
    type: String,
    required: true
  },
  currY: {
    type: String,
    required: true
  }
});

const isShowDialog = ref(false);
const formInst = ref<FormInstance>();
const formRule = ref<FormRules>({
  cost: [{ validator: Utils.Forms.validateMoney, trigger: "change" }],
  text: [
    { required: true, message: "请输入收支备注", trigger: "blur" },
    { min: 1, max: 50, message: "长度在1~50个字符之间", trigger: "blur" }
  ],
  datetime: [{ required: true, message: "请输入日期时间", trigger: "change" }]
});
const formData = ref<IBalance>({
  ...props.value
});
const { items } = await Database.get<{ items: IComment[] }>(props.database, Const.DB_COMMENTS, Const.DB_KEY_COMMENTS);
const comments = ref<IComment[]>(items);

const findFromComments = (target: any, callback: any) => {
  const comment = target ? comments.value.filter(Utils.createFilter(target)) : comments.value;
  callback(comment);
};

function onAutocompleteSelected(comment: IComment) {
  formData.value.cost = comment.cost;
}

function openUpdateDialog() {
  formData.value = { ...props.value };
  isShowDialog.value = !isShowDialog.value;
}

function confirmSubmit() {
  const { data, currM, database, currY } = props;
  const { formValidator } = Utils.Forms;
  const { id } = formData.value;
  const balanceItems = data.items[currM].balance;

  formValidator(
    formInst.value,
    async () => {
      const foundItemIndex = balanceItems.findIndex(item => item.id === id);
      if (foundItemIndex !== -1) {
        balanceItems[foundItemIndex] = formData.value;
        await Database.put(database, Const.DB_RECORD, Utils.Objects.raw(data), currY);
        isShowDialog.value = !isShowDialog.value;
      } else {
        ElMessage.error("未找到更新的计划");
      }
    },
    () => {
      ElMessage.error("检查输入的值是否正确");
    }
  );
}
</script>

<template>
  <div>
    <el-button size="small" text type="primary" @click="openUpdateDialog">编辑计划</el-button>
    <el-dialog v-model="isShowDialog" append-to-body title="修改计划" width="90%">
      <el-form
        ref="formInst"
        :model="formData"
        :rules="formRule"
        hide-required-asterisk
        label-position="left"
        label-width="auto"
        status-icon>
        <el-form-item label="备注" prop="text">
          <el-autocomplete
            v-model="formData.text"
            :fetch-suggestions="findFromComments"
            :prefix-icon="ChatDotRound"
            placeholder="请输入备注"
            style="width: 100%"
            @select="onAutocompleteSelected" />
        </el-form-item>
        <el-form-item label="金额" prop="cost">
          <el-input v-model.number="formData.cost" :prefix-icon="Coin" placeholder="请输入金额" type="number" />
        </el-form-item>
        <el-form-item label="日期" prop="datetime">
          <el-date-picker
            v-model="formData.datetime"
            :disabled-date="(time: Date) => disabledDate(time, currY, currM)"
            placeholder="请输入日期"
            style="width: 100%"
            type="date" />
        </el-form-item>
        <el-form-item class="mt-10">
          <div class="f-c-c w-100%">
            <el-button class="mr-4" plain round @click="isShowDialog = !isShowDialog">
              <template #icon>
                <div class="i-tabler-x"></div>
              </template>
            </el-button>
            <el-button plain round type="primary" @click="confirmSubmit">
              <template #icon>
                <div class="i-tabler-check"></div>
              </template>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
