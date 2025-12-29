<!--
  VTreeSelect - 省级单位树形选择器组件

  功能特性：
  - 支持左侧省份列表切换
  - 支持虚拟滚动，处理大量数据
  - 支持单选/多选模式
  - 支持搜索过滤
  - 支持展开/收缩树形结构
  - 支持全选/取消全选
  - 支持父子级联动选择
  - 支持清空选中项

  数据结构：
  - data.zzhgxxList: 省份列表
  - data.gxdwxxList: 关系单位列表（扁平数据）

  性能优化：
  - 虚拟滚动减少 DOM 节点数量
  - 分省份存储选中数据，避免重复渲染
  - 使用虚拟树组件处理大数据量

  使用示例：
  <vTreeSelect
    v-model="selectedIds"
    :data="treeData"
    multiple
    node-key="dm"
    :props="{ label: 'mc', children: 'children' }"
    @queryGxdw="handleQueryGxdw"
  />
-->
<template>
  <!-- 主容器，支持键盘无障碍访问 -->
  <div class="virtualSelect" role="button" tabindex="0" aria-label="请选择">
    <!-- 弹出层容器 -->
    <el-popover
      v-model="isShowSelect"
      popper-class="treeSelect_v_popover"
      placement="bottom-start"
      :width="popoverWidth"
      trigger="manual"
    >
      <!-- 选择器触发区域 -->
      <div
        class="xz"
        ref="xz_content"
        slot="reference"
        @click="toggleSelect"
      >
        <!-- 多选模式：显示选中项标签 -->
        <span v-if="$attrs.multiple && selectedArr.length">
          <!-- 第一个选中项标签，最多显示4个字符 -->
          <el-tag closable :title="selectedArr.map(item => item[$attrs.props.label]).join('；')" @close="closeTag(0)"
            >{{ selectedArr[0][$attrs.props.label].substr(0, 4) }}
            {{
              selectedArr[0][$attrs.props.label].length > 4 ? "..." : ""
            }}</el-tag
          >
          <!-- 剩余选中项数量标签 -->
          <el-tag v-show="selectedArr.length > 1"
            >+{{ selectedArr.length - 1 }}</el-tag
          >
        </span>
        <!-- 单选模式：显示选中项文本，最多显示12个字符 -->
        <span class="single" :title="selectedArr[0][$attrs.props.label]" v-else-if="selectedArr.length"
          >{{
            selectedArr[0][$attrs.props.label]
          }}</span
        >
        <!-- 默认占位文本 -->
        <span v-else>请选择</span>
        <!-- 清空按钮（仅多选模式显示） -->
        <i
          v-if="$attrs.multiple && selectedArr.length && clearable"
          @click.stop="clear"
          class="el-icon-circle-close"
        ></i>
        <!-- 下拉箭头图标 -->
        <i class="el-icon-arrow-down"></i>
        <!-- 为了让组件支持element 表单规则验证隐藏一个输入框 -->
        <el-input
          class="search"
          size="small"
          style="display: none"
          :value="selectedArr[0]"
          placeholder="请选择"
        />
      </div>
          <!-- 下拉列表容器：左右分栏布局 -->
      <div class="list-popover-ay" :style="'min-width: ' + minWidth + 'px'" v-loading="loading">
        <!-- 左侧：省份选择列表 -->
        <div class="left">
          <ul>
            <!-- 省份项循环渲染，第一项显示定位图标 -->
            <li
              :title="item.dwqc"
              @click.stop="selectProvince(item.dm)"
              v-for="(item, idx) in provinces"
              :key="item.dm"
              :class="{atthis: selectDwbm == item.dm}"
            >
              <!-- 首项显示位置图标 -->
              <i v-if="idx == 0" class="el-icon-location-information"></i>
              <!-- 省份名称 -->
              <span>{{item.mc}}</span>
            </li>
          </ul>
        </div>
        <!-- 右侧：关系单位树形列表 -->
        <div class="right">
          <!-- 搜索栏 -->
          <div class="btn">
            <el-input
              class="search"
              size="small"
              v-model="searchText"
              :validateEvent="false"
              placeholder="请输入关键字搜索"
            />
          </div>
          <!-- 虚拟滚动树形组件 -->
          <virtualTree
            ref="virtualTree"
            v-model="selectedIdsTree"
            :data="gxdwxxList"
            @change="selectedIdsTreeChange"
            v-bind="$attrs"
          />
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
// 导入虚拟滚动树形组件
import virtualTree  from "../virtualTree/index.vue";
const provinceArr = [
  {
      "dm": "100000",
      "mc": "最高检",
  },
  {
      "dm": "110000",
      "mc": "北京",
  },
  {
      "dm": "120000",
      "mc": "天津",
  },
  {
      "dm": "130000",
      "mc": "河北",
  },
  {
      "dm": "140000",
      "mc": "山西",
  },
  {
      "dm": "150000",
      "mc": "内蒙古",
  },
  {
      "dm": "210000",
      "mc": "辽宁",
  },
  {
      "dm": "220000",
      "mc": "吉林",
  },
  {
      "dm": "230000",
      "mc": "黑龙江"
  },
  {
      "dm": "310000",
      "mc": "上海",
  },
  {
      "dm": "320000",
      "mc": "江苏",
  },
  {
      "dm": "330000",
      "mc": "浙江",
  },
  {
      "dm": "340000",
      "mc": "安徽",
  },
  {
      "dm": "350000",
      "mc": "福建",
  },
  {
      "dm": "360000",
      "mc": "江西",
  },
  {
      "dm": "370000",
      "mc": "山东",
  },
  {
      "dm": "410000",
      "mc": "河南",
  },
  {
      "dm": "420000",
      "mc": "湖北",
  },
  {
      "dm": "430000",
      "mc": "湖南",
  },
  {
      "dm": "440000",
      "mc": "广东",
  },
  {
      "dm": "450000",
      "mc": "广西",
  },
  {
      "dm": "460000",
      "mc": "海南",
  },
  {
      "dm": "500000",
      "mc": "重庆",
  },
  {
      "dm": "510000",
      "mc": "四川",
  },
  {
      "dm": "520000",
      "mc": "贵州",
  },
  {
      "dm": "530000",
      "mc": "云南",
  },
  {
      "dm": "540000",
      "mc": "西藏",
  },
  {
      "dm": "610000",
      "mc": "陕西",
  },
  {
      "dm": "620000",
      "mc": "甘肃",
  },
  {
      "dm": "630000",
      "mc": "青海",
  },
  {
      "dm": "640000",
      "mc": "宁夏",
  },
  {
      "dm": "650000",
      "fdm": "100000",
      "mc": "新疆",
  },
  {
      "dm": "660000",
      "mc": "新疆兵团",
  }
]
export default {
  name: "gxTreeSelect",
  components: {
    virtualTree,
  },
  data() {
    return {
      loading: false,                    // 加载状态，切换省份时显示
      selectDwbm: '',                   // 当前选中的省份代码
      allChecked: false,                // 全选状态标识
      selectedMap: {},                   // 分省份存储选中项的映射表
      selectedIdsTree: '',              // 当前省份的选中ID集合
      searchText: "",                    // 搜索关键字
      popoverWidth: 150,                // 弹出层宽度
      isShowSelect: false,               // 是否显示下拉框
    };
  },
  // v-model 配置
  model: {
    prop: "selectedId",          // 双向绑定的属性名
    event: "changeModel",             // 触发的事件名
  },

  // 组件属性定义
  props: {
    minWidth: {
      type: Number,
      default: 490
    },
    // 是否显示全选按钮
    showAllSelection: {
      type: Boolean,
      default: false,
    },
    // 是否显示清空按钮
    clearable: {
      type: Boolean,
      default: true,
    },
    // 是否启用远程搜索
    remoteSearch: {
      type: Boolean,
      default: false,
    },
    // 远程搜索按钮文本
    remoteSearchText: {
      type: String,
      default: "全国搜索",
    },
    // 默认选中的省份代码
    dwbm: {
      type: String,
      default: "",
    },
    // 数据源对象，关系单位列表
    data: {
      type: Array,
      default: []
    },
    // 已选中的ID（支持字符串或数组）
    selectedId: {
      type: [String, Array],
      default: ''
    }
  },
  // 组件创建时初始化
  created() {
    // 设置默认选中的省份代码
    this.selectDwbm = this.dwbm.substring(0, 2) + '0000'
  },

  // 计算属性
  computed: {
    // 获取省份列表数据
    provinces() {
      let obj = {}
      const arr = provinceArr.filter(item => {
        if(item.dm !== (this.dwbm + '0000')) {
          return true
        } else {
          obj = item
        }
      })
      arr.unshift({dm: this.dwbm, mc: obj.mc || '本省'})
      return  arr
    },

    // 将扁平的关系单位数据转换为树形结构
    gxdwxxList() {
      return this._getTreeData(this.data, 'dm','fdm', '-1')
    },

    // 获取所有选中的节点数据（合并所有省份的选中项）
    selectedArr() {
      let arr = []
      Object.values(this.selectedMap).forEach(item => {
        arr = arr.concat(item)
      })
      return arr
    }
  },
  // 组件挂载后的生命周期钩子
  mounted() {
    // 设置弹出层宽度（比触发区域宽10px）
    const minWidth = this.$refs.xz_content.clientWidth + 10
    this.popoverWidth = minWidth > 370 ? minWidth : 370

    // 添加全局点击事件监听，用于点击外部关闭下拉框
    document.addEventListener("click", this.handleClickOutside);
  },

  // 组件销毁前的生命周期钩子
  destroyed() {
    // 移除全局点击事件监听，避免内存泄漏
    document.removeEventListener("click", this.handleClickOutside);
  },
  // 组件方法
  methods: {
    toggleSelect() {
      this.isShowSelect = !this.isShowSelect
      try {
        this.$refs.virtualTree._wheelFn();
      } catch (error) {
      }
    },
    /**
     * 将扁平数组转换为树形结构数据
     * @param {Array} data - 扁平化的原始数据
     * @param {String} id - 节点ID字段名
     * @param {String} pid - 父节点ID字段名
     * @param {String} pvalue - 根节点的父ID值
     * @param {Array} defaultChild - 默认子节点数组
     * @returns {Array} 树形结构数据
     */
    _getTreeData(data, id, pid, pvalue, defaultChild = []) {
      if (defaultChild === "undefined") defaultChild = undefined;
      const _data = {};

      // 按父ID分组存储数据
      data.map((item) => {
        if (!_data[item[pid]]) _data[item[pid]] = [];
        _data[item[pid]].push(item);
      });

      const root = _data[pvalue];

      // 递归构建树形结构
      function inner(temp = [], defaultChild) {
        return temp.map((item) => {
          item.children = _data[item[id]] || defaultChild;
          if (_data[item[id]]) inner(_data[item[id]], defaultChild);
          return item;
        });
      }

      return inner(root, defaultChild);
    },

    /**
     * 设置选中项数据
     * 根据节点ID的前两位确定省份，将选中项按省份分组存储
     * @param {Array} v - 选中的节点数组
     */
    setSelectArr(v) {
      const objMap = {};

      // 按省份代码分组（取节点ID前两位+0000作为省份标识）
      v.forEach((item) => {
        const str = item[this.$attrs['node-key']].substr(0, 2) + '0000'
        if(!objMap[str]) {
          objMap[str] = []
        }
        objMap[str].push(item)
      });

      this.selectedMap = objMap
      // 初始化当前省份的选中ID
      this._initSelectIds()
    },

    /**
     * 初始化当前省份的选中ID集合
     * 从selectedMap中获取当前省份的选中项ID，设置给selectedIdsTree
     */
    _initSelectIds() {
      try {
        this.selectedIdsTree = this.selectedMap[this.selectDwbm].map(item => item[this.$attrs['node-key']])
      } catch (error) {
        // 如果当前省份没有选中项，使用默认值
        this.selectedIdsTree = this.selectedId
      }
    },

    /**
     * 选择省份
     * @param {String} dwbm - 省份代码
     */
    selectProvince(dwbm) {
      this.loading = true
      this.selectDwbm = dwbm
      this.selectBsd = true
      // 切换前先清空右侧关系单位组件的数据
      // this.$refs.virtualTree.clear()
      // 重新设置当前省份的选中ID
      this._initSelectIds()
      // 触发查询关系单位事件，让父组件加载对应省份的数据
      this.$emit('queryGxdw', dwbm)
      try {
        this.$refs.virtualTree.$refs.list.scrollTop = 0;
      } catch (error) {
      }
    },

    /**
     * 关闭加载状态
     */
    closeLoading() {
      this.loading = false

    },

    /**
     * 获取当前选中的所有节点数据
     * @returns {Array} 选中节点数组
     */
    getCurrentNode() {
      return this.selectedArr;
    },

    /**
     * 处理点击外部区域，关闭下拉框
     * @param {Event} e - 点击事件对象
     */
    handleClickOutside(e) {
      if (this.$refs.xz_content && !this.$refs.xz_content.contains(e.target)) {
        this.isShowSelect = false;
      }
    },

    /**
     * 关闭标签（移除选中项）
     * @param {Number} idx - 标签索引
     */
    closeTag(idx) {
      this.selectedArr[idx].checked = false;
    },

    /**
     * 全选/取消全选
     * @param {Boolean} value - 是否全选
     */
    allChange(value) {
      this.$refs.virtualTree.allChange(value);
    },

    /**
     * 清空所有选中项
     */
    clear() {
      this.allChecked = false;
      this.$refs.virtualTree.allChange(false);
    },

    selectedIdsTreeChange(v) {
      // 单选
      if(!this.$attrs['multiple']) {
        this.selectedMap = {}
        this.isShowSelect = false
      }
      // 将虚拟树组件的选中数组更新到当前省份的映射中 //加载中的时候 不设置
      if(v && this.$refs.virtualTree && !this.loading) {
        this.$set(this.selectedMap, this.selectDwbm, this.$refs.virtualTree.selectedArr)
      }
    }
  },
  // 数据监听器
  watch: {
    /**
     * 监听搜索关键字变化
     * @param {String} v - 搜索关键字
     */
    searchText (v) {
      // 调用虚拟树组件的过滤方法进行搜索
      this.$refs.virtualTree.filter(v);
    },

    /**
     * 监听所有选中节点变化
     * 当selectedMap更新时会触发此监听器
     */
    selectedArr(v, old) {
      // 向外触发changeModel事件，传递所有选中节点的ID数组
      if(!this.$attrs['multiple']) {
        this.$emit("changeModel", this.selectedArr.map(item => item[this.$attrs['node-key']])[0]);
        this.$emit("change", this.selectedArr[0][this.$attrs['node-key']], this.selectedArr[0].data);
      } else {
        this.$emit("changeModel", this.selectedArr.map(item => item[this.$attrs['node-key']]));
        this.$emit("change", this.selectedArr.map(item => item[this.$attrs['node-key']]), this.selectedArr.map(item => item.data));
      }
    },
  },
};
</script>

