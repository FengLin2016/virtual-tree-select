# virtual-tree-select

> 一个虚拟滚动树组件。针对数据量太大会造成渲染 dom 太多，造成页面卡顿，虚拟列表应运而生，而开发过程中还有一种树的结构形式，所以制作了虚拟滚动树，解决 dom 节点过多造成的卡顿。

***注意：不使用elment的组件el-tree、el-select是因为他们的包太大 太重大数据量js内存使用依旧很高，主要是他涉及的功能较多，我这写的简化版***

## 使用步骤

```bash
# 安装组件
npm i virtual-tree-select -S

# 引入组件
import  vSelectTree  from 'virtual-tree-select'

Vue.use(vSelectTree)

# 使用
<virtual-tree-select  :data="totalList" />

```

## 属性

| 属性名       | 类型   | 默认值 | 说明                                                                                   |
| ------------ | ------ | ------ | -------------------------------------------------------------------------------------- |
| data         | Array  | []     | 数据源                                                                                   |
| nodeKey      | String | id     | 每个树节点用来作为唯一标识的属性，整棵树应该是唯一的                                 |
| defaultProps      | Object | {label: 'label',children: 'children'} | 树节点配置
| defaultExpandAll      | Boolean | false     | 全部是否展开
| multiple      | Boolean | false     | 是否多选
| checkStrictly      | Boolean | false     | 是否不级联






