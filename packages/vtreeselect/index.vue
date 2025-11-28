<!--
  VTreeSelect - 虚拟滚动树形选择器组件

  功能特性：
  - 支持虚拟滚动，处理大量数据
  - 支持单选/多选模式
  - 支持搜索过滤
  - 支持展开/收缩树形结构
  - 支持全选/取消全选
  - 支持父子级联动选择

  性能优化：
  - 使用 Set 数据结构优化查找性能
  - 使用 for 循环替代数组过滤方法
  - 虚拟滚动减少 DOM 节点数量
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
        @click="isShowSelect = !isShowSelect"
      >
        <!-- 多选模式：显示选中项标签 -->
        <span v-if="multiple && selectedArr.length">
          <!-- 第一个选中项标签，最多显示4个字符 -->
          <el-tag closable @close="closeTag(0)"
            >{{ selectedArr[0][defaultProps.label].substr(0, 4) }}
            {{
              selectedArr[0][defaultProps.label].length > 4 ? "..." : ""
            }}</el-tag
          >
          <!-- 剩余选中项数量标签 -->
          <el-tag v-show="selectedArr.length > 1"
            >+{{ selectedArr.length - 1 }}</el-tag
          >
        </span>
        <!-- 单选模式：显示选中项文本，最多显示12个字符 -->
        <span class="single" v-else-if="selectedArr.length"
          >{{ selectedArr[0][defaultProps.label].substr(0, 12) }}
          {{
            selectedArr[0][defaultProps.label].length > 12 ? "..." : ""
          }}</span
        >
        <!-- 默认占位文本 -->
        <span v-else>请选择</span>
        <!-- 下拉箭头图标 -->
        <i class="el-icon-arrow-down"></i>
      </div>

      <!-- 下拉列表容器 -->
      <div class="list-popover">
        <!-- 操作栏：全选、搜索、远程检索 -->
        <div class="btn">
          <!-- 全选复选框（仅多选模式显示） -->
          <el-checkbox @change="_allChange" v-if="multiple && showAllSelection"
            >全选</el-checkbox
          >
          <!-- 搜索输入框 -->
          <el-input
            class="search"
            size="small"
            placeholder="请输入关键字搜索"
            v-model="searchText"
          />
          <!-- 远程检索按钮（可选功能） -->
          <div class="an" v-if="remoteSearch">
            <el-button type="primary" icon="el-icon-search" size="small"
              >全国检索</el-button
            >
          </div>
        </div>

        <!-- 虚拟滚动列表容器 -->
        <div class="list" ref="list">
          <!-- 占位空间：用于虚拟滚动计算总高度 -->
          <div
            class="space"
            ref="space"
            :style="'height:' + _listDataFilter.length * lineHeight + 'px'"
          ></div>
          <!-- 实际渲染的列表项 -->
          <ul ref="listUl" v-show="list.length">
            <li
              v-for="item in list"
              @click.exact="_nodeClick(item)"
              :style="'padding-left:' + 1.2 * item.level + 'em'"
              :class="item.checked && !multiple ? 'active-li' : ''"
              :key="item[nodeKey] + key"
            >
              <!-- 展开/收缩图标（仅父节点显示） -->
              <i
                v-if="item.children"
                @click.stop="_changeStatus(item)"
                :class="item.collapse ? 'hide' : ''"
                class="el-icon-caret-bottom"
              ></i>
              <!-- 子节点占位符 -->
              <i v-else>&nbsp;</i>
              <!-- 多选复选框 -->
              <el-checkbox
                v-if="multiple"
                @change="_changeBox(item)"
                :indeterminate="item.isIndeterminate"
                :checked="item.checked"
                >{{ item[defaultProps.label] }}</el-checkbox
              >
              <!-- 单选文本 -->
              <div v-else>{{ item[defaultProps.label] }}</div>
            </li>
          </ul>
          <!-- 无数据提示 -->
          <p v-if="!list.length">暂无数据</p>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
/**
 * 全局树形结构映射表
 * 用于快速查找节点及其父级关系，避免重复遍历
 * key: 节点ID, value: 节点对象（包含level、collapse等扩展属性）
 */
const treeMap = {};

/**
 * 深度优先遍历将树形结构转换为扁平列表
 *
 * 功能说明：
 * - 将嵌套的树形结构转换为扁平数组，便于虚拟滚动
 * - 为每个节点添加层级、展开状态、选中状态等扩展属性
 * - 建立父子节点关系映射，支持快速查找
 *
 * @param {Array} tree 树形结构数组（根节点数组）
 * @param {boolean} defaultExpandAll 是否默认展开所有节点
 * @param {Array} selectedId 已选中的节点ID数组
 * @param {string} nodeKey 节点唯一标识字段名，默认 'id'
 * @param {string} childrenKey 子节点属性名，默认 'children'
 * @param {number} initialLevel 初始层级，默认 0
 * @returns {Array} 扁平化后的列表，每个节点包含扩展属性
 */
