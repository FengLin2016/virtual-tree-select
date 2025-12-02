<template>
  <div class="vtree">
    <vTreeSelect
      ref="tree"
      v-model="input"
      :data="totalList"
      node-key="nodeid"
      showAllSelection
      :multiple="true"
      :props="{
        children: 'children',
        label: 'nodetext',
      }"
    />
    <div class="btn">
      <el-button @click="setCheck">设置选中</el-button>
      <el-button @click="clear">清空</el-button>
      <el-button @click="filter(input)">筛选</el-button>
      <el-button @click="filter()">筛选清空</el-button>
    </div>
  </div>
</template>

<script>
import './reset.css';
import axios from "axios";
export default {
  data() {
    return {
      totalList: [],
      input: "",
    };
  },
  watch: {},
  created() {
    axios
      .post(
        "http://192.168.9.202:30001/dzjz-service/api/dzjzsystem/getDzjzTree",
        { bmsah: "光明检刑诉受[2025]980102000005号", dwbm: "980102" }
      )
      .then((res) => {
        this.totalList = Object.freeze(this.getTreeData(
          res.data.data,
          "nodeid",
          "pnodeid",
          ""
        ));

      });
  },
  methods: {
    getTreeData(data, id, pid, pvalue, defaultChild = []) {
      if (defaultChild === "undefined") defaultChild = undefined;
      const _data = {};
      data.map((item) => {
        if (!_data[item[pid]]) _data[item[pid]] = [];
        _data[item[pid]].push(item);
      });
      const root = _data[pvalue];
      function inner(temp = [], defaultChild) {
        return temp.map((item) => {
          item.children = _data[item[id]] || defaultChild;
          if (_data[item[id]]) inner(_data[item[id]], defaultChild);
          return item;
        });
      }
      return inner(root, defaultChild);
    },
    filterFn(item, value) {
      return item.name.indexOf(value) > -1;
    },
    setCheck() {
      this.$refs.tree.setCheckedKeys([100001]);
    },
    clear() {
      this.$refs.tree.clear();
    },
    filter(value) {
      this.$refs.tree.filter(value);
    },
  },
};
</script>

<style scoped lang="scss">
.vtree {
  padding: 20px;
  display: flex;
  flex-direction: column;
}
</style>
