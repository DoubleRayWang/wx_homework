const app = getApp(),
    baseUrl = 'https://work.iweigame.com/';
Page({
    data: {
        userInfo: {},
        userinfoAccount: '',
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        imgList: [],
        videoSrc: '',
        textContent: '',
        homework: {
            session: 'cb87c91e8c194d509fa45eec72dec38d',
            "type": 1,
            content: '',
            images: '',
            videofile: ''
        }
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
            homework: {
                type: Number(e.target.dataset.select)
            }
        })
    },
    submitContent: function (e) {

        let that = this,
            text = e.detail.value.content,
            img = that.data.imgList,
            video = that.data.videoSrc;

        //文字和图片必须,视频可选
        if (text === '') {
            wx.showToast({
                title: '内容不可为空',
                image: '/image/submitwork/out_error.svg'
            })
            return;
        }
        if (img.length === 0) {
            wx.showToast({
                title: '未上传图片',
                image: '/image/submitwork/out_error.svg'
            })
            return;
        }

        that.setData({
            textContent: text,
            homework: {
                content: text
            }
        });
        let task = [];
        if (video !== '') {
            _upload(that, video, 'video');
        }

        img.map((currentValue, index, arr) => {
            task[index] = _upload(that, currentValue, 'img');
            task[index].onProgressUpdate((res) => {
                console.log('上传进度', res.progress)
                console.log('已经上传的数据长度', res.totalBytesSent)
                console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
            })
        });
        //清空上传的数据
        // that.setData({
        //     videoSrc: '',
        //     imgList: [],
        //     textContent: ''
        // })
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
    });
    let uploadTask = wx.uploadFile({
        url: baseUrl + 'videomarket/video/uploadimage',
        filePath: path,
        name: 'fileUpload',
        success: function (res) {
            if (res.statusCode != 200) {
                wx.showModal({
                    title: '提示',
                    content: '上传失败',
                    showCancel: false
                })
                return;
            }
            //let data = JSON.parse(res.data);
            //let _urlData = page.data.homework.images;

            wx.showToast({
                icon: "success",
                title: "上传成功"
            });
            // if (name === 'img') {
            //     let images = '';
            //     if (_urlData !== '') {
            //         images = `${_urlData},${data.data}`
            //     } else {
            //         images = data.data
            //     }
            //     page.setData({
            //         homework: {
            //             images
            //         }
            //     })
            // } else if (name === 'video') {
            //     page.setData({
            //         homework: {
            //             videofile: data.data
            //         }
            //     })
            // }
        },
        fail: function (e) {
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
    return uploadTask;
}
