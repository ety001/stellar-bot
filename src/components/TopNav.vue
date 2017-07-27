<template>
  <el-row>
    <el-col :span="20" :offset="2">
      <el-menu theme="dark" :default-active="activeIndex" :router="true" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="/">首页</el-menu-item>
        <li class="el-menu-item"><a href="https://shimo.im/doc/pghTlewrLxsYiHD3?r=V7XL4/" target="_blank">教程</a></li>        
      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    data () {
      return {
        activeIndex: this.$route.name
      }
    },
    methods: {
      handleSelect (key, keyPath) {
        // console.log(key, keyPath)
        switch (key) {
          case '/':
            break
          case 'tutorial':
            break
        }
      }
    },
    mounted () {
    }
  }
</script>
