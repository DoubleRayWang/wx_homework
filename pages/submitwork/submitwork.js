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
        session: app.globalData.session,
        wtype: 1,
        content: '',
        images: '',
        videofile: '',
        addtime: '',
        tagid: ''
    },
    onLoad: function (option) {
        //记录交作业的日期
        this.setData({
            addtime: option.addtime,
            tagid: option.tagid
        })
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
            wtype: Number(e.target.dataset.select)
        })
    },
    submitContent: function (e) {
        let that = this,
            text = e.detail.value.content,
            img = that.data.imgList,
            imgLength = img.length;
        let video = that.data.videoSrc,
            i = 0;
        //文字和图片必须,视频可选
        if (text === '') {
            wx.showToast({
                title: '内容不可为空',
                image: '/image/submitwork/out_error.svg'
            })
            return;
        }
        if (imgLength === 0 && video === '') {
            wx.showToast({
                title: '请上传图片或视频',
                image: '/image/submitwork/out_error.svg'
            })
            return;
        }

        that.setData({
            textContent: text,
            content: text
        });

        //递归判断每一个图片都上传完成
        let uploadBack = (path, name) => {
            //console.log('开始上传文件：' + path);
            wx.uploadFile({
                url: baseUrl + 'videomarket/video/uploadimage',
                filePath: path,
                name: 'fileUpload',
                success: function (res) {
                    if (res.statusCode != 200) {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: '上传失败',
                            showCancel: false
                        })
                        return;
                    }
                    let data = res.data;
                    let _urlData = that.data.images;
                    if (name === 'img') {
                        let images = '';
                        if (_urlData !== '') {
                            images = `${_urlData},${data.data}`
                        } else {
                            images = data.data
                        }
                        that.setData({
                            images
                        })
                        i += 1;
                    } else if (name === 'video') {
                        that.setData({
                            videofile: data.data
                        })
                    }
                    _upload(i);
                },
                fail: function (e) {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: '上传失败',
                        showCancel: false
                    })
                }
            })
        };
        let _upload = (i) => {
            if (i <= imgLength - 1) {
                uploadBack(img[i], 'img');
            } else {
                // console.log({
                //     session: app.globalData.session,
                //     type: that.data.wtype,
                //     content: that.data.content,
                //     images: that.data.images,
                //     videofile: that.data.videofile
                // })
                //图片和视频上传完成后再提交一次request
                wx.request({
                    url: baseUrl + 'buyiban/homework/addhomework',
                    data: {
                        session: app.globalData.session,
                        type: that.data.wtype,
                        content: that.data.content,
                        images: that.data.images,
                        videofile: that.data.videofile,
                        addtime: that.data.addtime,
                        tagid: that.data.tagid
                    },
                    success: function (res) {
                        console.log(res.data);
                        if (res.data.code != 200) {
                            wx.showModal({
                                title: '提示',
                                content: '上传失败',
                                showCancel: false
                            })
                            return;
                        }
                        wx.showToast({
                            icon: "success",
                            title: "上传成功",
                            success: function () {
                                //所有数据处理完成后 
                                wx.reLaunch({
                                    url: `../detail/detail?homeworkid=${res.data.data}`
                                })
                            }
                        });
                    },
                    fail: function () {
                        wx.showModal({
                            title: '提示',
                            content: '上传失败',
                            showCancel: false
                        })
                    },
                    complete: function () {
                        wx.hideLoading();
                    }
                })
            }
        };
        wx.showLoading({
            title: "正在上传",
            mask: true
        });
        //有视频则先传视频（uploadBack中会继续调用图片上传）
        if (video !== '') {
            uploadBack(video, 'video')
        } else {
            _upload(i)
        }

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