<!-- 组件样式：作用域样式，只影响当前组件 -->
<style scoped lang="scss">
/* 主选择器容器样式 */
.virtualSelect {
  border: 1px solid #a9c4df;        /* 边框颜色 */
  background: #fff;                  /* 背景色 */
  height: 34px;                     /* 固定高度 */
  line-height: 34px;                /* 行高，垂直居中 */
  border-radius: 3px;               /* 圆角 */
  padding: 0 5px 0 10px;                  /* 左右内边距 */
  outline: none;                     /* 去除焦点轮廓 */
  cursor: pointer;                   /* 鼠标指针 */
  user-select: none;                 /* 禁止文本选择 */

  /* 选择器触发区域样式 */
  .xz {
    display: flex;                   /* 弹性布局 */
    outline: none;                   /* 去除焦点轮廓 */

    /* 文本区域样式 */
    > span {
      flex: 1;                      /* 占据剩余空间 */
      overflow: hidden;              /* 隐藏溢出内容 */
      color: #879bc1;               /* 占位文本颜色 */
      text-overflow: ellipsis;
      white-space: nowrap;
      /* 单选模式文本样式 */
      &.single {
        color: #4f5e7b;             /* 选中项文本颜色 */
      }
    }

    /* 选中项标签样式 */
    .el-tag {
      line-height: 22px;             /* 标签行高 */
      height: 24px;                 /* 标签高度 */
      font-size: 16px;              /* 标签字体大小 */
      color: #4084f0;               /* 标签颜色 */
      margin-top: 3px;              /* 顶部外边距 */
    }

    /* 图标样式 */
    i {
      width: 20px;                  /* 图标宽度 */
      line-height: 34px;             /* 图标行高 */
      color: #6fabef;
      font-size: 14px;
      /* 清空按钮默认隐藏 */
      &.el-icon-circle-close {
        display: none;
      }
    }

    /* 鼠标悬停时显示清空按钮 */
    &:hover i.el-icon-circle-close {
      display: block;
    }
  }
}
</style>

