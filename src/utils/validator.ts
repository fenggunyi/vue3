// 验证密码强度
export const validatorPassword = (value: any) => {
   if (
      value?.match(
         /^(?![A-Za-z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_!@#$%^&*()+.]+$)(?![a-z0-9]+$)(?![a-z\\W_!@#$%^&*()+.]+$)(?![0-9\\W_!@#$%^&*()+.]+$)[a-zA-Z0-9\\W_!@#$%^&*()+.]{8,20}$/,
      )
   ) {
      if (
         value?.match(
            /(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210|000|111|222|333|444|555|666|777|888|999)/,
         )
      ) {
         return '不可以出现连续的数字'
      }
   } else {
      return '密码必须由数字、小写字母、大写字母或特殊符号中的三种组成，且至少8位'
   }
}

// 验证身份证
export const validatorIDCard = (value: any) => {
   if (
      !(
         !value ||
         value.match(
            /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
         )
      )
   ) {
      return '身份证格式不正确，请检查'
   }
}

// 验证中国手机号
export const validatorChinaPhone = (value: any) => {
   if (!(!value || value?.match(/^1[3456789]\d{9}$/))) {
      return '手机号码格式不正确，请检查'
   }
}

// 验证中国车牌号（包含新能源汽车）
export const validatorChinaCar = (value: any) => {
   if (
      !(
         !value ||
         value?.match(
            /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-Za-z]{1}[A-Za-z0-9]{6}$/,
         ) ||
         value?.match(
            /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-Za-z]{1}[A-Za-z0-9]{4}[A-Za-z0-9挂学警港澳]{1}$/,
         )
      )
   ) {
      return '车牌号格式不正确，请检查'
   }
}
