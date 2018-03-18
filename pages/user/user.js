const app = getApp();
Page({
    data: {
        userInfo: {},
        userinfoAccount: '',
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        //测试数据
        itemList: [{
            name: '我的作业',
            icon: '/image/personal/mywork.svg',
            herf: 'index'
        }, {
            name: '已购课程',
            icon: '/image/personal/buywork.svg',
            herf: 'submitwork'
        }, {
            name: '我的账户',
            icon: '/image/personal/account.svg',
            herf: ''
        }],
        poweredBy:'****提供技术支持'
    },
    onLoad: function () {
        //如果已经获取账号则直接赋值
        if (app.globalData.userinfoAccount) {
            this.setData({
                userinfoAccount: app.globalData.userinfoAccount
            })
        } else {

            //重新获取账号或其他处理

        }
        //如果已经获取了用户信息，则直接赋值
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
    },
    onShareAppMessage:function(){
        return {
            title: '测试小程序',
            path: '/pages/index/index',
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    //跳转
    navigateTo_: function (e) {
        let url = e.currentTarget.dataset.herf;
        if (!url || url === '') return;
        wx.navigateTo({
            url: `../${url}/${url}`
        })
    },
    //意见反馈
    feedback: function(){
        
    }
})