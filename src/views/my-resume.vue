<template>
  <div class="my-resume">
    <!-- 个人基本信息 -->
    <section class="personal-info sg-flex">
      <img src="favicon.ico" alt="个人头像" />
      <div class="sg-flex-one infos">
        <div><strong>罗**</strong> 男（汉族）</div>
        <div>3年工作经验 | 本科 | 27岁</div>
        <div>156****5984 94****877@qq.com</div>
      </div>
    </section>

    <!-- 职位与技能 -->
    <section>
      <h2>技以谋职</h2>
      <div class="sg-flex">
        <div class="sg-flex-one">职位：web前端开发工程师</div>
        <div class="sg-flex-one">地点：广州、深圳</div>
      </div>
      <div>
        <div>掌握：HTML5/CSS、JavaScript、vue.js、git</div>
        <div>了解：beego、docker、jenkins、angular.js、webpack4</div>
      </div>
    </section>

    <!-- 教育经历 -->
    <section class="sg-flex educations">
      <h2>教育经历</h2>
      <div class="sg-flex-one education">
        <img :src="eduLogo" />
        <span>华南师范大学 </span>
        <span>（本科 / 网络工程2012-09至2016-09）</span>
      </div>
    </section>

    <!-- 工作经历  -->
    <section>
      <h2>工作经历</h2>
      <div class="sg-flex content-padding">
        <div class="sg-flex-two">
          <strong>珠海读书郎网络教育有限公司</strong>
        </div>
        <div class="sg-flex-one">软件工程师</div>
        <div class="sg-flex-one">2016.06-2019.03</div>
      </div>
      <div class="sg-flex content-padding">
        <div class="sg-flex-two">
          <strong>软通动力 (广州) 科技有限公司</strong>
        </div>
        <div class="sg-flex-one">前端工程师</div>
        <div class="sg-flex-one">2019.04-至今</div>
      </div>
      <p class="content" style="margin-top: 2rem">
        前期从事Android平板端教育应用开发工作，其后至今专注于web前端开发，运用过vue、angularjs等框架；熟练运用vue，开发多种类型项目，掌握了一定开发技巧；同时用beego框架开发web后端数据接口，形成了一套相对熟练的前后端开发流程。
      </p>
    </section>

    <!-- 项目经验  -->
    <section class="projects">
      <h2>项目经验</h2>
      <div
        v-for="item in projects"
        :key="item.id"
        class="project content-padding"
      >
        <div class="sg-flex">
          <h4 class="sg-flex-one">
            {{ item.name }}
          </h4>
          <div>
            <span>{{ item.time }}</span>
          </div>
        </div>

        <div>
          <p
            v-for="(item_, index_) in item.contents"
            :key="index_"
            class="content"
          >
            {{ item_ }}
          </p>
        </div>
      </div>
    </section>

    <!-- 自我描述 -->
    <section>
      <h2>自我描述 <span>（个人能力、责任心、团队精神）</span></h2>
      <p class="content">
        已工作三年，仍需加强个人的沟通和学习这两方面。能主动与他人沟通，这起码能代表着积极态度和责任心；在沟通中熟习、把握事情的发展状态，借鉴好的经验。始终贯穿5W1H，不断学习、思考，然后在环境中检验、解决，最后才能善其事。希望在工作生活中不断与人沟通、学习，进而磨砺自己，去完善人生价值。
      </p>
    </section>

    <!-- 个人兴趣 -->
    <section>
      <h2>个人兴趣</h2>
      乒乓球、创诗词、慢跑、电影、旅游
    </section>
  </div>
</template>

