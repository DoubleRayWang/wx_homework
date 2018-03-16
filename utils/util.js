const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}

wx.uploadFile({
    url: uploadFileUrl,
    filePath: imageSrc,
    name: 'data',
    success: function (res) {
        console.log('uploadImage success, res is:', res)

        wx.showToast({
            title: '上传成功',
            icon: 'success',
            duration: 1000
        })

        self.setData({
            imageSrc
        })
    },
    fail: function ({ errMsg }) {
        console.log('uploadImage fail, errMsg is', errMsg)
    }
})
