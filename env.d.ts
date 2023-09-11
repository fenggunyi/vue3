/// <reference types="vite/client" />

declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const componentOptions: ComponentOptions
  export default componentOptions
}

declare module 'weixin-js-sdk' {
  const config: (config: any) => void
  const ready: (callback: () => void) => void
  const error: (config: any) => void
}

interface Window {
  WeixinJSBridge: any
}

interface ObjectItem {
  [prop: string]: any
}

interface RequestResult {
  data: any
  code: number
  msg: string
}

interface RequestHeader {
  body?: ObjectItem
  query?: ObjectItem
  headers?: ObjectItem
  blob?: boolean
  log?: boolean
}

interface LabelValue {
  label: string
  value: any
  children?: LabelValue[]
  [props: string]: any
}

interface DictObj {
  [name: string]: LabelValue[]
}

interface CodeBlock {
  name: string
  prefix: string
  scope: string
  body: string
}

interface MyArray<T> {
  [index: number]: T
  length: number
}

interface QueryItem {
  url: string
  [prop: string]: any
}

interface RootItem {
  code: string
  remark: string
}

interface MenuItem {
  id?: string
  parentId?: string
  name: string
  /** 显示类型 0正常 1新窗口 2菜单组 */
  type?: number
  icon: string
  path?: string
  roots?: RootItem[]
  children?: MenuItem[]
  [prop: string]: any
}

interface Comps {
  name: string
  remark: string
  cpt: Component
}