<script>
export default {
  name: 'MyResume',

  data () {
    return {
      eduLogo: require('img/logo-scnu.png'),

      projects: [
        {
          name: '中移和彩云(wap)',
          time: '2020-03~2020-10',
          contents: [
            '和彩云是中国移动的统一云产品入口，融合个人云与家庭云，面向用户提供安全、智能、便捷、不限速的云存储服务，满足用户手机相册、微信文件、通讯录等数字资产的备份同步、在线管理、共享等需求。',
            '负责保险箱、帮助与反馈、回收站和家庭云四个模块；音视频播放；'
          ]
        },
        {
          name: '天智大数据平台',
          time: '2019.10-2019.12',
          contents: [
            '以人工智能技术，对场景进行预测、分析等，提供关联信息，开展无人智能化等工作提供信息化支撑。',
            '项目中负责开发数据中心、管理中心模块，以antd-design-vue为组件库，开发业务中数据模型的算子组件，进行封装、重构项目可复用的业务组件；引入codemirror开发sql算子，配置业务所需的sql代码编辑配置；运用过富文本编辑ckeditor、拖拽组件等；优化组件库的table，设置自适应高度的表格样式；设计、编辑项目中的数据字典，控制关键的按钮操作权限；探究并配置组件多实例缓存等。'
          ]
        },
        {
          name: '数据工厂、数据超市2.0',
          time: '2019.05-2019.10',
          contents: [
            '前者为任务调度中心，对任务进行分组控制、调度。通过websocket通信拉取运行数据后利用echart图形库展示；后者为各种榜单列表展示，通过vuex对榜单之间进行同步操作状态。',
            '通过配置axios请求拦截处理各种异常、设置验证参数；控制路由权限跳转，分角色配置路由；以element-ui为组件库，动态打包视图模块；引入iconfont作为功能按钮图标'
          ]
        },
        {
          name: '初中仿真实验室',
          time: '2018.08-2019-03',
          contents: [
            '通过分析实验操作流程来设计实验结构，整体分为实验元素与实验步骤。由于不涉及负责复杂动画，则采用animejs制作基本动画；编写实验基本元素动作模板，继承vue实验组件，并异步加载不同实验组件。熟习h5的canvas2d编程，绘制血液效果。api数据接口则采用beego+mysql来搭建。'
          ]
        },
        {
          name: '互动探究题',
          role: '前端负责人、开发人员',
          time: '2018.05-2018.07',
          contents: [
            '采用vue.js+webpack4框架搭建项目结构，围绕拖动、填空、连线三大题型来设计相应的操作类。设置编辑模式以区分编辑与预览做题，编写典型题目元素基类、供各个题目继承，也提供公共组件调用。同时也开发、维护相应后端数据接口。'
          ]
        },
        {
          name: '（其他）',
          time: '2016.06-至今',
          contents: [
            '前期进行Android开发，开发过广告拦截、重构应用代码、迭代应用各种功能，也接触过系统主界面源码。在java使用过box2d物理引擎，在gwt框架下编译成web项目。',
            '后期则不断深入web前端开发，学习使用各种框架、库，有axios、iconfont、threejs，pixijs，phaser等。'
          ]
        }
      ]
    }
  },

  created () {
    window.myResume = this
  }
}
</script>

<style lang="scss" scoped>
.my-resume {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 1rem;
  font-size: 1.2rem;

  section {
    margin-bottom: 3rem;
  }

  .content {
    text-indent: 2em;
  }
  .content-padding {
    padding-left: 2em;
  }

  h2 {
    margin: 1rem 0;
  }
  h4 {
    margin: 0.5rem 0;
  }
}

.personal-info {
  align-items: center;
  img {
    width: 10rem;
    height: 15rem;
  }
  .infos {
    padding: 0 3rem;
  }
}

.educations {
  align-items: center;
  img {
    width: 4rem;
    height: 4.45rem;
  }
  span, img {
    display: inline-block;
    vertical-align: middle;
    margin-right: 1rem;
  }
  .education {
    padding: 0 2rem;
  }
}

.projects {
  .project {
    margin-bottom: 2rem;
    border-left: 2px solid steelblue;
  }
}
</style>
