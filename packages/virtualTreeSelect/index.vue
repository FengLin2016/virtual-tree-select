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
        <span v-if="$attrs.multiple && selectedArr.length">
          <!-- 第一个选中项标签，最多显示4个字符 -->
          <el-tag closable @close="closeTag(0)"
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
        <span class="single" v-else-if="selectedArr.length"
          >{{ selectedArr[0][$attrs.props.label].substr(0, 12) }}
          {{
            selectedArr[0][$attrs.props.label].length > 12 ? "..." : ""
          }}</span
        >
        <!-- 默认占位文本 -->
        <span v-else>请选择</span>
        <!-- 清空按钮（仅多选模式显示） -->
        <i v-if="$attrs.multiple && selectedArr.length && clearable" @click.stop="clear" class="el-icon-circle-close"></i>
        <!-- 下拉箭头图标 -->
        <i class="el-icon-arrow-down"></i>
      </div>
      <!-- 下拉列表容器 -->
      <div class="list-popover">
        <!-- 操作栏：全选、搜索、远程检索 -->
        <div class="btn">
          <!-- 全选复选框（仅多选模式显示） -->
          <el-checkbox v-model="allChecked" @change="allChange" v-if="$attrs.multiple && showAllSelection"
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
            <el-button @click="remoteSearchFunc" type="primary" icon="el-icon-search" size="small"
              >{{remoteSearchText}}</el-button
            >
          </div>
        </div>
        <!-- 虚拟滚动列表容器 -->
        <virtualTree ref="virtualTree" v-model="selectedIds"  v-bind="$attrs"/>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { virtualTree } from "v-tree-scroll";
export default {
  name: "virtualTreeSelect",
  components: {
    virtualTree
  },
  data() {
    return {
      allChecked: false,
      searchText:'',
      selectedArr: [],
      selectedIds: '',
      popoverWidth: 150, // 弹出层宽度
      isShowSelect: false, // 是否显示下拉框
    };
  },
  model: {
    prop: "selectedId",
    event: "change",
  },
  props: {
    showAllSelection: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    remoteSearch: {
      type: Boolean,
      default: false,
    },
    remoteSearchText: {
      type: String,
      default: "全国搜索",
    },
  },
  created() {},
  computed: {
  },
  mounted() {
    this.popoverWidth = this.$refs.xz_content.clientWidth + 10;
    document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    remoteSearchFunc() {
      this.$emit("remoteSearch");
    },
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
    // 全选
    allChange(value) {
      this.$refs.virtualTree.allChange(value)
    },
    // 清空
    clear() {
      this.allChecked = false
      this.$refs.virtualTree.allChange(false)
    },

  },
  watch: {
    selectedIds() {
      this.selectedArr = this.$refs.virtualTree.selectedArr
    },
    searchText(v) {
      this.$refs.virtualTree.filter(v)
    }
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
      &.el-icon-circle-close{
        display: none;
      }
    }
    &:hover i.el-icon-circle-close{
      display: block;
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
  padding: 5px 5px 5px 10px;
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
