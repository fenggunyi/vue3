import { enc } from 'crypto-js'

// 字符串传Base64
export const strToBase64 = (str: string) => {
  if (!str) return ''
  return enc.Base64.stringify(enc.Utf8.parse(str))
}

// Base64转字符串
export const base64ToStr = (base64: string | undefined) => {
  if (!base64) return ''
  try {
    return enc.Utf8.stringify(enc.Base64.parse(base64))
  } catch (e) {
    return null
  }
}

// 数组，对象归一化处理
export const dataToArray = <T>(obj: T[] | T): T[] => {
  if (Array.isArray(obj)) {
    return obj
  } else return [obj]
}

// 将一维数组转为树状结构
export const formatArrToTree = (
  data: ObjectItem[],
  indexId = 'id',
  parentId = 'parentId',
  childName = 'children'
) => {
  let treeData: ObjectItem[] = [],
    isUse = new Set(),
    index = new Set()
  // 找出所有有父级的元素
  data.forEach((ele) => {
    if (parentId in ele) {
      if (data.find((e: ObjectItem) => e[indexId] == ele[parentId])) {
        index.add(ele[parentId])
      }
    }
  })
  // 找出根
  data.forEach((e) => {
    if (!index.has(e[parentId])) {
      treeData.push({ ...e })
      isUse.add(e[indexId])
    }
  })
  // 对节点开始查询
  let handler = (parent: ObjectItem) => {
    let children = data.filter((e) => e[parentId] == parent[indexId] && !isUse.has(e[indexId]))
    if (children.length) {
      parent[childName] = children
      children.forEach(handler)
    }
  }
  treeData.forEach(handler)
  return treeData
}

// 将树状结构对象转为一维数组
export const flatTreeData = (
  data: ObjectItem[] | ObjectItem,
  childName = 'children'
): ObjectItem[] => {
  const treeData = dataToArray(data)
  return [
    ...treeData,
    ...treeData
      .map((e) => e[childName])
      .filter((e) => e)
      .map((e) => flatTreeData(e, childName))
  ].flat()
}

// 搜寻当前节点的树路径
export const findTreePath = (
  data: ObjectItem[] | ObjectItem,
  fn: (item: ObjectItem, index?: number, indexs?: number[], parentPath?: ObjectItem[]) => boolean,
  indexs: number[] = [],
  parentPath: ObjectItem[] = [],
  childName = 'children'
): ObjectItem[] => {
  const treeData = dataToArray(data)
  for (let i = 0; i < treeData.length; i++) {
    const ele = treeData[i]
    const childIndex = [...indexs, i]
    const childPath = [...parentPath, ele]
    if (fn(ele, i, childIndex, parentPath)) {
      return childPath
    } else if (Array.isArray(ele[childName])) {
      let path = findTreePath(ele[childName], fn, childIndex, childPath, childName)
      if (path.length) {
        return path
      }
    }
  }
  return []
}

// 将树状结构对象的数据进行格式化，会生成新的数组，原数组不变
export const deepMap = (
  data: ObjectItem[] | ObjectItem,
  fn: (item: ObjectItem, index: number, indexs: number[], parent?: ObjectItem) => ObjectItem,
  indexs: number[] = [],
  parent?: ObjectItem,
  childName = 'children'
) => {
  return dataToArray(data).map((ele, i) => {
    const childIndex = [...indexs, i]
    let e = fn(ele, i, childIndex, parent)
    if (Array.isArray(ele[childName])) {
      e.children = deepMap(ele[childName], fn, childIndex, ele, childName)
    }
    return e
  })
}

// 将树状结构对象的数据进行深度排序，会改变原数组
export const deepSort = (
  data: ObjectItem[] | ObjectItem,
  fn = (a: ObjectItem, b: ObjectItem) => a.sort - b.sort,
  childName = 'children'
) => {
  const treeData = dataToArray(data)
  return treeData.sort(fn).map((ele: ObjectItem) => {
    if (Array.isArray(ele[childName])) {
      ele[childName] = deepSort(ele[childName], fn, childName)
    }
    return ele
  })
}

// 深度过滤，会生成新的数组，原数组不变
export const deepFilter = (
  data: ObjectItem[] | ObjectItem,
  fn: (item: ObjectItem, index: number, parent?: ObjectItem) => boolean,
  parent?: ObjectItem,
  childName = 'children'
) => {
  return dataToArray(data)
    .filter((ele, i) => {
      return fn(ele, i, parent)
    })
    .map((ele: ObjectItem) => {
      let e = { ...ele }
      if (Array.isArray(e[childName])) {
        e[childName] = deepFilter(e[childName], fn, ele, childName)
      }
      return e
    })
}

// 深度遍历
export const deepForEach = (
  data: ObjectItem[] | ObjectItem,
  fn: (item: ObjectItem, index: number, indexs: number[], parent?: ObjectItem) => void,
  indexs: number[] = [],
  parent?: ObjectItem,
  childName = 'children'
) => {
  dataToArray(data).forEach((e, i) => {
    const childIndex = [...indexs, i]
    fn(e, i, childIndex, parent)
    if (Array.isArray(e[childName])) {
      deepForEach(e[childName], fn, childIndex, e, childName)
    }
  })
}

// 将树状结构对象的数据进行深度查询
export const deepFind = (
  data: ObjectItem[] | ObjectItem,
  fn: (item: ObjectItem) => boolean,
  childName = 'children'
) => {
  return flatTreeData(data, childName).find(fn)
}

// 将树状结构对象里所有符合的查询出来
export const deepFindAll = (
  data: ObjectItem[] | ObjectItem,
  fn: (item: ObjectItem) => boolean,
  childName = 'children'
) => {
  let result: ObjectItem[] = []
  flatTreeData(data, childName).forEach((e) => {
    if (fn(e)) {
      result.push(e)
    }
  })
  return result
}

// 获取树的第一个叶子
export const getFristLeaf = (
  data: ObjectItem[],
  childName = 'children'
): ObjectItem | undefined => {
  if (data?.length) {
    let frist = data?.[0]
    if (frist[childName]?.length) {
      return getFristLeaf(frist[childName], childName)
    } else {
      return frist
    }
  }
}

// 深度合并对象
export const deepMerge = (...objects: ObjectItem[]) => {
  return objects.reduce((target, source) => {
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          target.hasOwnProperty(key) &&
          typeof target[key] === 'object' &&
          typeof source[key] === 'object'
        ) {
          if (Array.isArray(target[key]) || typeof target[key] == 'function') {
            target[key] = source[key]
          } else {
            target[key] = deepMerge(target[key], source[key])
          }
        } else {
          target[key] = source[key]
        }
      }
    }
    return target
  }, {})
}
