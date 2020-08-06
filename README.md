### 项目简介

**Sghen 三行**&nbsp;&nbsp;起于个人不定期写词句的兴趣爱好。作为一个 Web 菜鸟攻城狮，应该有个自己的项目，把想敲得代码敲上去，把想写得诗词管理起来。

**Demo：**

PC端：https://www.sghen.cn

Wap端：https://www.sghen.cn/sghen-wap/index.html

### Vue 项目结构

```
项目（不定期更新）
|--public					css、js、附件等静态文件目录
|--robot 					机器人测试：自动登陆账号创建、评论诗词，九歌爬诗词
|--src
	|--api   				接口定义
	|--assets				资源文件
	|--common				普通js代码，如
	|--components				各种vue组件
	|--directives				指令
	|--filters   				过滤器
	|--router    				路由定义
	|--store 				数据中心
	|--style 				项目样式
	|--ui					项目自定义UI库
	|--utils 				工具类
	|--views 				视图组件
	|  App.vue
	|  main.js
|  .browserslistrc
|  .editorconfig
|  .eslintrc.js  				eslint代码规则配置
|  .gitignore
|  babel.config.js
|  jsconfig.json
|  package-lock.json
|  package.json
|  README.md
|  vue.config.js 				vue配置文件
```

### Todo

- [ ] 密码动态加密

### 更新记录
```
2020-08
	[+]诗词评论表情，输入#触发
2020-06
	[+]诗词图集列表
	[*]优化sg-toast组件
	[*]优化sg-dropdown组件
2020-05
	[+]诗词点赞与评论分页优化
	[+]个人诗词概况
	[*]诗词列表界面缓存
	[+]sg-table组件
	[+]九歌诗词测试
	[+]普通账号登陆测试
	[+]选集组件
	[+]添加个人头像编辑，信息更改
	[+]个人中心
	[+]添加诗词的图集展示
	[+]旋转相册盒
	[+]诗词图片上传
	[+]诗词新增与编辑、选集创建
	[+]创建诗词
	[+]诗词详情页，优化诗词列表
	[+]统一跳转登录信息获取

2020-04
	[+]添加诗词右侧滑动菜单
	[+]主页我的诗词入口
	[+]sg-header组件
	[+]首页书三行轮询展示
	[+]添加网页底部说明
	[+]账号注册
	[+]添加图形校验获取验证码
	[!]适配重构的 user 接口
	[+]修复作者列表获取
	[+]添加作者的诗词列表跳转
	[+]点击作者直接评论
	[+]添加诗词点赞组件
	[+]诗词评论及点赞
	[+]添加诗词评论组件
	[+]全局图片过滤器
	[!]配置本地开发 host
	[+]诗词的图片预览
	[+]诗词列表
	[!]更改请求本地代理
	[+]sg-time 组件
	[+]sg-dropdown 组件
	[+]添加登陆逻辑
	[+]添加请求库
	[+]添加全局 toast
	[+]sg-form 添加单个字段验证
	[+]sg-swipper 组件

2020-03
	[+]sg-scroll 组件
	[+]sg-form 字段
	[+]sg-form 添加字段
	[+]登录退出逻辑
	[+]auth 状态存储
	[+]登录、主页路由
	[+]sg-button 组件
	[+]confirm 组件
	[!]初始化项目
```

### 启停项目

> 自己百度 Vue 项目启动
