<template>
  <div class="virtualSelect" role="button" tabindex="0" aria-label="请选择">
    <el-popover
      v-model="isShowSelect"
      popper-class="treeSelect_v_popover"
      placement="bottom-start"
      :width="popoverWidth"
      trigger="manual"
    >
      <div
        class="xz"
        ref="xz_content"
        slot="reference"
        @click="isShowSelect = !isShowSelect"
      >
        <span v-if="multiple && selectedArr.length"
          ><el-tag closable @close="closeTag(0)"
            >{{ selectedArr[0][defaultProps.label].substr(0, 4) }}
            {{
              selectedArr[0][defaultProps.label].length > 4 ? '...' : ''
            }}</el-tag
          >
          <el-tag v-show="selectedArr.length > 1"
            >+{{ selectedArr.length - 1 }}</el-tag
          >
        </span>
        <span class="single" v-else-if="selectedArr.length"
          >{{ selectedArr[0][defaultProps.label].substr(0, 12) }}
          {{
            selectedArr[0][defaultProps.label].length > 12 ? '...' : ''
          }}</span
        >
        <span v-else>请选择</span>
        <i class="el-icon-arrow-down"></i>
      </div>

      <div class="list-popover">
        <div class="btn">
          <el-checkbox
            @change="_allChange"
            v-if="multiple && showAllSelection"
            >全选</el-checkbox
          >
          <el-input class="search"  size="small" placeholder="请输入关键字搜索" v-model="searchText" />
          <div class="an" v-if="remoteSearch">
            <el-button type="primary" icon="el-icon-search" size="small">全国检索</el-button>
          </div>

        </div>
        <div class="list" ref="list">
          <div
            class="space"
            ref="space"
            :style="'height:' + _listDataFilter.length * lineHeight + 'px'"
          ></div>
          <ul ref="listUl" v-show="list.length">
            <li
              v-for="item in list"
              @click.exact="_nodeClick(item)"
              :style="'padding-left:' + 1.2 * item.level + 'em'"
              :class="item.checked && !multiple ? 'active-li' : ''"
              :key="item[nodeKey]"
            >
              <i
                v-if="item.children"
                @click.stop="_changeStatus(item)"
                :class="item.collapse ? 'hide' : ''"
                class="el-icon-caret-bottom"
              ></i>
              <i v-else>&nbsp;</i>
              <el-checkbox
                v-if="multiple"
                @change="_changeBox(item)"
                :indeterminate="item.isIndeterminate"
                v-model="item.checked"
                >{{ item[defaultProps.label] }}</el-checkbox
              >
              <div v-else>{{ item[defaultProps.label] }}</div>
            </li>
          </ul>
          <p v-if="!list.length">暂无数据</p>
          </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
/* 深度优先遍历将树转为列表
 * @param {Array} tree 树形结构数组（根节点数组）
 * @param {string} childrenKey 子节点属性名，默认 'children'
 * @returns {Array} 扁平化后的列表
 */
const treeMap = {}
function treeToListDFS(
  tree,
  defaultExpandAll,
  selectedId,
  nodeKey = 'id',
  childrenKey = 'children',
  initialLevel = 0
) {
  const result = []

  const traverse = (node, currentLevel, pNodeId = -1) => {
    // 复制节点并添加level字段（不修改原对象）
    const nodeWithLevel = {
      ...node,
      level: currentLevel,
      collapse: !defaultExpandAll,
      checked: selectedId.includes(node[nodeKey]),
      hide: currentLevel != 0 ? !defaultExpandAll : false,
      children: !!(node[childrenKey] && node[childrenKey].length),
      idx: result.length,
      fatherId: pNodeId,
    }
    // 存一份结构 后续父级
    treeMap[node[nodeKey]] = nodeWithLevel
    result.push(nodeWithLevel)
    // 若有子节点，递归遍历（子节点层级+1）
    if (node[childrenKey] && node[childrenKey].length) {
      node[childrenKey].forEach((child) => {
        traverse(child, currentLevel + 1, node[nodeKey])
      })
    }
  }
  // 根节点从初始层级开始遍历
  tree.forEach((root) => traverse(root, initialLevel))
  return result
}

