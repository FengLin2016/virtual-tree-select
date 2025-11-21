/// <reference types="cypress" />
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // 任务定义
  on('task', {
    // 生成大量测试数据的任务
    generateLargeTreeData(count = 1000) {
      const data = []
      for (let i = 0; i < count; i++) {
        const node = {
          id: i + 1,
          name: `节点${i + 1}`,
          children: []
        }
        
        // 每10个节点添加一个子节点
        if (i % 10 === 0 && i < count - 1) {
          node.children = [
            {
              id: count + i + 1,
              name: `子节点${i + 1}`
            }
          ]
        }
        
        data.push(node)
      }
      return data
    },

    // 生成深层嵌套数据
    generateDeepNestedData(depth = 5, childrenPerNode = 3) {
      let id = 1
      
      function createNode(level, maxLevel) {
        const node = {
          id: id++,
          name: `节点L${level}-${id}`,
          children: []
        }
        
        if (level < maxLevel) {
          for (let i = 0; i < childrenPerNode; i++) {
            node.children.push(createNode(level + 1, maxLevel))
          }
        }
        
        return node
      }
      
      return [createNode(1, depth)]
    },

    // 记录性能指标
    logPerformance(metricName, value) {
      console.log(`Performance: ${metricName} = ${value}ms`)
      return null
    }
  })

  // 环境变量配置
  config.env = {
    ...config.env,
    baseUrl: config.baseUrl || 'http://localhost:8080',
    defaultTimeout: 10000
  }

  return config
}