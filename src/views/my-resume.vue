<template>
  <div class="my-resume iconfont" sg-scroll @click="onClick">
    <sg-header @back="$router.go(-1)" ref="sgHeader">
      个人简历<template v-if="shareCode">（来自分享）</template>
      <template slot="right">
        <sg-dropdown
          v-show="resumeId > 0"
          :options="dropdownOptions"
          @change="handleDropdown"
          :pointerVisible="false"
          :optionActive="false"
        >
          <span class="icon-checkmore"></span>
        </sg-dropdown>
      </template>
    </sg-header>

    <template v-if="resumeId > 0">
      <!-- 个人基本信息 -->
      <section
        v-if="personalInfos"
        item-type="personalInfos"
        class="personal-info"
      >
        <img
          item-type="resume-print"
          :src="personalInfos.avatarUrl | imgSrcFilter"
          alt="个人头像"
        />
        <div class="infos">
          <div class="line-height">
            <span>
              <strong>{{ personalInfos.userName }}</strong>
            </span>
            <span :class="genderClass">{{ personalInfos.gender }}</span>
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
        <div style="margin-top: 1rem">
          <span>掌握技能：</span>
          <p
            v-for="(item, index) in skillJob.masterSkill.split('\n')"
            :key="index"
            class="content"
          >
            {{ item }}
          </p>
          <!-- {{ skillJob.masterSkill }} -->
        </div>
        <div style="margin-top: 1rem">
          <span>一般技能：</span>
          <p
            v-for="(item, index) in skillJob.knowSkill.split('\n')"
            :key="index"
            class="content"
          >
            {{ item }}
          </p>
          <!-- {{ skillJob.knowSkill }} -->
        </div>
      </section>

      <!-- 教育经历 -->
      <section v-if="educations" item-type="educations" class="educations">
        <h2>教育经历</h2>
        <div
          v-for="(item, index) in educations"
          :key="index"
          class="education sg-flex"
        >
          <img v-if="item.logoUrl" :src="item.logoUrl | imgSrcFilter" />
          <div class="sg-flex-one">
            <span>{{ item.collegeName }}</span>
            <span class="major">
              <span>{{ item.major }}</span>
              <span>{{ item.majorTime }}</span>
            </span>
          </div>
        </div>
      </section>

      <!-- 工作经历  -->
      <section v-if="experiences" item-type="experiences" class="experiences">
        <h2>工作经历</h2>
        <div
          v-for="(item, index) in experiences.items"
          :key="index"
          class="sg-flex line-height experience"
        >
          <div class="left-border"></div>
          <div class="sg-flex-one">
            <strong>{{ item.companyName }}</strong>
          </div>
          <div class="sg-flex-one job-infos">
            <span>{{ item.jobName }}</span>
            <span>{{ item.workTime }}</span>
          </div>
        </div>

        <p v-if="experiences.content" class="content" style="margin-top: 1rem">
          {{ experiences.content }}
        </p>
      </section>

      <!-- 项目经验  -->
      <section class="projects" item-type="projects">
        <h2><span class="icon-project"></span>项目经验</h2>
        <div v-for="item in latestProjects" :key="item.id" class="project">
          <div class="left-dot"></div>
          <div class="left-border"></div>
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
              v-for="(item_, index_) in item.content.split('\n')"
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

      <!-- 编辑模块信息 -->
      <div v-if="editItemType" class="sg-mask">
        <div class="scroll-wrapper resume-edit" sg-scroll>
          <template v-if="editItemType === 'personalInfos'">
            <div
              v-for="item in personalInfoKeys"
              :key="item.key"
              class="input-item"
            >
              <span>{{ item.label }}:</span>
              <div v-if="item.type === 'image'">
                <img
                  :src="personalInfos[item.key] | imgSrcFilter"
                  alt="个人头像"
                />
                <sg-button type="text" @click="onSelectImage(-1)"
                  >上传{{ item.label }}</sg-button
                >
              </div>
              <input
                v-else
                v-model="personalInfos[item.key]"
                :placeholder="item.placeholder"
              />
            </div>
          </template>

          <template v-else-if="editItemType === 'skillJob'">
            <div
              v-for="item in skillJobKeys"
              :key="item.key"
              class="input-item"
            >
              <span>{{ item.label }}:</span>
              <textarea
                v-if="item.type === 'textarea'"
                v-model="skillJob[item.key]"
                sg-scroll
              ></textarea>
              <input
                v-else
                v-model="skillJob[item.key]"
                :placeholder="item.placeholder"
              />
            </div>
          </template>

          <template v-else-if="editItemType === 'educations'">
            <div
              v-for="(item, index) in educations"
              :key="index"
              class="input-items"
            >
              <div class="input-items-header">
                <sg-button type="text" @click="onDeleteLine(index)"
                  >删除</sg-button
                >
              </div>
              <div
                v-for="item_ in educationKeys"
                :key="item_.key"
                class="input-item"
              >
                <span>{{ item_.label }}:</span>
                <div v-if="item_.type === 'image'">
                  <img :src="item[item_.key] | imgSrcFilter" alt="图片" />
                  <sg-button type="text" @click="onSelectImage(index)"
                    >上传{{ item_.label }}</sg-button
                  >
                </div>
                <input
                  v-else
                  v-model="item[item_.key]"
                  :placeholder="item_.placeholder"
                />
              </div>
              <div style="margin-bottom: 2rem">
                <sg-button type="text" @click="onAddLine(-1)"
                  >添加一段</sg-button
                >
              </div>
            </div>
          </template>

          <template v-else-if="editItemType === 'experiences'">
            <div
              v-for="(item, index) in experiences.items"
              :key="index"
              class="input-items"
            >
              <div class="input-items-header">
                <sg-button type="text" @click="onDeleteLine(index)"
                  >删除</sg-button
                >
              </div>
              <div
                v-for="item_ in experienceKeys"
                :key="item_.key"
                class="input-item"
              >
                <span>{{ item_.label }}:</span>
                <input
                  v-model="item[item_.key]"
                  :placeholder="item_.placeholder"
                />
              </div>
            </div>
            <div style="margin-bottom: 2rem">
              <sg-button type="text" @click="onAddLine(-1)">添加一段</sg-button>
            </div>
            <div class="input-item">
              <span>总结:</span>
              <textarea
                v-model="experiences.content"
                placeholder="工作经历总结"
                sg-scroll
              ></textarea>
            </div>
          </template>

          <template v-else-if="editItemType === 'projects'">
            <div style="margin-bottom: 2rem">
              <sg-button type="text" @click="onAddLine(0)">添加一段</sg-button>
            </div>
            <div
              v-for="(item, index) in projects"
              :key="index"
              class="input-items"
            >
              <div class="input-items-header">
                <sg-button type="text" @click="onDeleteLine(index)"
                  >删除</sg-button
                >
              </div>
              <div
                v-for="item_ in projectKeys"
                :key="item_.key"
                class="input-item"
              >
                <span>{{ item_.label }}:</span>
                <textarea
                  v-if="item_.type === 'textarea'"
                  v-model="item[item_.key]"
                  :placeholder="item_.placeholder"
                  sg-scroll
                ></textarea>
                <input
                  v-else
                  v-model="item[item_.key]"
                  :placeholder="item_.placeholder"
                />
              </div>
            </div>
            <div>
              <sg-button type="text" @click="onAddLine(-1)">添加一段</sg-button>
            </div>
          </template>

          <template v-else-if="editItemType === 'descriptions'">
            <div
              v-for="item in descriptionKeys"
              :key="item.key"
              class="input-item"
            >
              <span>{{ item.label }}:</span>
              <textarea
                v-if="item.type === 'textarea'"
                v-model="descriptions[item.key]"
                :placeholder="item.placeholder"
                sg-scroll
              ></textarea>
              <input
                v-else
                v-model="descriptions[item.key]"
                :placeholder="item.placeholder"
              />
            </div>
          </template>

          <template v-else-if="editItemType === 'hobby'">
            <div
              v-for="(item, index) in hobby"
              :key="index"
              class="input-items"
            >
              <div class="input-items-header">
                <sg-button type="text" @click="onDeleteLine(index)"
                  >删除</sg-button
                >
              </div>
              <div
                v-for="item_ in hobbyKeys"
                :key="item_.key"
                class="input-item"
              >
                <span>{{ item_.label }}:</span>
                <input
                  v-model="item[item_.key]"
                  :placeholder="item_.placeholder"
                />
              </div>
            </div>
            <div>
              <sg-button type="text" @click="onAddLine(-1)">添加一段</sg-button>
            </div>
          </template>

          <sg-button type="primary" style="margin-top: 2rem" @click="onSave"
            >保存</sg-button
          >
          <sg-button style="margin-top: 1rem" @click="onCancel">取消</sg-button>
        </div>
      </div>

      <!-- 图片选择、编辑上传 -->
      <div v-if="editItemType && imageEditorVisible" class="sg-mask">
        <image-editor ref="imageEditor" :autoOpen="true"></image-editor>
        <sg-button
          type="text"
          style="position: absolute; top: 0; left: 0; padding: 0.5rem 1rem"
          @click="imageEditorVisible = false"
          >取消</sg-button
        >
        <sg-button
          type="text"
          style="position: absolute; top: 0; right: 0; padding: 0.5rem 1rem"
          @click="onUploadImage"
          >上传</sg-button
        >
      </div>
    </template>

    <template v-else-if="resumeId === 0 && !shareCode">
      <sg-button style="margin-top: 5rem" @click="createResume()" type="primary"
        >自动创建简历模板</sg-button
      >
      <sg-button class="upload" v-show="false">
        上传模板创建简历
        <input type="file" accept=".txt,.json" @change="handleFileChange" />
      </sg-button>
    </template>
  </div>
