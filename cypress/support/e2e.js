// Import commands.js using ES2015 syntax:
import './commands'
console.log('Support file loaded!'); // 用来验证是否加载
// Alternatively you can use CommonJS syntax:
// require('./commands')

// 全局设置
beforeEach(() => {
  // 设置默认的视口大小
  cy.viewport(1280, 720)

  // 忽略未捕获的异常（某些第三方库可能会抛出）
  Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    if (err.message.includes('ResizeObserver loop limit exceeded')) {
      return false
    }
    return true
  })
})

// 全局自定义命令
Cypress.Commands.add('openTreeSelect', () => {
  cy.get('.xz').click()
  cy.get('.treeSelect_v_popover').should('be.visible')
})

Cypress.Commands.add('closeTreeSelect', () => {
  cy.get('.xz').click()
  cy.get('.treeSelect_v_popover').should('not.exist')
})

Cypress.Commands.add('selectTreeNode', (index = 0) => {
  cy.openTreeSelect()
  cy.get('li').eq(index).click()
})

Cypress.Commands.add('checkTreeNode', (index = 0) => {
  cy.openTreeSelect()
  cy.get('.el-checkbox').eq(index).check()
})

Cypress.Commands.add('searchTree', (keyword) => {
  cy.openTreeSelect()
  cy.get('.search input').clear().type(keyword)
  cy.wait(500) // 等待搜索完成
})

Cypress.Commands.add('expandTreeNode', (index = 0) => {
  cy.openTreeSelect()
  cy.get('.el-icon-caret-bottom').eq(index).click()
  cy.wait(300) // 等待展开动画
})