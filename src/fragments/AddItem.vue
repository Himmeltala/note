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
  currY: {
    type: String,
    required: true
  },
  currM: {
    type: String,
    required: true
  }
});

const dialog = ref(false);
const formData = ref<IBalance>({
  id: "",
  cost: 0,
  text: "",
  datetime: Utils.Dates.nowDate("YY-MM-DD", new Date(Number(props.currY), Number(props.currM) - 1))
});
const formInst = ref<FormInstance>();
const formRule = ref<FormRules>({
  cost: [{ required: true, message: "请输入金额", trigger: "change" }],
  text: [
    { required: true, message: "请输入备注", trigger: "change" },
    { min: 1, max: 50, message: "长度在1~50个字符之间", trigger: "change" }
  ],
  datetime: [{ required: true, message: "请输入日期", trigger: "change" }]
});
const { items } = await Database.get<{ items: IComment[] }>(props.database, Const.DB_COMMENTS, Const.DB_KEY_COMMENTS);
const comments = ref<IComment[]>(items);

function confirmSubmit() {
  const { data, currM, database, currY } = props;
  const { formValidator } = Utils.Forms;
  const { generateRandomHash, Objects } = Utils;
  const { value: formInstValue } = formInst;
  const { value: dialogValue } = dialog;

  formValidator(
    formInstValue,
    async () => {
      formData.value.id = generateRandomHash();
      data.items[currM].balance.push({ ...formData.value });
      await Database.put(database, Const.DB_RECORD, Objects.raw(data), currY);
      dialog.value = !dialogValue;
    },
    () => {
      ElMessage.error("检查输入的值是否正确");
    }
  );
}

const findFromComments = (target: any, callback: any) => {
  const comment = target ? comments.value.filter(Utils.createFilter(target)) : comments.value;
  callback(comment);
};

function onAutocompleteSelected(comment: IComment) {
  formData.value.text = comment.value;
  formData.value.cost = comment.cost;
  formData.value.type = comment.type;
}

function afterOpenedDialog() {
  formInst.value.resetFields();
  formData.value.datetime = Utils.Dates.nowDate("YY-MM-DD", new Date(Number(props.currY), Number(props.currM) - 1));
}
</script>

<template>
  <div>
    <el-button plain round size="small" type="success" @click="dialog = !dialog">添加计划</el-button>
    <el-dialog v-model="dialog" append-to-body title="添加一项计划" width="90%" @opened="afterOpenedDialog">
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
            <el-button class="mr-4" plain round @click="dialog = !dialog">
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

<style lang="scss" scoped>
.el-date-picker__header {
  display: none;
}
</style>