</template>

<script>
import { apiURL, apiGetData, apiPostData, apiPostUpload } from '@/api'
import { getItemTypeObj } from '@/utils/dom'
import { base64ToFile } from '@/common/image'

const timeLimitFunc = function (seconds = 0) {
  const h = Math.floor(seconds / 3600)
  const hours = h % 24
  const days = (h - hours) / 24
  return `${days}天${hours}小时`
}

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
      content: '项目简介、概要\n主要负责内容'
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

/**
 * TODO:
 * 1、在线编辑
 * 2、时效共享
 */
export default {
  name: 'MyResume',

  components: {
    ImageEditor: () => import('@/components/image-editor')
  },

  data () {
    return {
      dropdownOptions: Object.freeze([
        { label: '打印预览', value: 'preview' },
        { label: '分享简历', value: 'share' }
      ]),
      tempKeys: Object.freeze([
        'personalInfos',
        'skillJob',
        'educations',
        'experiences',
        'projects',
        'descriptions',
        'hobby'
      ]),
      personalInfoKeys: Object.freeze([
        { key: 'avatarUrl', label: '头像', type: 'image' },
        { key: 'userName', label: '姓名' },
        { key: 'gender', label: '性别', placeholder: '男、女' },
        { key: 'age', label: '年龄' },
        { key: 'nation', label: '民族' },
        { key: 'nativePlace', label: '籍贯' },
        { key: 'workYear', label: '工龄' },
        { key: 'mobilePhone', label: '手机' }
      ]),
      skillJobKeys: Object.freeze([
        { key: 'jobName', label: '职能岗位' },
        { key: 'workPlace', label: '工作地点' },
        { key: 'masterSkill', label: '掌握技能', type: 'textarea' },
        { key: 'knowSkill', label: '了解技能', type: 'textarea' }
      ]),
      educationKeys: Object.freeze([
        { key: 'logoUrl', label: '图标', type: 'image' },
        { key: 'collegeName', label: '校名' },
        { key: 'major', label: '专业' },
        { key: 'majorTime', label: '时间' }
      ]),
      experienceKeys: Object.freeze([
        { key: 'companyName', label: '公司' },
        { key: 'jobName', label: '职位' },
        { key: 'workTime', label: '时间' }
      ]),
      projectKeys: Object.freeze([
        { key: 'name', label: '项目名字' },
        { key: 'time', label: '项目时长' },
        { key: 'content', label: '项目内容', type: 'textarea' }
      ]),
      descriptionKeys: Object.freeze([
        { key: 'keywords', label: '关键词' },
        { key: 'content', label: '自描述', type: 'textarea' }
      ]),
      hobbyKeys: Object.freeze([
        { key: 'content', label: '标签' },
        { key: 'siteUrl', label: '链接' }
      ]),
      // tempResume: {},
      editItemType: '',
      imageEditorVisible: false,

      resumeId: -1,
      shareCode: '',
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
    /**
     * 兴趣html
     */
    hobbyHTML () {
      /** @type{Array} */
      const items = this.hobby || []
      return items
        .map((o) => {
          return o.siteUrl
            ? `<a href="${o.siteUrl}">${o.content}</a>`
            : o.content
        })
        .join('、')
    },
    /**
     * 性别icon类
     */
    genderClass () {
      const { gender } = this.personalInfos || {}
      if (gender === '男') {
        return ['icon-male ']
      } else if (gender === '女') {
        return ['icon-female']
      } else {
        return []
      }
    }
  },

  created () {
    window.myResume = this
    this.getResumeDetail()
  },

  methods: {
    /**
     * 回调下拉选择
     */
    handleDropdown (key) {
      switch (key) {
        case 'preview':
          this.onPrint()
          break
        case 'share':
          if (this.shareCode) {
            this.$toast('此简历链接已分享')
            return
          }
          apiPostData(apiURL.shareCreate, {
            shareId: this.resumeId,
            shareModule: 'resume',
            shareDuration: 24 * 60 * 60
          }).then((resp) => {
            const shareCode = window.btoa(resp.data.code)
            const { origin, pathname } = window.location
            const href =
              origin + pathname +
              this.$router.resolve({
                name: 'myResume',
                query: { shareCode }
              }).href
            this.$confirm({
              className: 'share-confirm',
              title: '分享链接',
              content: `请复制：${href}`
            })
          })
          break
        default:
          break
      }
    },
    /**
     * 临时页面打印方法
     */
    onPrint () {
      const el = this.$el
      const elStyle = el.style
      elStyle.height = 'initial'
      elStyle.padding = '0'
      const parentEl = el.parentElement
      parentEl.style.display = 'none'
      const headerStyle = this.$refs.sgHeader.$el.style
      headerStyle.display = 'none'
      el.remove()
      document.body.append(el)
      window.print()
      parentEl.style.display = ''
      headerStyle.display = ''
      elStyle.height = ''
      elStyle.padding = ''
      parentEl.append(el)
    },
    /**
     * 界面点击事件
     */
    onClick (e) {
      if (this.shareCode) {
        return
      }
      const nowTime = Date.now()
      if (this.editItemType) {
        return
      }
      if (!this.clickTime) {
        this.clickTime = nowTime
        return
      }
      if (nowTime - this.clickTime < 300) {
        const { itemType } = getItemTypeObj(e.target) || {}
        if (itemType === 'resume-print') {
          this.onPrint()
        } else {
          this.editItemType = itemType || ''
        }
      }
      this.clickTime = nowTime
    },
    /**
     * 上传图片
     */
    onUploadImage () {
      if (this.isImageUploading) {
        return
      }
      this.isImageUploading = true
      this.$refs.imageEditor.getImage((base64) => {
        const formData = new FormData()
        formData.append(
          'file',
          base64ToFile(base64, `resume-${this.resumeId}-avatar.png`)
        )
        const pathType =
          this.editItemType === 'personalInfos' ? 'icon' : 'normal'
        apiPostUpload(apiURL.upload, formData, { pathType })
          .then((resp) => {
            const url = resp.data[0]
            if (this.editItemType === 'personalInfos') {
              this.personalInfos.avatarUrl = url
            } else if (this.editItemType === 'educations') {
              this.educations[0].logoUrl = url
            }
          })
          .finally(() => {
            this.imageEditorVisible = false
            this.isImageUploading = false
          })
      })
    },
    /**
     * 添加数据行
     */
    onAddLine (index) {
      switch (this.editItemType) {
        case 'educations':
          this.educations.unshift({
            collegeName: '',
            major: '',
            majorTime: ''
          })
          break
        case 'experiences':
          this.experiences.items.push({
            companyName: '',
            jobName: '',
            workTime: ''
          })
          break
        case 'projects':
          if (index < 0) {
            this.projects.push({
              name: '',
              time: '',
              content: ''
            })
          } else {
            this.projects.unshift({
              name: '',
              time: '',
              content: ''
            })
          }
          break
        case 'hobby':
          this.hobby.push({
            content: '',
            siteUrl: ''
          })
          break
      }
    },
    /**
     * 删除数据行
     */
    onDeleteLine (index) {
      switch (this.editItemType) {
        case 'educations':
          this.educations.splice(index, 1)
          break
        case 'experiences':
          this.experiences.items.splice(index, 1)
          break
        case 'projects':
          this.projects.splice(index, 1)
          break
        case 'hobby':
          this.hobby.splice(index, 1)
          break
      }
    },
    onSave () {
      this.editItemType = ''
      this.updateResume()
    },
    onCancel () {
      this.setResumeData(this.tempResume)
      this.editItemType = ''
    },

    onSelectImage (index) {
      this.imageEditorVisible = true
    },

    setResumeData (data = {}) {
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
    },

    /**
     * 获取当前用户的简历
     */
    getResumeDetail () {
      this.tempResume = {}
      this.editItemType = ''

      const shareCode = this.$route.query.shareCode || ''
      const url = shareCode ? apiURL.shareDetail : apiURL.resumeDetail
      this.shareCode = shareCode
      apiGetData(url, shareCode ? { shareCode: atob(shareCode) } : undefined)
        .then((resp) => {
          const data = resp.data
          if (shareCode) {
            data.personalInfos = data.personal_infos
            data.skillJob = data.skill_job
            data.userId = data.user_id
            data.updateTime = data.update_time
            data.createTime = data.create_time

            this.$toast(`此链接将在${timeLimitFunc(resp.limitTime)}后失效`)
          }
          this.resumeId = data.id || 0
          this.setResumeData(data)
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
        this.$toast('双击模块内容进行编辑')
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
          const tempStr = JSON.stringify(this[key])
          if (object[key] !== tempStr) {
            data[key] = tempStr
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

  .sg-header {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    width: 100%;
    background-color: white;
    z-index: 10;
  }
  .sg-dropdown {
    display: inline-block;
  }

  .line-height {
    line-height: 1.8;
  }

  section {
    margin-bottom: 3.5rem;
  }

  .content {
    text-indent: 2em;
    line-height: 1.5;
  }

  h2 {
    margin: 1rem 0;
    color: #333333;
  }
  h4 {
    margin: 0;
  }

  .scroll-wrapper {
    height: 100%;
    padding: 1rem;
    box-sizing: border-box;
    overflow-y: auto;
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

  .left-border {
    position: absolute;
    left: 2.5px;
    top: 0.2rem;
    bottom: 0.2rem;
    width: 2px;
    background-color: steelblue;
  }
  .left-dot {
    position: absolute;
    left: 0;
    top: 0.2rem;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: steelblue;
  }
}

.iconfont span[class^="icon"]::before {
  color: steelblue;
  margin-right: 0.3rem;
}

.personal-info {
  text-align: center;
  line-height: 15rem;
  img {
    display: inline-block;
    vertical-align: middle;
    width: 8rem;
    // border: 1px solid gray;
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
    margin-bottom: 1.6rem;
    align-items: center;
  }
}

.experiences {
  .experience {
    position: relative;
    .left-border {
      display: none;
    }
  }
  .job-infos {
    text-align: right;
    span:last-child {
      margin-left: 2rem;
    }
  }
}

.projects {
  .project {
    position: relative;
    padding-left: 1rem;
    margin-bottom: 2.55rem;
    .sg-flex {
      margin: 0rem 0 0.5rem 0;
      align-items: center;
    }
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

.resume-edit {
  .input-items {
    padding-left: 1rem;
    margin-bottom: 3rem;
    box-sizing: border-box;
  }
  .input-items-header {
    text-align: right;
    margin-bottom: 0.5rem;
    background-color: rgba(70, 131, 180, 0.2);
    .sg-button {
      padding: 0.2rem 0.5rem;
    }
  }
  .input-item {
    display: flex;
    flex-direction: row;
    margin-bottom: 1rem;
    align-items: center;
    span {
      display: inline-block;
      padding-right: 1rem;
      color: white;
    }
    img {
      max-width: 3rem;
      vertical-align: middle;
    }
    > div,
    input,
    textarea {
      display: inline-block;
      flex: 1;
      width: 100%;
      padding: 0.5rem;
      box-sizing: border-box;
      font-size: 1.2rem;
      line-height: 1.5;
    }
    textarea {
      height: 12rem;
      resize: none;
    }
  }
}

@media screen and (max-width: 500px) {
  .personal-info {
    margin-top: 3.5rem;
    img {
      display: block;
      margin: 0 auto;
    }
    .infos {
      display: block;
      margin-top: 2rem;
    }
  }
  .skill-job {
    .sg-flex {
      flex-direction: column;
    }
  }
  .educations {
    .major {
      display: block;
      margin-top: 0.5rem;
      margin-right: 0;
      span:last-child {
        margin-right: 0;
      }
    }
  }
}

@media screen and (max-width: 700px) {
  .experiences {
    .experience {
      padding-left: 1rem;
      margin-bottom: 1rem;
      .left-border {
        display: initial;
      }
    }
    .sg-flex {
      flex-direction: column;
    }
    .job-infos {
      text-align: left;
    }
  }
}
</style>

<style lang="scss">
.share-confirm {
  .sg-confirm .content {
    word-break: break-all;
    text-align: left;
  }
}
</style>
