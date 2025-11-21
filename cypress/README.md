# VTreeSelect Cypress E2E 测试

## 概述

这个测试套件为 VTreeSelect 虚拟树选择组件提供了全面的端到端测试，覆盖了组件的所有主要功能和边界情况。

## 测试覆盖范围

### 基础功能
- ✅ 组件正确渲染
- ✅ 打开/关闭下拉框
- ✅ 点击外部区域关闭

### 单选模式
- ✅ 选择单个节点
- ✅ 替换之前的选择
- ✅ 选中节点高亮显示

### 多选模式
- ✅ 复选框显示
- ✅ 选择多个节点
- ✅ 全选/取消全选
- ✅ 标签显示和关闭

### 搜索功能
- ✅ 搜索框显示
- ✅ 关键字过滤
- ✅ 清空搜索
- ✅ 无结果提示
- ✅ 全国检索按钮

### 展开/收缩
- ✅ 展开图标显示
- ✅ 展开/收缩子节点
- ✅ 图标旋转动画

### 虚拟滚动
- ✅ 大数据量支持
- ✅ 滚动更新可见列表
- ✅ 滚动容器样式

### 键盘交互
- ✅ Tab键聚焦
- ✅ Enter键打开
- ✅ Escape键关闭

### 响应式
- ✅ 移动端适配
- ✅ 不同屏幕宽度

### 边界情况
- ✅ 空数据处理
- ✅ 单个节点
- ✅ 深层嵌套
- ✅ 快速连续点击

### 性能测试
- ✅ 大数据打开速度
- ✅ 搜索响应时间

### 可访问性
- ✅ ARIA属性
- ✅ 屏幕阅读器支持

## 运行测试

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 运行测试

#### 交互式模式（推荐用于开发）
```bash
npm run test:e2e
```

#### 无头模式（推荐用于CI/CD）
```bash
npm run test:e2e:headless
```

#### 指定浏览器
```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
```

## 测试结构

```
cypress/
├── e2e/
│   └── vTreeSelect.cy.js          # 主测试文件
├── support/
│   ├── e2e.js                     # 全局设置和自定义命令
│   └── commands.js                # 自定义Cypress命令
├── fixtures/
│   └── treeData.json              # 测试数据
├── plugins/
│   └── index.js                   # 插件配置
└── README.md                      # 本文档
```

## 自定义命令

测试套件提供了一些便捷的自定义命令：

```javascript
// 打开树选择器
cy.openTreeSelect()

// 关闭树选择器
cy.closeTreeSelect()

// 选择节点（单选）
cy.selectTreeNode(0)

// 勾选节点（多选）
cy.checkTreeNode(0)

// 搜索
cy.searchTree('关键字')

// 展开节点
cy.expandTreeNode(0)

// 获取选中文本
cy.getSelectedText()

// 获取选中数量
cy.getSelectedCount()

// 等待虚拟滚动
cy.waitForVirtualScroll()

// 滚动到指定位置
cy.scrollToPosition('bottom')

// 验证节点可见性
cy.verifyNodeVisible('节点文本')
cy.verifyNodeHidden('节点文本')

// 批量操作
cy.selectMultipleNodes([0, 1, 2])
cy.selectAllNodes()
cy.clearAllSelections()
```

## 测试数据

测试使用多种数据场景：

- **小数据集**: 基本功能测试
- **大数据集**: 虚拟滚动和性能测试
- **空数据**: 边界情况测试
- **单节点**: 特殊情况测试
- **深层嵌套**: 展开收缩测试

## 环境变量

可以通过环境变量配置测试行为：

```javascript
// cypress.config.js
env: {
  apiUrl: 'http://rap2api.taobao.org/app/mock/16107/api/tree',
  timeout: 10000
}
```

## 性能基准

测试中包含性能验证：

- 组件打开时间 < 2秒
- 搜索响应时间 < 1秒
- 虚拟滚动流畅度

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: cypress-io/github-action@v4
        with:
          start: npm run dev
          wait-on: 'http://localhost:8080'
          browser: chrome
```

## 调试技巧

1. **使用 Cypress Studio**: 在测试文件中添加 `/* Cypress Studio */` 注释
2. **截图和视频**: 自动生成失败时的截图和视频
3. **时间旅行**: Cypress 自动记录每一步操作
4. **开发者工具**: 测试时可以使用浏览器开发者工具

## 最佳实践

1. **测试独立性**: 每个测试应该独立运行
2. **数据清理**: 使用 `beforeEach` 重置状态
3. **等待策略**: 使用 Cypress 的自动等待机制
4. **选择器稳定性**: 使用稳定的选择器，避免依赖动态类名
5. **断言完整性**: 验证用户可见的结果

## 故障排除

### 常见问题

1. **元素未找到**: 检查元素是否真的可见和可交互
2. **超时错误**: 增加超时时间或检查网络请求
3. **测试不稳定**: 添加适当的等待和断言

### 调试命令

```javascript
// 暂停测试
cy.pause()

// 记录日志
cy.log('调试信息')

// 检查元素状态
cy.get('.selector').should('be.visible').debug()
```

## 贡献指南

添加新测试时请遵循：

1. 使用描述性的测试名称
2. 按功能分组测试
3. 添加必要的注释
4. 保持测试简洁和可读性
5. 使用自定义命令简化重复操作

## 更新日志

- **v1.0.0**: 初始版本，覆盖所有主要功能
- **v1.1.0**: 添加性能测试和可访问性测试
- **v1.2.0**: 增强自定义命令和调试功能