<!-- 全局样式：影响弹出层等动态生成的元素 -->
<style lang="scss">
/* 下拉列表容器样式 */
.list-popover-ay {
  min-height: 100px;               /* 最小高度 */
  max-height: 400px;               /* 最大高度 */
  min-width: 490px;                /* 最小宽度 */
  display: flex;                   /* 弹性布局，左右分栏 */
  position: relative;              /* 相对定位 */

  /* 左侧省份列表面板 */
  .left {
    width: 130px;                 /* 固定宽度 */
    border-right: 1px solid #a9c4df;  /* 右边框分隔线 */
    overflow: auto;                /* 内容溢出时滚动 */

    /* 省份列表项样式 */
    li{
      line-height: 35px;           /* 行高 */
      font-size: 16px;            /* 字体大小 */
      padding: 0 10px;            /* 内边距 */
      display: flex;               /* 弹性布局 */
      cursor: pointer;             /* 鼠标指针 */

      /* 第一项（全国）特殊样式 */
      &:first-child {
        position: relative;        /* 相对定位，用于添加分隔线 */

        /* 分隔线样式 */
        &::after{
          display: block;         /* 块级显示 */
          content: '';            /* 空内容 */
          border-bottom:1px solid #a9c4df;  /* 下边框分隔线 */
          position: absolute;      /* 绝对定位 */
          left: 10px;             /* 左边距 */
          right: 10px;            /* 右边距 */
          bottom: 0;              /* 底部位置 */
        }

        /* 第一项文本样式，不缩进 */
        span{
          padding-left: 0;        /* 取消左内边距 */
        }
      }

      /* 当前选中省份高亮样式 */
      &.atthis{
        background: #b3d8ff;      /* 背景色 */
        color: #4084f0;           /* 文字颜色 */
        font-weight: bold;         /* 加粗 */
      }

      /* 图标样式 */
      i{
        align-content: center;     /* 垂直居中 */
        padding-right: 5px;        /* 右内边距 */
        line-height: 35px;

      }

      /* 省份名称样式 */
      span{
        padding-left: 20px;       /* 左内边距，缩进显示 */
        display: block;            /* 块级显示 */
        flex: 1;                  /* 占据剩余空间 */
        overflow: hidden;         /* 隐藏溢出 */
        text-overflow: ellipsis;   /* 文本省略号 */
        white-space: nowrap;       /* 不换行 */
      }
    }
  }

  /* 右侧关系单位面板 */
  .right{
    flex: 1;                     /* 占据剩余空间 */
    display: flex;               /* 弹性布局 */
    flex-direction: column;        /* 垂直排列 */
  }

  /* 列表区域样式 */
  .list {
    overflow: auto;              /* 滚动 */
    position: relative;          /* 相对定位 */
    flex: 1;                    /* 占据剩余空间 */
  }

  /* 搜索栏样式 */
  .btn {
    height: 36px;                /* 高度 */
    line-height: 36px;           /* 行高 */
    display: flex;               /* 弹性布局 */
    background: #fff;            /* 背景色 */

    /* 搜索输入框样式 */
    .search {
      padding: 0 5px;           /* 内边距 */
      font-size: 14px;          /* 字体大小 */

      /* 输入框样式 */
      .el-input__inner{
        border: 0;              /* 去除边框 */
        border-bottom: 1px solid #a9c4df;  /* 底边框 */
        border-radius: 0;        /* 去除圆角 */
      }
    }

    /* 按钮区域样式 */
    .an {
      position: relative;        /* 相对定位 */
      top: -1px;               /* 向上偏移1px */
    }
  }

  /* 树形列表样式 */
  .right ul {
    list-style: none;           /* 去除列表样式 */
    user-select: none;          /* 禁止文本选择 */
    position: absolute;         /* 绝对定位 */
    left: 0;                  /* 左位置 */
    top: 0;                   /* 顶部位置 */
    right: 0;                 /* 右位置 */

    /* 列表项样式 */
    li {
      line-height: 30px;       /* 行高 */
      white-space: nowrap;     /* 不换行 */
      display: flex;           /* 弹性布局 */
      align-items: center;     /* 垂直居中 */
      font-size: 16px;        /* 字体大小 */
      height: 30px;           /* 高度 */
      cursor: pointer;        /* 鼠标指针 */

      /* 单选模式下选中项高亮 */
      &.active-li {
        background: #d7e5f9;  /* 背景色 */
        color: #165ac6;        /* 文字颜色 */
      }

      /* 复选框样式 */
      .el-checkbox {
        display: flex;         /* 弹性布局 */
        overflow: hidden;       /* 隐藏溢出 */
        align-items: center;   /* 垂直居中 */
        flex: 1;              /* 占据剩余空间 */

        /* 复选框输入区域 */
        .el-checkbox__input {
          position: relative;   /* 相对定位 */
          top: 1px;           /* 向下偏移1px */
          margin: 0;          /* 去除外边距 */
        }

        /* 复选框标签样式 */
        .el-checkbox__label {
          text-overflow: ellipsis;  /* 文本省略号 */
          overflow: hidden;          /* 隐藏溢出 */
          line-height: 16px !important;  /* 强制行高 */
        }
      }

      /* 图标样式 */
      i {
        display: inline-block;   /* 行内块级元素 */
        width: 14px;           /* 宽度 */
        color: #a9c4df;        /* 颜色 */
        margin-right: 5px;     /* 右外边距 */
        margin-top: 2px;       /* 顶部外边距 */
        font-size: 14px;
        /* 展开/收缩图标 */
        &.el-icon-caret-bottom {
          cursor: pointer;      /* 鼠标指针 */
        }

        /* 收缩状态图标旋转 */
        &.hide {
          transform-origin: 50% 50%;  /* 旋转中心 */
          transform: rotate(-90deg);  /* 逆时针旋转90度 */
        }
      }
    }

    /* 复选框标签样式 */
    .el-checkbox .el-checkbox__label {
      text-indent: 0;          /* 去除文本缩进 */
      font-size: 16px;         /* 字体大小 */
      color: #606266;         /* 文字颜色 */
    }

    /* 选中状态标签样式 */
    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: #606266;          /* 选中时文字颜色不变 */
    }
  }
}

/* 弹出层样式 */
.treeSelect_v_popover[x-placement^="bottom"] {
  margin-top: 4px;            /* 顶部外边距 */
  margin-left: -10px;         /* 左边距偏移 */
  padding: 0;                 /* 去除内边距 */

  /* 隐藏弹出箭头 */
  .popper__arrow {
    display: none;             /* 隐藏箭头 */
  }

  /* 无数据提示文本样式 */
  p {
    text-align: center;         /* 文本居中 */
    color: #b1b8c5;           /* 文字颜色 */
    padding-top: 20px;        /* 顶部内边距 */
  }
}
</style>
