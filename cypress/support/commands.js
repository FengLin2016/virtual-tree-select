// Custom Cypress commands for VTreeSelect testing

// 获取选中的节点文本
Cypress.Commands.add('getSelectedText', () => {
  return cy.get('.xz').then($el => {
    const text = $el.text()
    return cy.wrap(text.replace(/请选择/, '').trim())
  })
})

// 获取选中的节点数量
Cypress.Commands.add('getSelectedCount', () => {
  return cy.get('.el-tag').then($tags => {
    let count = 0
    $tags.each((i, tag) => {
      const text = Cypress.$(tag).text()
      if (text.includes('+')) {
        count += parseInt(text.replace(/[^\d]/g, ''))
      } else {
        count += 1
      }
    })
    return cy.wrap(count)
  })
})

// 等待虚拟滚动加载完成
Cypress.Commands.add('waitForVirtualScroll', () => {
  cy.wait(300)
  cy.get('.list').should('exist')
})

// 滚动到指定位置
Cypress.Commands.add('scrollToPosition', (position) => {
  cy.get('.list').scrollTo(position)
  cy.waitForVirtualScroll()
})

// 验证节点是否可见
Cypress.Commands.add('verifyNodeVisible', (nodeText) => {
  cy.get('li').contains(nodeText).should('be.visible')
})

// 验证节点是否隐藏
Cypress.Commands.add('verifyNodeHidden', (nodeText) => {
  cy.get('li').contains(nodeText).should('not.exist')
})

// 获取所有可见节点的文本
Cypress.Commands.add('getVisibleNodes', () => {
  return cy.get('li').then($items => {
    const texts = []
    $items.each((i, item) => {
      texts.push(Cypress.$(item).text().trim())
    })
    return cy.wrap(texts)
  })
})

// 验证复选框状态
Cypress.Commands.add('verifyCheckboxState', (index, shouldBeChecked) => {
  cy.get('.el-checkbox').eq(index).find('input').should(
    shouldBeChecked ? 'be.checked' : 'not.be.checked'
  )
})

// 批量选择节点
Cypress.Commands.add('selectMultipleNodes', (indices) => {
  cy.openTreeSelect()
  indices.forEach(index => {
    cy.get('.el-checkbox').eq(index).check()
  })
})

// 清空所有选择
Cypress.Commands.add('clearAllSelections', () => {
  cy.openTreeSelect()
  cy.get('.btn .el-checkbox input').uncheck()
})

// 全选所有节点
Cypress.Commands.add('selectAllNodes', () => {
  cy.openTreeSelect()
  cy.get('.btn .el-checkbox input').check()
})

// 验证搜索结果
Cypress.Commands.add('verifySearchResults', (expectedText) => {
  cy.get('li').each(($el) => {
    cy.wrap($el).should('contain.text', expectedText)
  })
})

// 模拟键盘导航
Cypress.Commands.add('navigateWithKeyboard', (keys) => {
  cy.get('.virtualSelect').focus()
  keys.forEach(key => {
    cy.get('.virtualSelect').type(`{${key}}`)
  })
})

// 验证组件的可访问性属性
Cypress.Commands.add('verifyAccessibility', () => {
  cy.get('.virtualSelect').should('have.attr', 'role')
  cy.get('.virtualSelect').should('have.attr', 'tabindex')
  cy.get('.search input').should('have.attr', 'placeholder')
})