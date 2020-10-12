<template>
  <div class="my-resume iconfont" sg-scroll @click="onClick">
    <template v-if="resumeId">
      <!-- 个人基本信息 -->
      <section
        v-if="personalInfos"
        item-type="personalInfos"
        class="personal-info"
      >
        <img :src="personalInfos.avatarUrl" alt="个人头像" />
        <div class="infos">
          <div class="line-height">
            <span>
              <strong>{{ personalInfos.userName }}</strong>
            </span>
            <span class="icon-male">{{ personalInfos.gender }}</span>
          </div>
          <div class="line-height">
            <span>{{ personalInfos.age }}</span>
            <span>{{ personalInfos.nation }}</span>
            <span>{{ personalInfos.nativePlace }}</span>
          </div>
          <div class="line-height">
            <span class="icon-project">{{ personalInfos.workYear }}</span>
            <span class="icon-mobilephone">{{
              personalInfos.mobilePhone
            }}</span>
          </div>
        </div>

        <!-- 编辑模块信息 -->
        <div v-if="editItemType" class="sg-mask">
          <!-- <div>
            <sg-button type="text" @click="onSelectAvatar">上传头像</sg-button>
          </div>
          <div>
            <span>姓名:</span><input v-model="personalInfos.userName"/>
          </div>
          <div>
            <span>性别:</span><input v-model="personalInfos.gender"/>
          </div>
          <div>
            <span>性别:</span><input v-model="personalInfos.gender"/>
          </div> -->
          <sg-button @click="onSave">保存</sg-button>
        </div>
      </section>

      <!-- 职位与技能 -->
      <section v-if="skillJob" item-type="skillJob" class="skill-job">
        <h2>技以谋职</h2>
        <div class="sg-flex line-height">
          <div class="sg-flex-one">
            <span>职位：</span>{{ skillJob.jobName }}
          </div>
          <div class="sg-flex-one">
            <span>城市：</span>{{ skillJob.workPlace }}
          </div>
        </div>
        <div class="line-height">
          <span>掌握：</span>{{ skillJob.masterSkill }}
        </div>
        <div class="line-height">
          <span>了解：</span>{{ skillJob.knowSkill }}
        </div>
      </section>

      <!-- 教育经历 -->
      <section
        v-if="educations"
        item-type="educations"
        class="sg-flex educations"
      >
        <h2>教育经历</h2>
        <div
          v-for="(item, index) in educations"
          :key="index"
          class="sg-flex-one education"
        >
          <img v-if="item.logoUrl" :src="item.logoUrl" />
          <span>{{ item.collegeName }}</span>
          <span>{{ item.major }}</span>
          <span>{{ item.majorTime }}</span>
        </div>
      </section>

      <!-- 工作经历  -->
      <section v-if="experiences" item-type="experiences">
        <h2>工作经历</h2>
        <div
          v-for="(item, index) in experiences.items"
          :key="index"
          class="sg-flex content-padding line-height"
        >
          <div class="sg-flex-two">
            <strong>{{ item.companyName }}</strong>
          </div>
          <div class="sg-flex-one">{{ item.jobName }}</div>
          <div class="sg-flex-one">{{ item.workTime }}</div>
        </div>

        <p class="content" style="margin-top: 2rem">
          {{ experiences.content }}
        </p>
      </section>

      <!-- 项目经验  -->
      <section class="projects" item-type="projects">
        <h2><span class="icon-project"></span>项目经验</h2>
        <div
          v-for="item in latestProjects"
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
      <section v-if="descriptions" item-type="descriptions" class="self-desc">
        <h2>
          自我描述 <span>{{ descriptions.keywords }}</span>
        </h2>
        <p class="content">
          {{ descriptions.content }}
        </p>
      </section>

      <!-- 个人兴趣 -->
      <section class="hobby" item-type="hobby">
        <h2><span class="icon-hobby"></span>个人兴趣</h2>
        <div v-html="hobbyHTML"></div>
      </section>
    </template>

    <template v-else>
      <sg-button @click="createResume()" type="primary"
        >自动创建简历模板</sg-button
      >
      <sg-button class="upload">
        上传模板创建简历
        <input type="file" accept=".txt,.json" @change="handleFileChange" />
      </sg-button>
    </template>
  </div>
</template>

<script>
import { apiURL, apiGetData, apiPostData, apiPostUpload } from '@/api'
import { getItemTypeObj } from '@/utils/dom'

const tempDate = {
  personalInfos: {
    avatarUrl: '',
    userName: 'LiMing',
    gender: '男',
    age: '23岁',
    nativePlace: '广东广州',
    nation: '汉族',
    workYear: '2年工作经验',
    mobilePhone: ''
  },
  skillJob: {
    jobName: '高级工程师',
    workPlace: '广州、深圳',
    masterSkill: 'HTML5/CSS、JavaScript',
    knowSkill: 'Java'
  },
  educations: [
    {
      collegeName: '毕业的大学',
      major: '本科 / 计算机类',
      majorTime: '2016-09至2020-09'
    }
  ],
  experiences: {
    items: [
      {
        companyName: '小黄花志愿者协会',
        jobName: '志愿者',
        workTime: '2020.06 - 至今'
      }
    ],
    content: '志愿帮助、打扫大街、协助交通导流'
  },
  projects: [
    {
      name: '项目名字',
      time: '项目时间',
      contents: ['项目简介、概要', '主要负责内容']
    }
  ],
  descriptions: {
    keywords: '（关键词）',
    content: '一些自我描述'
  },
  hobby: [
    {
      content: '跑步'
    }
  ]
}

