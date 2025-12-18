<template>
  <div class="vtree">

    <gxTreeSelect
      ref="tree"
      v-model="input"
      :data="totalList"
      :dwbm="'770000'"
      @queryGxdw="queryGxdw"
      node-key="dm"
      showAllSelection
      :multiple="false"
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
      totalList: {},
      input: [],
    };
  },
  watch: {},
  created() {
    this.queryGxdw()
    this.$nextTick(() => {
      // this.$refs.tree.setSelectArr([
      //   {dm: '1189000000003', mc: '汉东'}
      // ])
    })
  },
  methods: {
    queryGxdw(dwbm = "770000") {
      axios
      .post(
        "http://192.168.9.163:8088/ysj-service/api/gxdwdm/queryBsgxdwzzjg",
        {
          dwbm,
          dlrdwbm: '770000',
          gxdwlxdmList:["9901190102000","9901190103000","9901190105000","9901190106000","9901190109999"],
          gvlxdm: "",
          jscs: "",
          sffx: true,
          sfzsbdw: true,
          sfzsjcjg: true,
          size: 0,
        },{
          headers: {
            'X-IDENTITY': 'eyJkbGJtIjoidGVzdDE4MDQiLCJyeWJtIjoiOTgwMDAwMDAzMyIsImR3Ym0iOiI5ODAwMDAiLCJkd21jIjoi5rGJ5Lic55yB6ZmiIiwicnltYyI6Iua1i+ivlei0puWPtzE4MDQifQ==',
            jc_token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0eXl3Mi4wIiwiZGxibSI6InRlc3QxODA0IiwicnlibSI6Ijk4MDAwMDAwMzMiLCJkd2JtIjoiOTgwMDAwIiwiZHdtYyI6IuaxieS4nOecgemZoiIsInJ5bWMiOiLmtYvor5XotKblj7cxODA0IiwiWC1JREVOVElUWSI6ImV5SmtiR0p0SWpvaWRHVnpkREU0TURRaUxDSnllV0p0SWpvaU9UZ3dNREF3TURBek15SXNJbVIzWW0waU9pSTVPREF3TURBaUxDSmtkMjFqSWpvaTVyR0o1TGljNTV5QjZabWlJaXdpY25sdFl5STZJdWExaStpdmxlaTBwdVdQdHpFNE1EUWlmUT09IiwiaWF0IjoxNzY2MDM5NzMzLCJleHAiOjE3NjYwODI5MzN9.hcj_NkmeFkYv54updRT3J1RVZIr7ZsGFr6IUzlCLNls'
          }
        }
      )
      .then((res) => {
        this.totalList = res.data.data;
        this.$refs.tree.closeLoading()

      });
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
