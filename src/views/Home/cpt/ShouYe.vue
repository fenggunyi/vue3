<style lang="less">
.ShouYe-page {
  position: relative;
  height: 100%;
  display: grid;
  grid-template-rows: min-content 1fr;
}
</style>
<template>
  <div class="ShouYe-page">
    <JTopMenu v-model="params" v-bind="topMenuOpts" :query="onQuery"></JTopMenu>
    <JList :data-source="data">
      <template #item="item">
        <div>{{ item.name }}</div>
      </template>
    </JList>
  </div>
</template>
<script setup lang="tsx">
import { JList, JTopMenu, type JTopMenuProps } from 'comp'
import { ref } from 'vue'

const topMenuOpts: JTopMenuProps = {
  items: [
    {
      cpt: 'input',
      title: '名称',
      name: 'name'
    },
    {
      cpt: 'number',
      title: '名称1',
      name: 'num'
    },
    {
      cpt: 'datePicker',
      title: '时间',
      name: 'time',
      autoHide: true
    },
    {
      cpt: 'rangePicker',
      title: '时间段',
      name: 'start,end',
      autoHide: true
    },
    {
      cpt: 'upload',
      title: '文件',
      name: 'file',
      autoHide: true
    },
    {
      cpt: 'upload',
      title: '文件',
      name: 'file',
      autoHide: true
    },
    {
      cpt: 'upload',
      title: '文件',
      name: 'file',
      autoHide: true
    },
    {
      cpt: 'upload',
      title: '文件',
      name: 'file',
      autoHide: true
    },
    {
      cpt: 'upload',
      title: '文件',
      name: 'file',
      autoHide: true
    },
    {
      cpt: 'upload',
      title: '文件',
      name: 'file',
      autoHide: true
    },
    {
      cpt: 'cascader',
      title: '级联',
      name: 'jilian',
      autoHide: true,
      bind:{
        options: [
          {
            label: '类型1',
            value: '1',
            children: [
              {
                label: '类型1-1',
                value: '1-1'
              },
              {
                label: '类型1-2',
                value: '1-2'
              }
            ]
          },
          {
            label: '类型2',
            value: '2'
          }
        ]
      }
    },
    {
      cpt: 'checkbox',
      title: '类型',
      name: 'type',
      autoHide: true,
      bind:{
        options: [
          {
            label: '类型1',
            value: '1'
          },
          {
            label: '类型2',
            value: '2'
          }
        ]
      }
    }
  ]
}

let params = ref({})

let data = ref<ObjectItem[]>([
  {
    name: 'xxxxx'
  },
  {
    name: 'xxxxx'
  },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // },
  // {
  //   name: 'xxxxx'
  // }
])

const onQuery = (params: any) => {
  console.log(params)
}
</script>