function treeToListDFS(
  tree,
  defaultExpandAll,
  selectedId,
  nodeKey = "id",
  nodeLable = "lable",
  childrenKey = "children",
  initialLevel = 0
) {
  const result = [];

  /**
   * 递归遍历节点
   * @param {Object} node 当前节点
   * @param {number} currentLevel 当前层级
   * @param {number|string} pNodeId 父节点ID，根节点为 -1
   */
  const traverse = (node, currentLevel, pNodeId = -1) => {
    // 创建包含扩展属性的节点对象（不修改原对象）
    const nodeWithLevel = Object.seal({
      data: node,
      [nodeKey]: node[nodeKey],
      [nodeLable]: node[nodeLable],
      level: currentLevel, // 节点层级，用于缩进显示
      collapse: !defaultExpandAll, // 是否收缩，默认收缩状态
      isIndeterminate: false,
      checked: selectedId.includes(node[nodeKey]), // 是否选中
      hide: currentLevel != 0 ? !defaultExpandAll : false, // 是否隐藏（非根节点在非全部展开时隐藏）
      children: !!(node[childrenKey] && node[childrenKey].length), // 是否有子节点
      idx: result.length, // 在扁平数组中的索引
      fatherId: pNodeId, // 父节点ID
    });
    // 将节点存入全局映射表，便于后续快速查找父级关系
    treeMap[node[nodeKey]] = nodeWithLevel;
    result.push(nodeWithLevel);

    // 若有子节点，递归遍历（子节点层级+1）
    if (node[childrenKey] && node[childrenKey].length) {
      node[childrenKey].forEach((child) => {
        traverse(child, currentLevel + 1, node[nodeKey]);
      });
    }
  };

  // 从根节点开始遍历
  tree.forEach((root) => traverse(root, initialLevel));
  return result;
}

// 虚拟滚动每页显示的行数
const LINES = 20;

