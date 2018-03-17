//获取应用实例
const app = getApp()
Page({
    data: {
        homeworkid: '',
        iscomment: '',
        comment: '',
        commentimage: '',
        content: '',
        images: [],
        type: null,
        videofile: '',
        hasVideo: false,
        imagesLt1: true
    },
    onLoad: function (option) {
        this.setData({
            homeworkid: option.homeworkid,
            iscomment: option.iscomment
        })
        wx.showLoading({
            title: "获取中...",
            mask: true
        });
        this.getDetail();
    },
    getDetail: function () {
        let that = this;
        wx.request({
            url: 'https://work.iweigame.com/buyiban/homework/getone',
            data: {
                homeworkid: that.data.homeworkid,
                session: app.globalData.session
            },
            success: function (res) {
                //console.log(res.data);
                if (res.data.code != 200) {
                    that.getError()
                    return;
                }
                let data = res.data.data,
                    hasVideo,
                    imagesLt1;
                let images = data.images.split(',');
;
                !data.videofile ? hasVideo = false : hasVideo = true;
                images.length > 1 ? imagesLt1 = true : imagesLt1 = false;
                that.setData({
                    comment: data.comment,
                    commentimage: data.commentimage,
                    content: data.content,
                    type: data.type,
                    videofile: data.videofile,
                    images,
                    hasVideo,
                    imagesLt1
                })

            },
            fail: function () {
                that.getError()
            },
            complete: function () {
                wx.hideLoading()
            }
        })
    },
    getError: function () {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '获取作业失败',
            cancelText: '返回',
            confirmText: '重试',
            success: function (res) {
                if (res.confirm) {
                    that.getDetail()
                } else if (res.cancel) {
                    wx.navigateTo({
                        url: '../index/index'
                    })
                }
            }
        })
    },
    previewImage: function (e) {
        //获取当前图片的下标
        let index = e.currentTarget.dataset.index;
        //所有图片
        let imgs = this.data.images;

        wx.previewImage({
            //当前显示图片
            current: imgs[index],
            //所有图片
            urls: imgs
        })
    }
})
