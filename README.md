# v-select-tree

> 一个虚拟滚动树组件。针对数据量太大会造成渲染 dom 太多，造成页面卡顿，虚拟列表应运而生，而开发过程中还有一种树的结构形式，所以制作了虚拟滚动树，解决 dom 节点过多造成的卡顿。

## 使用步骤

```bash
# 安装组件
npm i v-select-tree -S

# 引入组件
import  vSelectTree  from 'v-select-tree'

Vue.use(vSelectTree)

# 使用
<vSelectTree  :data="totalList" />

```