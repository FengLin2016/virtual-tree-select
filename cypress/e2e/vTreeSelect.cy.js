describe('VTreeSelect Component E2E Tests', () => {
  beforeEach(() => {
    // 访问测试页面
    cy.visit('/')

    // 等待组件加载完成
    cy.get('.virtualSelect').should('be.visible')
  })

  describe('基础功能测试', () => {
    it('应该正确渲染组件', () => {
      cy.get('.virtualSelect').should('exist')
      cy.get('.xz').should('exist')
      cy.get('.xz').should('contain.text', '请选择')
      cy.get('.el-icon-arrow-down').should('exist')
    })

    it('应该能够打开和关闭下拉框', () => {
      // 初始状态应该是关闭的
      // cy.get('.treeSelect_v_popover').should('not.exist')

      // 点击打开下拉框
      cy.get('.xz').click()
      cy.get('.treeSelect_v_popover').should('be.visible')
      cy.get('.list-popover').should('be.visible')

      // 再次点击关闭下拉框
      cy.get('.xz').click()
      cy.get('.treeSelect_v_popover').should('not.be.visible')
    })

    it('点击外部区域应该关闭下拉框', () => {
      // 打开下拉框
      cy.get('.xz').click()
      cy.get('.treeSelect_v_popover').should('be.visible')

      // 点击页面其他区域
      cy.get('body').click(0, 0)
      cy.get('.treeSelect_v_popover').should('not.be.visible')
    })
  })

  describe('单选模式测试', () => {
    beforeEach(() => {
      // 切换到单选模式（如果默认是多选）
      cy.get('.virtualSelect').then(($el) => {
        if ($el.find('.el-checkbox').length > 0) {
          // 如果是多选模式，需要重新加载单选版本
          cy.visit('/?mode=single')
        }
      })
    })

    it('应该能够选择单个节点', () => {
      // 打开下拉框
      cy.get('.xz').click()

      // 等待列表加载
      cy.get('li').should('have.length.greaterThan', 0)

      // 点击第一个节点
      cy.get('li').first().click()

      // 验证选择结果
      cy.get('.single').should('exist')
      cy.get('.xz').should('not.contain.text', '请选择')

      // 下拉框应该自动关闭
      cy.get('.treeSelect_v_popover').should('not.exist')
    })

    it('选择新节点应该替换之前的选择', () => {
      // 打开下拉框并选择第一个节点
      cy.get('.xz').click()
      cy.get('li').first().click()

      // 记录第一个节点的文本
      let firstNodeText
      cy.get('.single').then($el => {
        firstNodeText = $el.text()
      })

      // 重新打开并选择第二个节点
      cy.get('.xz').click()
      cy.get('li').eq(1).click()

      // 验证文本已更改
      cy.get('.single').should('not.contain.text', firstNodeText)
    })

    it('选中的节点应该有高亮样式', () => {
      cy.get('.xz').click()
      cy.get('li').first().click()

      // 重新打开验证高亮
      cy.get('.xz').click()
      cy.get('li').first().should('have.class', 'active-li')
    })
  })

  describe('多选模式测试', () => {
    it('应该显示复选框', () => {
      cy.get('.xz').click()
      cy.get('.el-checkbox').should('have.length.greaterThan', 0)
    })

    it('应该能够选择多个节点', () => {
      cy.get('.xz').click()

      // 选择前两个节点
      cy.get('.el-checkbox').eq(0).click()
      cy.get('.el-checkbox').eq(1).click()

      // 验证选中状态
      cy.get('.el-checkbox').eq(0).find('input').should('be.checked')
      cy.get('.el-checkbox').eq(1).find('input').should('be.checked')

      // 验证显示标签
      cy.get('.el-tag').should('have.length.greaterThan', 0)
    })

    it('应该显示全选功能', () => {
      cy.get('.xz').click()
      cy.get('.btn .el-checkbox').should('exist')
      cy.get('.btn .el-checkbox').should('contain.text', '全选')
    })

    it('全选应该选中所有节点', () => {
      cy.get('.xz').click()

      // 点击全选
      cy.get('.btn .el-checkbox input').click()

      // 验证所有复选框都被选中
      cy.get('.el-checkbox input:checked').should('have.length.greaterThan', 0)
    })

    it('应该能够取消全选', () => {
      cy.get('.xz').click()

      // 先全选
      cy.get('.btn .el-checkbox input').click()

      // 再取消全选
      cy.get('.btn .el-checkbox input').click()

      // 验证所有复选框都未选中
      cy.get('.el-checkbox input:not(:checked)').should('have.length.greaterThan', 0)
    })

    it('应该显示选中数量的标签', () => {
      cy.get('.xz').click()

      // 选择多个节点
      cy.get('.el-checkbox').eq(0).click()
      cy.get('.el-checkbox').eq(1).click()
      cy.get('.el-checkbox').eq(2).click()

      // 验证标签显示
      cy.get('.el-tag').should('have.length', 2) // 第一个标签 + 数量标签
      cy.get('.el-tag').last().should('contain.text', '+2')
    })

    it('应该能够关闭标签', () => {
      cy.get('.xz').click()

      // 选择节点
      cy.get('.el-checkbox').eq(0).click()
      cy.get('.el-checkbox').eq(1).click()

      // 关闭第一个标签
      cy.get('.el-tag .el-icon-close').first().click()

      // 验证标签数量减少
      cy.get('.el-tag').should('have.length', 1)
    })
  })

  describe('搜索功能测试', () => {
    it('应该显示搜索框', () => {
      cy.get('.xz').click()
      cy.get('.search input').should('exist')
      cy.get('.search input').should('have.attr', 'placeholder', '请输入关键字搜索')
    })

    it('输入搜索关键字应该过滤数据', () => {
      cy.get('.xz').click()

      // 输入搜索关键字
      cy.get('.search input').type('父节点')

      // 等待搜索完成
      cy.wait(500)

      // 验证搜索结果（应该只显示匹配的节点）
      cy.get('li').each(($el) => {
        cy.wrap($el).should('contain.text', '父节点')
      })
    })

    it('清空搜索应该恢复所有数据', () => {
      cy.get('.xz').click()

      // 先搜索
      cy.get('.search input').type('测试')
      cy.wait(500)

      // 清空搜索
      cy.get('.search input').clear()
      cy.wait(500)

      // 验证数据恢复
      cy.get('li').should('have.length.greaterThan', 0)
    })

    it('无搜索结果应该显示相应提示', () => {
      cy.get('.xz').click()

      // 输入不存在的关键字
      cy.get('.search input').type('不存在的节点xyz')
      cy.wait(500)

      // 验证无结果提示
      cy.get('.list-popover').should('contain.text', '暂无数据')
    })

    it('全国检索按钮应该存在', () => {
      cy.get('.xz').click()
      cy.get('.an .el-button').should('exist')
      cy.get('.an .el-button').should('contain.text', '全国检索')
    })
  })

  describe('展开/收缩功能测试', () => {
    it('应该显示展开图标', () => {
      cy.get('.xz').click()
      cy.get('.el-icon-caret-bottom').should('have.length.greaterThan', 0)
    })

    it('点击展开图标应该展开子节点', () => {
      cy.get('.xz').click()
      cy.wait(300)

      // 获取第一个可展开节点及其子节点的缩进
      cy.get('.el-icon-caret-bottom').first().parent('li').then($parentLi => {
        const parentIndent = $parentLi.css('padding-left')

        // 点击展开
        cy.get('.el-icon-caret-bottom').first().click()
        cy.wait(300)

        // 验证子节点出现（子节点应该有更大的缩进）
        cy.get('li').filter((index, li) => {
          const liIndent = Cypress.$(li).css('padding-left')
          return parseFloat(liIndent) > parseFloat(parentIndent)
        }).should('have.length.greaterThan', 0)
      })
    })

    it('展开的图标应该旋转', () => {
      cy.get('.xz').click()
      // 初始状态
      cy.get('.el-icon-caret-bottom').first().should('have.class', 'hide')

      // 点击展开
      cy.get('.el-icon-caret-bottom').first().click()

      // 验证旋转样式
      cy.get('.el-icon-caret-bottom').first().should('not.have.class', 'hide')
    })

    it('再次点击应该收缩子节点', () => {
      cy.get('.xz').click()

      // 获取第一个可展开节点
      cy.get('.el-icon-caret-bottom').first().parent('li').then($parentLi => {
        const parentIndent = $parentLi.css('padding-left')

        // 先展开
        cy.get('.el-icon-caret-bottom').first().click()
        cy.wait(300)

        // 验证子节点存在
        cy.get('li').filter((index, li) => {
          const liIndent = Cypress.$(li).css('padding-left')
          return parseFloat(liIndent) > parseFloat(parentIndent)
        }).should('have.length.greaterThan', 0)

        // 再收缩
        cy.get('.el-icon-caret-bottom').first().click()
        cy.wait(300)

        // 验证子节点消失（通过检查是否还有更大缩进的节点）
        cy.get('li').filter((index, li) => {
          const liIndent = Cypress.$(li).css('padding-left')
          return parseFloat(liIndent) > parseFloat(parentIndent)
        }).should('have.length', 0)
      })
    })
  })

  describe('虚拟滚动功能测试', () => {
    it('应该支持大量数据的虚拟滚动', () => {
      // 如果有大数据测试版本，访问它
      cy.visit('/?largeData=true')

      cy.get('.xz').click()

      // 验证虚拟滚动容器存在
      cy.get('.list').should('exist')
      cy.get('.space').should('exist')
      cy.get('ul').should('have.css', 'position', 'absolute')
    })

    it('滚动时应该更新可见列表', () => {
      cy.get('.xz').click()

      // 获取初始可见项
      let initialItems
      cy.get('li').then($items => {
        initialItems = $items.length
      })

      // 滚动到底部
      cy.get('.list').scrollTo('bottom')
      cy.wait(300)

      // 验证滚动后的可见项
      cy.get('li').should('have.length.greaterThan', 0)
    })

    it('应该有正确的滚动容器样式', () => {
      cy.get('.xz').click()

      cy.get('.list').should('have.css', 'overflow', 'auto')
      cy.get('.list').should('have.css', 'position', 'relative')
    })
  })

  describe('键盘交互测试', () => {
    it('应该支持Tab键聚焦', () => {
      // 使用Tab键导航到组件
      cy.get('body').tab()
      cy.get('.virtualSelect').should('be.focused')
    })

    it('应该支持Enter键打开下拉框', () => {
      cy.get('.virtualSelect').focus()
      cy.get('.virtualSelect').type('{enter}')
      cy.get('.treeSelect_v_popover').should('be.visible')
    })

    it('应该支持Escape键关闭下拉框', () => {
      cy.get('.xz').click()
      cy.get('.treeSelect_v_popover').should('be.visible')

      cy.get('.virtualSelect').type('{esc}')
      cy.get('.treeSelect_v_popover').should('not.exist')
    })
  })

  describe('响应式测试', () => {
    it('应该在移动端正常工作', () => {
      cy.viewport(375, 667) // iPhone 6/7/8 尺寸

      cy.get('.virtualSelect').should('be.visible')
      cy.get('.xz').click()
      cy.get('.treeSelect_v_popover').should('be.visible')
    })

    it('应该适应不同屏幕宽度', () => {
      // 测试不同宽度
      const widths = [320, 768, 1024, 1920]

      widths.forEach(width => {
        cy.viewport(width, 800)
        cy.get('.virtualSelect').should('be.visible')

        // 验证下拉框宽度适应
        cy.get('.xz').click()
        cy.get('.treeSelect_v_popover').should('be.visible')
        cy.get('.xz').click()
      })
    })
  })

  describe('边界情况测试', () => {
    it('空数据应该显示正确提示', () => {
      cy.visit('/?emptyData=true')

      cy.get('.xz').click()
      cy.get('.list-popover').should('contain.text', '暂无数据')
    })

    it('单个节点应该正常工作', () => {
      cy.visit('/?singleNode=true')

      cy.get('.xz').click()
      cy.get('li').should('have.length', 1)
    })

    it('深层嵌套应该正常展开', () => {
      cy.get('.xz').click()

      // 展开第一层
      cy.get('.el-icon-caret-bottom').first().click()
      cy.wait(300)

      // 展开第二层（如果存在）
      cy.get('.el-icon-caret-bottom').eq(1).then($icon => {
        if ($icon.length > 0) {
          cy.wrap($icon).click()
          cy.wait(300)
        }
      })
    })

    it('快速连续点击应该正常工作', () => {
      cy.get('.xz').click()
      cy.get('.xz').click()
      cy.get('.xz').click()

      // 最终状态应该是打开的
      cy.get('.treeSelect_v_popover').should('be.visible')
    })
  })

  describe('性能测试', () => {
    it('大数据量下打开速度应该合理', () => {
      cy.visit('/?largeData=true')

      const startTime = Date.now()
      cy.get('.xz').click()
      cy.get('.treeSelect_v_popover').should('be.visible').then(() => {
        const endTime = Date.now()
        const duration = endTime - startTime

        // 打开时间应该在合理范围内（比如2秒内）
        expect(duration).to.be.lessThan(2000)
      })
    })

    it('搜索响应时间应该合理', () => {
      cy.get('.xz').click()

      const startTime = Date.now()
      cy.get('.search input').type('测试')
      cy.wait(500).then(() => {
        const endTime = Date.now()
        const duration = endTime - startTime

        // 搜索响应时间应该在合理范围内
        expect(duration).to.be.lessThan(1000)
      })
    })
  })

  describe('可访问性测试', () => {
    it('应该有正确的ARIA属性', () => {
      cy.get('.virtualSelect').should('have.attr', 'role', 'button')
      cy.get('.virtualSelect').should('have.attr', 'tabindex', '0')
    })
  })
})