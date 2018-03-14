//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    imageUrl: '/image/index/book.jpg',
    answer:'第一题答案：A，第二题答案：B，第三题答案：C，第四题答案：D，第一题答案：A，第二题答案：B，第三题答案：C，第四题答案：D，第一题答案：A，第二题答案：B，第三题答案：C，第四题答案：D。',
    comments: [{
      img: '/image/index/good-look.png',
      text: '不错，不错，继续努力！',
      time: '2018-03-13 17:55:00'
    }, 
    {
      img: '/image/index/good-look.png',
      text: '不错，不错，继续努力！',
      time: '2018-03-13 17:55:00'
    },
    {
        img: '/image/index/good-look.png',
        text: '不错，不错，继续努力！',
        time: '2018-03-13 17:55:00'
    }]
  },
  onLoad: function () {
    
  }
})
