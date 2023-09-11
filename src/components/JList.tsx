import './JList.less'

import { defineComponent, onMounted, ref } from 'vue'
import { showFailToast, PullRefresh, List, Empty } from 'vant'
import { baseRequest, deepSort } from 'utils'

export type JListProps = {
  /** listItem样式 */
  itemStyle?: string
  /** 列表高度 */
  height?: string
  /** 表格数据 */
  dataSource?: ObjectItem[]
  /** 结果是否是数组 */
  isArray?: boolean
  /** 对于数组结果，如何处理 */
  formatArrayData?: (data: ObjectItem) => {
    list: ObjectItem[]
    total?: number
  }
  /** 表格查询配置 */
  query?: () => QueryItem
  /** 是否自动加载数据 */
  autoLoad?: boolean
  /** 数据格式化（对全部数据，不是单行） */
  format?: (data: ObjectItem) => {
    list: ObjectItem[]
    total?: number
  }
  /** 查询结束后调用，可以拿到当前表单的值和原始请求数据值 */
  afterQuery?: (list: any[], data: any) => void
  /** 对数据进行排序 */
  sort?: (a: any, b: any) => number
  /** 分页尺寸 */
  pageSize?: number
}

export default defineComponent({
  name: 'JList',
  props: {
    itemStyle: {
      type: String,
      default: 'j-list-item'
    },
    height: {
      type: String,
      default: '100%'
    },
    dataSource: {
      type: Array as unknown as () => ObjectItem[],
      default: () => []
    },
    isArray: Boolean,
    formatArrayData: {
      type: Function as unknown as () => (data: ObjectItem) => {
        list: ObjectItem[]
        total?: number
      },
      default: ({ code, data, msg }: ObjectItem) => {
        if (code == 200) {
          return {
            list: data || [],
            total: data.length
          }
        } else {
          showFailToast(msg)
          return {
            list: [],
            total: 0
          }
        }
      }
    },
    query: Function as unknown as () => () => QueryItem,
    autoLoad: {
      type: Boolean,
      default: true
    },
    format: {
      type: Function as unknown as () => (data: ObjectItem) => {
        list: ObjectItem[]
        total?: number
      },
      default: ({ code, data, msg }: ObjectItem) => {
        if (code === 200) {
          return data
        } else {
          showFailToast(msg)
          return {
            list: [],
            total: 0
          }
        }
      }
    },
    afterQuery: Function as unknown as () => (list: any[], data: any) => void,
    sort: {
      type: Function as unknown as () => (a: any, b: any) => number,
      default: (a: any, b: any) => a.sort - b.sort
    },
    pageSize: {
      type: Number,
      default: 10
    },
    finishedText: {
      type: String,
      default: '没有更多了'
    }
  },
  setup(props, { slots, expose }) {
    let dataSource = ref<ObjectItem[]>(props.dataSource)
    let loading = ref(false)
    let finished = ref(false)
    let refreshing = ref(false)
    let start = 0
    const loadData = async () => {
      if (!props.query) {
        loading.value = false
        finished.value = true
        return
      }
      const { url, ...params } = props.query()
      loading.value = true
      params.start = ++start
      params.length = props.pageSize
      let { data } = await baseRequest(url, params)
      let { list, total = 0 } = props.isArray ? props.formatArrayData(data) : props.format(data)
      if (!list || total === undefined) {
        console.error('format方法必须返回{list:any[], total:number}结构数据')
      } else {
        deepSort(list, props.sort)
        dataSource.value.push(...list)
      }
      props.afterQuery?.(list, data)
      loading.value = false
      refreshing.value = false
      if (dataSource.value.length >= total) {
        finished.value = true
      }
    }
    const onRefresh = () => {
      if (props.query) {
        finished.value = false
        loading.value = true
        start = 0
        dataSource.value = []
        loadData()
      } else {
        refreshing.value = false
      }
    }
    expose({
      onRefresh
    })
    onMounted(() => {
      if (props.autoLoad) {
        loadData()
      }
    })
    return () => {
      return (
        <div class="j-list" style={{ height: props.height }}>
          <PullRefresh
            modelValue={refreshing.value}
            onUpdate:modelValue={(val) => (refreshing.value = val)}
            onRefresh={onRefresh}
            style={{ height: dataSource.value.length ? '' : '100%' }}
          >
            {dataSource.value.length ? (
              <List
                finished-text={props.finishedText}
                loading={loading.value}
                onUpdate:loading={(val) => (loading.value = val)}
                finished={finished.value}
                onLoad={loadData}
              >
                {slots.default
                  ? slots.default?.(dataSource.value)
                  : dataSource.value.map((item: ObjectItem) => (
                      <div class={props.itemStyle}>{slots.item?.(item)}</div>
                    ))}
              </List>
            ) : (
              <div style="height: 100%;">
                <Empty class="j-empty" description="暂无数据"></Empty>
              </div>
            )}
          </PullRefresh>
        </div>
      )
    }
  }
})
