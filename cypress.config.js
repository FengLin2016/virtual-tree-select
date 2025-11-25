const { defineConfig } = require('cypress')
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    // 核心：添加 setupNodeEvents 函数
    setupNodeEvents(on, config) {
      // 在这里编写你所有的插件逻辑
      // `on` 是一个用于注册事件监听器的对象
      // `config` 是 Cypress 的配置对象

      // // 示例 1: 注册一个自定义任务
      // on("task", {
      //   log(message) {
      //     console.log(message);
      //     return null;
      //   },
      //   // 你可以在这里添加更多任务...
      // });
      // config = require('./cypress/plugins/index.js')
      // // 示例 2: 修改配置 (比如动态设置环境变量)
      // config.env.API_URL = process.env.API_URL || "https://api.example.com";

      // 必须返回修改后的 config 对象
      return config;
    },
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    trashAssetsBeforeRuns: true,
    videoCompression: 32,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    fixturesFolder: 'cypress/fixtures',
    // pluginsFile: 'cypress/plugins/index.js',
    env: {
      // 环境变量
      apiUrl: 'http://rap2api.taobao.org/app/mock/16107/api/tree',
      timeout: 10000
    },
    // 实验性功能
    experimentalStudio: true,
    experimentalWebKitSupport: true
  },
  // 组件测试配置（如果需要）
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'webpack'
    }
  }
})