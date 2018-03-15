const app = getApp()
Page({
    data: {
        userInfo: {},
        userinfoAccount: '',
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        _select: 1,
        imgList: [],
        videoSrc: ''
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
    getUserInfo: function (e) {//按钮获取用户信息
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    typeToggle: function (e) {
        this.setData({
            _select: e.target.dataset.select
        })
    },
    submitContent: function () {
        let file = null, that = this,
            img = that.data.imgList,
            video = that.data.videoSrc;
        if (video !== '' && img.length > 0) {
            img.push(video);
            file = img
        } else if (video === '' && img.length > 0) {
            file = img
        } else if (video !== '' && img.length === 0) {
            file = [video]
        } else {
            wx.showModal({
                title: '提示',
                content: '内容为空',
                showCancel: false
            })
            return;
        }
        console.log(file)
        file.map((currentValue, index, arr) => {
            console.log(currentValue)
            _upload(that, currentValue, 'fileUpload')
        })
    },
    chooseWxImage: function (type) {
        let that = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "#00bcfe",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.uploadWxImage('album')
                    } else if (res.tapIndex == 1) {
                        that.uploadWxImage('camera')
                    }
                }
            }
        })
    },
    uploadWxImage: function (type) {
        let that = this;
        let imgs = that.data.imgList;
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: [type],
            success: function (res) {
                let tempFilePaths = res.tempFilePaths;
                for (let i = 0; i < tempFilePaths.length; i++) {
                    if (imgs.length >= 9) break;
                    imgs.push(tempFilePaths[i]);
                }
                that.setData({
                    imgList: imgs
                });
            }
        })
    },
    previewImg: function (e) {
        //获取当前图片的下标
        let index = e.currentTarget.dataset.index;
        //所有图片
        let imgs = this.data.imgList;

        wx.previewImage({
            //当前显示图片
            current: imgs[index],
            //所有图片
            urls: imgs
        })
    },
    deleteImg: function (e) {
        let imgs = this.data.imgList;
        let index = e.currentTarget.dataset.index;
        imgs.splice(index, 1);
        this.setData({
            imgList: imgs
        });
    },
    deleteVideo: function () {
        this.setData({
            videoSrc: ''
        });
    },
    chooseWxVideo: function () {
        let that = this
        wx.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 60,
            camera: 'back',
            success: function (res) {
                that.setData({
                    videoSrc: res.tempFilePath
                });
            }
        })
    },
    bindDeleteVideo: function (e) {
        this.setData({
            videoSrc: ''
        })
    }
});

let _upload = (page, path, name) => {
    wx.showToast({
        icon: "loading",
        title: "正在上传"
    }),
        wx.uploadFile({
            url: 'https://work.iweigame.com/videomarket/video/uploadimage',
            filePath: path,
            name: name,
            header: { "Content-Type": "multipart/form-data" },
            formData: {
                //和服务器约定的token, 一般也可以放在header中
                'session_token': wx.getStorageSync('session_token')
            },
            success: function (res) {
                console.log(res);
                if (res.statusCode != 200) {
                    wx.showModal({
                        title: '提示',
                        content: '上传失败',
                        showCancel: false
                    })
                    return;
                }

                var data = res.data;
                wx.showToast({
                    icon: "success",
                    title: "上传成功"
                })
                //清空上传的数据
                page.setData({
                    videoSrc: '',
                    imgList: []
                })
            },
            fail: function (e) {
                console.log(e);
                wx.showModal({
                    title: '提示',
                    content: '上传失败',
                    showCancel: false
                })
            },
            complete: function () {
                wx.hideToast();  //隐藏Toast
            }
        })
}
