<template>
  <div class="vtree">
    <virtualTreeSelect
      ref="tree"
      v-model="input"
      :data="totalList"
      node-key="dm"
      showAllSelection
      :default-expanded-keys="defaultExpandedKeys"
      remoteSearch
      @remoteSearch="search"
      :multiple="true"
      :props="{
        children: 'children',
        label: 'mc',
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
import "./reset.css";
import axios from "axios";
export default {
  data() {
    return {
      totalList: [],
      input: [],
      defaultExpandedKeys: []
    };
  },
  watch: {},
  created() {
    axios
      .post(
        "http://192.168.9.202:30001/ysj-service/api/gxdwdm/queryBsgxdwzzjg",
        {
          dlrdwbm: "980000",
          dwbm: "120000",
          sfjzsjcjg: true
        }
      )
      .then((res) => {
        this.totalList = Object.freeze(
          this.getTreeData(res.data.data.gxdwxxList,'dm','fdm','-1')
        );
      });
  },
  methods: {
    search() {
      setTimeout(() => {
        this.totalList = [
          {
            nodeid: 1,
            nodetext: 2,
          },
        ];
      }, 1000);
    },
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
      this.$refs.tree.virtualTree.setExpandKeys([120000]);
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