export default {
  name: 'MyResume',

  data () {
    return {
      tempKeys: Object.freeze([
        'personalInfos',
        'skillJob',
        'educations',
        'experiences',
        'projects',
        'descriptions',
        'hobby'
      ]),
      // tempResume: {},
      editItemType: '',

      resumeId: 0,
      personalInfos: null,
      skillJob: null,
      educations: null,
      experiences: null,
      projects: null,
      descriptions: null,
      hobby: null
    }
  },

  computed: {
    /**
     * 最新项目经验及总结
     */
    latestProjects () {
      if (!this.projects) {
        return []
      }
      const lastIndex = this.projects.length - 1
      return this.projects.filter((_, i) => {
        return i < 3 || i >= lastIndex
      })
    },
    hobbyHTML () {
      /** @type{Array} */
      const items = this.hobby || []
      return items
        .map((o) => {
          return o.href ? `<a href="${o.href}">${o.content}</a>` : o.content
        })
        .join('、')
    }
  },

  created () {
    window.myResume = this
    this.getResumeDetail()
  },

  methods: {
    /**
     * 界面点击事件
     */
    onClick (e) {
      const nowTime = Date.now()
      if (!this.clickTime || this.editItemType) {
        this.clickTime = nowTime
        return
      }
      if (nowTime - this.clickTime < 300 * 1000) {
        const { itemType } = getItemTypeObj(e.target) || {}
        this.editItemType = itemType || ''
      }
      this.clickTime = nowTime
    },
    onSave () {
      this.editItemType = ''
    },

    /**
     * 获取当前用户的简历
     */
    getResumeDetail () {
      this.tempResume = {}
      this.editItemType = ''
      apiGetData(apiURL.resumeDetail)
        .then((resp) => {
          const data = resp.data
          this.resumeId = data.id || 0
          this.tempKeys.forEach((key) => {
            if (data[key]) {
              try {
                this[key] = JSON.parse(data[key])
                this.tempResume[key] = data[key]
              } catch (error) {
                this[key] = null
              }
            }
          })
        })
        .catch(() => {
          this.resumeId = 0
          this.tempKeys.forEach((key) => {
            this[key] = null
          })
        })
    },

    /**
     * 监听文件本地上传
     */
    handleFileChange (e) {
      const file = e.target.files[0]
      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        try {
          const data = JSON.parse(text)
          this.createResume(data)
        } catch (error) {
          this.$toast('文件解析失败，请检查')
        }
      }
      reader.readAsText(file)
    },

    /**
     * 创建简历
     */
    createResume (userData) {
      const data = {}
      const object = userData || tempDate
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          data[key] = JSON.stringify(object[key])
        }
      }
      apiPostData(apiURL.resumeCreate, data).then((resp) => {
        this.getResumeDetail()
      })
    },

    /**
     * 更新简历
     */
    updateResume () {
      const data = {}
      const object = this.tempResume
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          if (object[key] !== JSON.stringify(this[key])) {
            data[key] = object[key]
          }
        }
      }

      if (!Object.keys(data).length) {
        return
      }
      apiPostData(apiURL.resumeUpdate, data).then((resp) => {
        this.getResumeDetail()
      })
    },

    /**
     * 删除简历
     */
    deleteResume () {
      this.$confirm({
        title: '提示',
        content: '删除后将无法找回，是否继续？',
        confirm: () => {
          this.$toast('删除中...', {
            direction: 'middle',
            duration: -1,
            loading: true
          })
          apiPostData(apiURL.resumeDelete)
            .then((resp) => {
              this.$toast('删除成功', {
                replace: true
              })
              this.getResumeDetail()
            })
            .catch(() => {
              this.$toast('', {
                duration: 0,
                replace: true
              })
            })
        }
      })
    }
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
  color: #111111;

  .line-height {
    line-height: 1.8;
  }

  section {
    margin-bottom: 3rem;
  }

  .content {
    text-indent: 2em;
    line-height: 1.5;
  }
  .content-padding {
    padding-left: 2em;
  }

  h2 {
    margin: 1rem 0;
    color: #333333;
  }
  h4 {
    margin: 0.5rem 0;
  }

  .upload {
    position: relative;
    margin-top: 3rem;
    input {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: inline-block;
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }
}

.iconfont span[class^="icon"]::before {
  color: #148acf;
  margin-right: 0.3rem;
}

.personal-info {
  text-align: center;
  line-height: 15rem;
  img {
    display: inline-block;
    vertical-align: middle;
    width: 8rem;
    height: 11rem;
    border: 1px solid gray;
    margin-right: 2rem;
  }
  .infos {
    display: inline-block;
    vertical-align: middle;
    span + span {
      margin-left: 2rem;
    }
  }
}

.skill-job {
  span {
    font-weight: bold;
  }
}

.educations {
  align-items: center;
  img {
    width: 4rem;
    height: 4.45rem;
  }
  span,
  img {
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

.self-desc {
  span {
    font-size: initial;
  }
}

.hobby {
  a {
    text-decoration: none;
  }
}
</style>
