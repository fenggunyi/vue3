import { request } from './request'
import api from '@/api'

export const AndOrEnum = [
  { label: 'AND', value: 'AND' },
  { label: 'OR', value: 'OR' }
]

export const OrderEnum = [
  { label: 'desc', value: 'DESC' },
  { label: 'asc', value: 'ASC' }
]

export const OperationEnum = [
  { label: 'BETWEEN', value: 'BETWEEN' },
  { label: '=', value: 'EQ' },
  { label: '!=', value: 'NE' },
  { label: '>', value: 'GT' },
  { label: '>=', value: 'GE' },
  { label: '<', value: 'LT' },
  { label: '<=', value: 'LE' },
  { label: 'like', value: 'LIKE' },
  { label: 'in', value: 'IN' },
  { label: 'not in', value: 'NOT_IN' },
  { label: 'is null', value: 'IS_NULL' },
  { label: 'is not null', value: 'IS_NOT_NULL' }
]

const splitStr = '&@&'
const splitWordStr = '&_&'

export const formatSubTableListToJson = (str: string) => {
  return str?.split(splitStr).map((e: string) => {
    let arr = e.split(splitWordStr)
    return {
      tableName: arr[0],
      foreignKey: arr[1],
      primaryKey: arr[2],
      sort: +arr[3]
    }
  })
}

export const formatSubTableListToString = (columns: any[]) => {
  return columns
    ?.map((e: any, sort: number) => {
      return [e.tableName || '', e.foreignKey || '', e.primaryKey || '', sort].join(splitWordStr)
    })
    .join(splitStr)
}

export const formatSelectColumnsToJson = (str: string) => {
  return (
    str?.split(splitStr).map((e: string) => {
      let arr = e.split(splitWordStr)
      return {
        name: arr[0],
        aliaName: arr[1],
        remark: arr[2],
        sort: +arr[3],
        viewType: arr[4],
        width: +arr[5] || 0,
        align: arr[6] || 'left',
        type: +arr[7] || 0,
        resultType: arr[8],
      }
    }) || []
  )
}

export const formatSelectColumnsToString = (columns: any[]) => {
  return columns
    ?.map((e: any, sort: number) => {
      return [
        e.name || '',
        e.aliaName || '',
        e.remark || '',
        sort,
        e.viewType || '',
        e.width || '',
        e.align || '',
        e.type || 0,
        e.resultType || ''
      ].join(splitWordStr)
    })
    .join(splitStr)
}

export const formatUpdateColumnsToJson = (str: string) => {
  return str?.split(splitStr).map((e: string) => {
    let arr = e.split(splitWordStr)
    return {
      name: arr[0],
      remark: arr[1],
      sort: +arr[2],
      viewType: arr[3],
      required: arr[4],
      config: arr[5] ? JSON.parse(arr[5]) : undefined,
      before: arr[6],
      endTime: arr[7],
      fixValue: arr[8]
    }
  })
}

export const formatUpdateColumnsToString = (columns: any[]) => {
  return columns
    ?.map((e: any, sort: number) => {
      return [
        e.name || '',
        e.remark || '',
        sort,
        e.viewType || '',
        e.required || '',
        e.config ? JSON.stringify(e.config) : '',
        e.before || '',
        e.endTime || '',
        e.fixValue || ''
      ].join(splitWordStr)
    })
    .join(splitStr)
}

export const formatRemoveParams = (name: string) => {
  return {
    name,
    operation: 'EQ'
  }
}

export const formatWhereListToJson = (str: string) => {
  return (
    str?.split(splitStr).map((e: string) => {
      let arr = e.split(splitWordStr)
      return {
        name: arr[0],
        operation: arr[1],
        aliaName: arr[2],
        remark: arr[3],
        sort: +arr[4],
        type: arr[5],
        config: arr[6] ? JSON.parse(arr[6]) : undefined,
        before: arr[7]
      }
    }) || []
  )
}

export const formatWhereListToString = (columns: any[]) => {
  return columns
    ?.map((e: any, sort: number) => {
      return [
        e.name || '',
        e.operation || '',
        e.aliaName || '',
        e.remark || '',
        sort,
        e.type || '',
        e.config ? JSON.stringify(e.config) : '',
        e.before || ''
      ].join(splitWordStr)
    })
    .join(splitStr)
}

export const formatOrderByListToJson = (str: string) => {
  return str?.split(splitStr).map((e: string) => {
    let arr = e.split(splitWordStr)
    return {
      name: arr[0],
      type: arr[1]
    }
  })
}

export const formatOrderByListToString = (columns: any[]) => {
  return columns
    ?.map((e: any) => {
      return [e.name || '', e.type || ''].join(splitWordStr)
    })
    .join(splitStr)
}

export type FormColumn = {
  aliaName: string
  remark: string
  sort: number
  type: string
  config: ObjectItem
  required?: string
  before?: string
}

type ApiConfig = {
  id: string
  remark: string
  name: string
  method: string
  primaryTable: string
  subTableList: string
  oneToMoreList: string
  orderByList: string
  selectColumns: string
  updateColumns: string
  whereList: string
  whereConnectType: string
}

let apiCache: ApiConfig[] = []

export const getApiConfig = async (id: string): Promise<ApiConfig> => {
  let item = apiCache.find((e) => e.name == id || e.id == id)
  if (!item) {
    let data = await request(api.getAutoApiById, {
      id
    })
    apiCache.push(data)
    return data
  }
  return item
}

export const setApiCongfig = (data: ApiConfig[]) => {
  apiCache = data
}
