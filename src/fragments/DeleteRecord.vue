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
  currM: {
    type: String,
    required: true
  },
  currY: {
    type: String,
    required: true
  },
  mList: {
    type: Array,
    required: true
  }
});

const emits = defineEmits(["onDeleted"]);

function handleDelete() {
  const { mList, currM, data, database, currY } = props;
  const nextM = Utils.deleteAndReturnNext(mList, currM);

  if (nextM) {
    delete data.items[currM];

    Database.put(database, Const.DB_RECORD, Utils.Objects.raw(data), currY)
      .then(() =>
        Database.put(
          database,
          Const.DB_CONFIG,
          {
            id: Const.DB_KEY_CONFIG,
            Y: currY,
            M: nextM
          },
          Const.DB_KEY_CONFIG
        )
      )
      .then(() => emits("onDeleted", nextM))
      .catch(error => {
        ElMessage.error("删除记录时发生错误");
        console.error(error);
      });
  } else {
    ElMessage.error("至少保留一条记录");
  }
}
</script>

<template>
  <div>
    <el-popconfirm
      cancel-button-text="取消"
      confirm-button-text="确定"
      title="确定删除该记录？"
      @confirm="handleDelete">
      <template #reference>
        <el-button plain round size="small" type="danger">删除记录</el-button>
      </template>
    </el-popconfirm>
  </div>
</template>

<style lang="scss" scoped></style>