const LINES = 20
export default {
  name: 'vTreeSelect',
  data() {
    return {
      popoverWidth: 150,
      isShowSelect: false,
      start: 0,
      list: [],
      listData: [],
      searchText: '',
    }
  },
  model: {
    prop: 'selectedId',
    event: 'change',
  },
  props: {
    selectedId: {
      type: [String, Array],
      default() {
        return ''
      },
    },
    data: {
      type: Array,
      default() {
        return []
      },
    },
    defaultProps: {
      type: Object,
      default() {
        return {
          label: 'label',
          children: 'children',
        }
      },
    },
    nodeKey: {
      type: String,
      default: 'id',
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
        return false
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
      return this.listData.filter((item) => item.checked)
    },
    _listDataFilter() {
      if(this.searchText) {
        console.log(222)
        console.time('filter')
        let arr = this.listData.filter((item) => this.ids[item[this.nodeKey]])
        console.timeEnd('filter')
        return arr
      }
      return this.listData.filter((item) => !item.hide)
    },
    // 实际行数
    _totalLine() {
      return this.listData.length
    },
  },
  mounted() {
    this.popoverWidth = this.$refs.xz_content.clientWidth + 10
    this.$refs.list.addEventListener('scroll', this._wheelFn)
    document.addEventListener('click', this.handleClickOutside)
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside)
    this.$refs.list.removeEventListener('scroll', this._wheelFn)
  },
  methods: {
    // 返回选中节点
    getCurrentNode() {
      return this.selectedArr
    },
    handleClickOutside(e) {
      if (this.$refs.xz_content && !this.$refs.xz_content.contains(e.target)) {
        this.isShowSelect = false
      }
    },
    closeTag(idx) {
      this.selectedArr[idx].checked = false
    },
    _allChange(value) {
      this.listData.forEach((item) => {
        item.checked = value
      })
      this.$emit('change', this.selectedArr.map(item => item[this.nodeKey]))
    },
    _nodeClick(data) {
      if (this.multiple) {
        this.$emit('change', this.selectedArr.map(item => item[this.nodeKey]))
      } else {
        if(this.selectedArr[0]) {
          this.selectedArr[0].checked = false
        }
        data.checked = true
        this.$emit('change', this.selectedArr[0][this.nodeKey])
        this.isShowSelect = false
      }
    },
    _changeBox(item) {
      const startIndex = item.idx
      const currentNode = this.listData[startIndex]
      item.isIndeterminate = false

      // 如果不需要父子级联动，直接返回
      if (this.checkStrictly) {
        this._nodeClick(item)
        return
      }
      console.time('changeBox')
      // 1. 更新所有子节点状态（向下传播）
      this._updateChildrenStatus(currentNode, currentNode.checked)

      // 2. 更新所有父节点状态（向上传播）
      this._updateParentStatus(item)
      console.timeEnd('changeBox')
      this._nodeClick(item)
    },
    /**
     * 更新所有子节点状态（向下传播）
     * @param {Object} parentNode 父节点
     * @param {Boolean} checked 选中状态
     */
    _updateChildrenStatus(parentNode, checked) {
      const startIndex = parentNode.idx
      const parentLevel = parentNode.level

      // 遍历所有子节点
      for (let i = startIndex + 1; i < this.listData.length; i++) {
        const node = this.listData[i]

        // 如果层级小于等于父级层级，说明已经超出子节点范围
        if (node.level <= parentLevel) break

        // 搜索模式下只更新可见的子节点
        if (this.searchText && this.ids && !this.ids[node[this.nodeKey]]) {
          continue
        }

        // 更新子节点状态
        this.$set(node, 'checked', checked)
        this.$set(node, 'isIndeterminate', false)
      }
    },

    /**
     * 更新所有父节点状态（向上传播）
     * @param {Object} childNode 子节点
     */
    _updateParentStatus(childNode) {
      let currentNode = childNode

      // 逐级向上更新父节点
      while (currentNode && currentNode.fatherId !== -1) {
        const parentNode = treeMap[currentNode.fatherId]
        if (!parentNode) break

        // 计算父节点的状态
        const parentStatus = this._calculateParentStatus(parentNode)

        // 更新父节点状态
        this.$set(parentNode, 'checked', parentStatus.checked)
        this.$set(parentNode, 'isIndeterminate', parentStatus.isIndeterminate)

        // 继续向上更新
        currentNode = parentNode
      }
    },

    /**
     * 计算父节点应该的状态
     * @param {Object} parentNode 父节点
     * @returns {Object} { checked: boolean, isIndeterminate: boolean }
     */
    _calculateParentStatus(parentNode) {
      const startIndex = parentNode.idx
      const parentLevel = parentNode.level
      let checkedCount = 0
      let totalCount = 0
      let hasIndeterminate = false

      // 遍历所有直接子节点
      for (let i = startIndex + 1; i < this.listData.length; i++) {
        const node = this.listData[i]

        // 如果层级小于等于父级层级，说明已经超出子节点范围
        if (node.level <= parentLevel) break

        // 只统计直接子节点（层级为父级+1）
        if (node.level === parentLevel + 1) {
          totalCount++

          if (node.isIndeterminate) {
            hasIndeterminate = true
          } else if (node.checked) {
            checkedCount++
          }
        }
      }

      // 根据统计结果确定父节点状态
      if (totalCount === 0) {
        // 没有子节点，保持原状态
        return {
          checked: parentNode.checked,
          isIndeterminate: false
        }
      }

      if (hasIndeterminate) {
        // 有子节点处于半选状态，父节点也应该是半选
        return {
          checked: false,
          isIndeterminate: true
        }
      }

      if (checkedCount === 0) {
        // 所有子节点都未选中
        return {
          checked: false,
          isIndeterminate: false
        }
      }

      if (checkedCount === totalCount) {
        // 所有子节点都选中
        return {
          checked: true,
          isIndeterminate: false
        }
      }

      // 部分子节点选中
      return {
        checked: false,
        isIndeterminate: true
      }
    },
    _showFilter() {
      for (let index = 0; index < this.listData.length; index++) {
        const item = this.listData[index];
        item.collapse = !this.defaultExpandAll
        item.hide = item.level != 0 ? !this.defaultExpandAll : false
      }
    },
    // 点击展开收缩
    _changeStatus(item) {
      const startIndex = item.idx
      const currentNode = this.listData[startIndex]
      const isExpanding = !currentNode.collapse
      currentNode.collapse = isExpanding
      // 优化遍历逻辑
      const currentLevel = currentNode.level
      for (let index = startIndex + 1; index < this.listData.length; index++) {
        const node = this.listData[index]
        const nodeLevel = node.level
        // 如果当前节点层级大于等于当前操作节点层级，说明已经超出子节点范围
        if (nodeLevel <= currentLevel) break
        // 展开时只显示直接子级，收缩时隐藏所有子级
        if (!isExpanding) {
          // 只展开直接子级
          if (nodeLevel === currentLevel + 1) {
            node.hide = isExpanding
          }
        } else {
          // 收缩时隐藏所有子级
          node.collapse = isExpanding
          node.hide = isExpanding
        }
      }
      this._wheelFn()
    },
    // 滚动监听
    _wheelFn() {
      const top = this.$refs.list ? this.$refs.list.scrollTop : 0
      const arr = this._listDataFilter
      // 如果滚动条已经滚动到最底部，则显示最后
      this.start = top ? Math.ceil(top / this.lineHeight) : 0
      // 从0开始
      if (this.start < 0) {
        this.start = 0
      }
      if (this.$refs.listUl) {
        this.$refs.listUl.style.top = top + 'px'
      }
      // 末行不足一行 如果上次显示的就已经是所有了 则不更新
      if (arr.length - this.start >= 0) {
        this.list = arr.slice(this.start, this.start + LINES)
      }
    },
  },
  watch: {
    searchText(v) {
      if(v) {
        let ids = {}
        let arr = this.listData.filter((item) => item[this.defaultProps.label].indexOf(this.searchText) > -1)
        const that = this
        function deepFn(citem) {
          let ditem = treeMap[citem['fatherId']]
          while(ditem) {
            ditem.collapse = false
            ditem.hide = false
            ids[ditem[that.nodeKey]] = true
            ditem = treeMap[ditem['fatherId']]
          }
        }
        arr.forEach(item => {
          item.collapse = false
          item.hide = false
          ids[item[that.nodeKey]] = true
          deepFn(item)
        })
        this.ids = ids
      } else{
        // 将过滤出来的节点如果有子级就全部显示出来
        this._showFilter()
        this.ids = null
      }
      setTimeout(() => {
        this.$refs.list.scrollTop = 0
        this._wheelFn()
      })
    },
    isShowSelect(v) {
      if (v) {
        this._wheelFn()
      }
    },
    data: {
      handler(v, oldv) {
        if (v && v.length) {
          this.listData = treeToListDFS(
            v,
            this.defaultExpandAll,
            this.multiple ? this.selectedId : [this.selectedId],
            this.nodeKey
          )
          this._wheelFn()
        }
      },
      immediate: true,
    },
  },
}
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
  .list{
     overflow: auto;
     flex: 1;
     position: relative;
  }
  .btn{
    height: 36px;
    line-height: 36px;
    display: flex;

    background: #fff;
    .search{
      padding: 0 10px;
      font-size: 14px;
    }
    .an{
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
        margin-top: 3px;
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
    }
    .el-checkbox__input.is-checked+.el-checkbox__label{
      color: #606266;
    }
  }
}
.treeSelect_v_popover[x-placement^='bottom'] {
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