export default {
  name: "vTreeSelect",

  data() {
    return {
      popoverWidth: 150, // 弹出层宽度
      isShowSelect: false, // 是否显示下拉框
      start: 0,
      filter: 'filter',
      key: "key", //
      list: [], // 当前渲染的列表数据
      listData: [], // 完整的扁平化列表数据
      searchText: "", // 搜索关键字
      ids: {}, // 搜索匹配的节点ID数组
    };
  },
  model: {
    prop: "selectedId",
    event: "change",
  },
  props: {
    selectedId: {
      type: [String, Array],
      default() {
        return "";
      },
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    defaultProps: {
      type: Object,
      default() {
        return {
          label: "label",
          children: "children",
        };
      },
    },
    nodeKey: {
      type: String,
      default: "id",
    },
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    lineHeight: {
      type: Number,
      default: 30,
    },
    // 配置是否可多选
    multiple: {
      type: Boolean,
      default() {
        return false;
      },
    },
    checkStrictly: {
      type: Boolean,
      default: false,
    },
    showAllSelection: {
      type: Boolean,
      default: false,
    },
    remoteSearch: {
      type: Boolean,
      default: false,
    },
  },
  created() {},
  computed: {
    selectedArr() {
      if (this.key) {
        return this.listData.filter((item) => item.checked);
      }
    },
    _listDataFilter() {
      if (this.filter) {
        if (this.searchText) {
          let arr = this.listData.filter(
            (item) => this.ids[item[this.nodeKey]]
          );
          return arr;
        }
        return this.listData.filter((item) => !item.hide);
      }
    },
    // 实际行数
    _totalLine() {
      return this.listData.length;
    },
  },
  mounted() {
    this.popoverWidth = this.$refs.xz_content.clientWidth + 10;
    this.$refs.list &&
      this.$refs.list.addEventListener("scroll", this._wheelFn);
    document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
    this.$refs.list &&
      this.$refs.list.removeEventListener("scroll", this._wheelFn);
  },
  methods: {
    // 返回选中节点
    getCurrentNode() {
      return this.selectedArr;
    },
    handleClickOutside(e) {
      if (this.$refs.xz_content && !this.$refs.xz_content.contains(e.target)) {
        this.isShowSelect = false;
      }
    },
    closeTag(idx) {
      this.selectedArr[idx].checked = false;
    },
    _allChange(value) {
      this.listData.forEach((item) => {
        item.checked = value;
      });
      this.$emit(
        "change",
        this.selectedArr.map((item) => item[this.nodeKey])
      );
    },
    _nodeClick(data) {
      if (this.multiple) {
        this.$emit(
          "change",
          this.selectedArr.map((item) => item[this.nodeKey])
        );
      } else {
        if (this.selectedArr[0]) {
          this.selectedArr[0].checked = false;
        }
        data.checked = true;
        this.$emit("change", this.selectedArr[0][this.nodeKey]);
        this.isShowSelect = false;
      }
    },
    _changeBox(item) {
      const startIndex = item.idx;
      const currentNode = this.listData[startIndex];
      item.isIndeterminate = false;
      item.checked = !item.checked;
      // 如果不需要父子级联动，直接返回
      if (this.checkStrictly) {
        this._nodeClick(item);
        return;
      }
      // 1. 更新所有子节点状态（向下传播）
      this._updateChildrenStatus(currentNode, currentNode.checked);

      // 2. 更新所有父节点状态（向上传播）
      this._updateParentStatus(item);
      this._nodeClick(item);
      this.key = Math.random();
    },
    /**
     * 更新所有子节点状态（向下传播）
     * @param {Object} parentNode 父节点
     * @param {Boolean} checked 选中状态
     */
    _updateChildrenStatus(parentNode, checked) {
      const startIndex = parentNode.idx;
      const parentLevel = parentNode.level;

      // 遍历所有子节点
      for (let i = startIndex + 1; i < this.listData.length; i++) {
        const node = this.listData[i];

        // 如果层级小于等于父级层级，说明已经超出子节点范围
        if (node.level <= parentLevel) break;

        // // 搜索模式下只更新可见的子节点
        // if (this.searchText && this.ids && !this.ids[node[this.nodeKey]]) {
        //   continue
        // }

        // 更新子节点状态
        node.checked = checked;
        node.isIndeterminate = false;
      }
    },

    /**
     * 更新所有父节点状态（向上传播）
     * @param {Object} childNode 子节点
     */
    _updateParentStatus(childNode) {
      let currentNode = childNode;

      // 逐级向上更新父节点
      while (currentNode && currentNode.fatherId !== -1) {
        const parentNode = treeMap[currentNode.fatherId];
        if (!parentNode) break;

        // 计算父节点的状态
        const parentStatus = this._calculateParentStatus(parentNode);

        // 更新父节点状态
        parentNode.checked = parentStatus.checked
        parentNode.isIndeterminate = parentStatus.isIndeterminate

        // 继续向上更新
        currentNode = parentNode;
      }
    },

    /**
     * 计算父节点应该的状态
     * @param {Object} parentNode 父节点
     * @returns {Object} { checked: boolean, isIndeterminate: boolean }
     */
    _calculateParentStatus(parentNode) {
      const startIndex = parentNode.idx;
      const parentLevel = parentNode.level;
      let checkedCount = 0;
      let totalCount = 0;
      let hasIndeterminate = false;

      // 遍历所有直接子节点
      for (let i = startIndex + 1; i < this.listData.length; i++) {
        const node = this.listData[i];

        // 如果层级小于等于父级层级，说明已经超出子节点范围
        if (node.level <= parentLevel) break;

        // 只统计直接子节点（层级为父级+1）
        if (node.level === parentLevel + 1) {
          totalCount++;

          if (node.isIndeterminate) {
            hasIndeterminate = true;
          } else if (node.checked) {
            checkedCount++;
          }
        }
      }

      // 根据统计结果确定父节点状态
      if (totalCount === 0) {
        // 没有子节点，保持原状态
        return {
          checked: parentNode.checked,
          isIndeterminate: false,
        };
      }

      if (hasIndeterminate) {
        // 有子节点处于半选状态，父节点也应该是半选
        return {
          checked: false,
          isIndeterminate: true,
        };
      }

      if (checkedCount === 0) {
        // 所有子节点都未选中
        return {
          checked: false,
          isIndeterminate: false,
        };
      }

      if (checkedCount === totalCount) {
        // 所有子节点都选中
        return {
          checked: true,
          isIndeterminate: false,
        };
      }

      // 部分子节点选中
      return {
        checked: false,
        isIndeterminate: true,
      };
    },
    _showFilter() {
      for (let index = 0; index < this.listData.length; index++) {
        const item = this.listData[index];
        item.collapse = !this.defaultExpandAll;
        item.hide = item.level != 0 ? !this.defaultExpandAll : false;
      }
    },
    // 点击展开收缩
    _changeStatus(item) {
      const startIndex = item.idx;
      const currentNode = this.listData[startIndex];
      const isExpanding = !currentNode.collapse;
      currentNode.collapse = isExpanding;
      // 优化遍历逻辑
      const currentLevel = currentNode.level;
      for (let index = startIndex + 1; index < this.listData.length; index++) {
        const node = this.listData[index];
        const nodeLevel = node.level;
        // 如果当前节点层级大于等于当前操作节点层级，说明已经超出子节点范围
        if (nodeLevel <= currentLevel) break;
        // 展开时只显示直接子级，收缩时隐藏所有子级
        if (!isExpanding) {
          // 只展开直接子级
          if (nodeLevel === currentLevel + 1) {
            node.hide = isExpanding;
          }
        } else {
          // 收缩时隐藏所有子级
          node.collapse = isExpanding;
          node.hide = isExpanding;
        }
      }
      this._wheelFn();
    },
    // 滚动监听
    _wheelFn() {
      const top = this.$refs.list ? this.$refs.list.scrollTop : 0;
      this.filter = Math.random();
      const arr = this._listDataFilter;
      // 如果滚动条已经滚动到最底部，则显示最后
      this.start = top ? Math.ceil(top / this.lineHeight) : 0;
      // 从0开始
      if (this.start < 0) {
        this.start = 0;
      }
      if (this.$refs.listUl) {
        this.$refs.listUl.style.top = top + "px";
      }
      // 末行不足一行 如果上次显示的就已经是所有了 则不更新
      if (arr.length - this.start >= 0) {
        this.list = arr.slice(this.start, this.start + LINES);
      }
    },
  },
  watch: {
    searchText(v) {
      if (v) {
        let ids = {};
        let arr = this.listData.filter(
          (item) => item[this.defaultProps.label].indexOf(this.searchText) > -1
        );
        const that = this;
        function deepFn(citem) {
          let ditem = treeMap[citem["fatherId"]];
          while (ditem) {
            ditem.collapse = false;
            ditem.hide = false;
            ids[ditem[that.nodeKey]] = true;
            ditem = treeMap[ditem["fatherId"]];
          }
        }
        arr.forEach((item) => {
          item.collapse = false;
          item.hide = false;
          ids[item[that.nodeKey]] = true;
          deepFn(item);
        });
        this.ids = ids;
      } else {
        // 将过滤出来的节点如果有子级就全部显示出来
        this._showFilter();
        this.ids = null;
      }
      setTimeout(() => {
        this.$refs.list.scrollTop = 0;
        this._wheelFn();
      });
    },
    isShowSelect(v) {
      if (v) {
        this._wheelFn();
      }
    },
    data: {
      handler(v, oldv) {
        if (v && v.length) {
          this.listData = treeToListDFS(
            v,
            this.defaultExpandAll,
            this.multiple ? this.selectedId : [this.selectedId],
            this.nodeKey,
            this.defaultProps.label
          );
          this._wheelFn();
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped lang="scss">
.virtualSelect {
  border: 1px solid #a9c4df;
  background: #fff;
  height: 34px;
  line-height: 34px;
  border-radius: 3px;
  padding: 0 10px;
  outline: none;
  cursor: pointer;
  user-select: none;
  .xz {
    display: flex;
    outline: none;
    > span {
      flex: 1;
      overflow: hidden;
      color: #879bc1;
      &.single {
        color: #4f5e7b;
      }
    }
    .el-tag {
      line-height: 22px;
      height: 24px;
      font-size: 16px;
      color: #4084f0;
      margin-top: 3px;
    }
    i {
      width: 20px;
      line-height: 34px;
    }
  }
}
</style>

<style lang="scss">
.list-popover {
  min-height: 100px;
  max-height: 400px;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  position: relative;
  .list {
    overflow: auto;
    flex: 1;
    position: relative;
  }
  .btn {
    height: 36px;
    line-height: 36px;
    display: flex;

    background: #fff;
    .search {
      padding: 0 10px;
      font-size: 14px;
    }
    .an {
      margin-left: 10px;
      position: relative;
      top: -1px;
    }
  }
  ul {
    list-style: none;
    user-select: none;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    li {
      line-height: 30px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      font-size: 16px;
      height: 30px;
      cursor: pointer;
      &.active-li {
        background: #d7e5f9;
        color: #165ac6;
      }
      .el-checkbox {
        display: flex;
        overflow: hidden;
        align-items: center;
        flex: 1;
        .el-checkbox__input {
          position: relative;
          top: 1px;
          margin: 0;
        }
        .el-checkbox__label {
          text-overflow: ellipsis;
          overflow: hidden;
          line-height: 16px !important;
        }
      }
      i {
        display: inline-block;
        width: 14px;
        color: #a9c4df;
        margin-right: 5px;
        margin-top: 2px;
        &.el-icon-caret-bottom {
          cursor: pointer;
        }
        &.hide {
          transform-origin: 50% 50%;
          transform: rotate(-90deg);
        }
      }
    }
    .el-checkbox .el-checkbox__label {
      text-indent: 0;
      font-size: 16px;
      color: #606266;
    }
    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: #606266;
    }
  }
}
.treeSelect_v_popover[x-placement^="bottom"] {
  margin-top: 4px;
  margin-left: -10px;
  padding: 5px;
  .popper__arrow {
    display: none;
  }
  p {
    text-align: center;
    color: #b1b8c5;
    padding-top: 20px;
  }
}
</style>
