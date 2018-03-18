const app = getApp();
let choose_year = null,
    choose_month = null;
Page({
    data: {
        day: '',
        year: '',
        month: '',
        date: '2017-01',
        today: '',
        week: ['日', '一', '二', '三', '四', '五', '六'],
        calendar: {
            first: [],
            second: [],
            third: [],
            fourth: []
        },
        classinfo: [],
        isGetVlassinfo: false,
        swiperMap: ['first', 'second', 'third', 'fourth'],
        swiperIndex: 1,
        showCaldenlar: false,
        homeworkid: '',
        iscomment: '',
        tagid: '',
        isPublic: false,
        userInfo: {},
        userinfoAccount: '',
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
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
    onShow: function () {
        const date = new Date()
            , month = this.formatMonth(date.getMonth() + 1)
            , year = date.getFullYear()
            , day = this.formatDay(date.getDate())
            , today = `${year}-${month}-${day}`
        let calendar = null,
            that = this,
            time = this.countMonth(year, month);

        //console.log(time)
        let starttime = `${time.lastMonth.year}-${time.lastMonth.month}-01`,
            endtime = `${time.nextMonth.year}-${time.nextMonth.month}-${time.nextMonth.num}`
        this.getWork(starttime, endtime, function () {
            calendar = that.generateThreeMonths(year, month)
            that.setData({
                calendar,
                month,
                year,
                day,
                today,
                beSelectDate: today,
                date: `${year}-${month}`
            });

        })
    },
    //获取课程
    getWork: function (start, end, callback) {
        //如果正在获取
        // if (!this.data.isGetVlassinfo) {
        //     return;
        // }
        // this.setData({
        //     isGetVlassinfo: true
        // });
        let that = this;
        wx.request({
            url: 'https://work.iweigame.com/buyiban/homework/gettags',
            data: {
                starttime: start,
                endtime: end,
                session: app.globalData.session
            },
            success: function (res) {
                //console.log(res.data);
                if (res.data.code != 200) {
                    wx.showModal({
                        title: '提示',
                        content: '获取课程失败',
                        showCancel: false
                    })
                    return;
                }

                let classinfo = res.data.data;
                // classinfo.push({
                //     "homeworkid": "0", "tagname": "数学班", "tagid": 3, "tagdata": "2018-03-15", "iscomment": 0
                // })
                //console.log(classinfo);
                that.setData({
                    classinfo
                });
                (callback && typeof (callback) === "function") && callback();
            },
            fail: function () {
                wx.showModal({
                    title: '提示',
                    content: '获取课程失败',
                    showCancel: false
                })
            },
            complete: function () {
                wx.hideLoading();
                //改变获取状态
                that.setData({
                    isGetVlassinfo: false
                });
            }
        })
    },
    /**
       * 左右滑动
       */
    swiperChange(e) {
        const lastIndex = this.data.swiperIndex
            , currentIndex = e.detail.current
        let flag = false
            , { year, month, day, today, date, calendar, swiperMap } = this.data
            , change = swiperMap[(lastIndex + 2) % 4]
            , time = this.countMonth(year, month)
            , key = 'lastMonth'

        if (lastIndex > currentIndex) {
            lastIndex === 3 && currentIndex === 0
                ? flag = true
                : null
        } else {
            lastIndex === 0 && currentIndex === 3
                ? null
                : flag = true
        }
        if (flag) {
            key = 'nextMonth'
        }

        year = time[key].year
        month = time[key].month
        date = `${year}-${month}`
        day = ''
        if (today.indexOf(date) !== -1) {
            day = today.slice(-2)
        }

        time = this.countMonth(year, month)
        calendar[change] = null
        let starttime = `${time.lastMonth.year}-${time.lastMonth.month}-01`,
            endtime = `${time.nextMonth.year}-${time.nextMonth.month}-${time.nextMonth.num}`,
            that = this;
        this.getWork(starttime, endtime, function () {
            console.log(starttime, endtime)
            calendar[change] = that.generateAllDays(time[key].year, time[key].month);
            that.setData({
                swiperIndex: currentIndex,
                //文档上不推荐这么做，但是滑动并不会改变current的值，所以随之而来的计算会出错
                year,
                month,
                date,
                day,
                calendar
            })
        })

    },
	/**
	 * 点击切换月份，生成本月视图以及临近两个月的视图
	 */
    generateThreeMonths(year, month) {
        let { swiperIndex, swiperMap, calendar } = this.data
            , thisKey = swiperMap[swiperIndex]
            , lastKey = swiperMap[swiperIndex - 1 === -1 ? 3 : swiperIndex - 1]
            , nextKey = swiperMap[swiperIndex + 1 === 4 ? 0 : swiperIndex + 1]
            , time = this.countMonth(year, month)

        delete calendar[lastKey]
        calendar[lastKey] = this.generateAllDays(time.lastMonth.year, time.lastMonth.month)
        delete calendar[thisKey]
        calendar[thisKey] = this.generateAllDays(time.thisMonth.year, time.thisMonth.month)
        delete calendar[nextKey]
        calendar[nextKey] = this.generateAllDays(time.nextMonth.year, time.nextMonth.month)

        //console.log(calendar)
        return calendar

    },
    //点击day事件
    bindDayTap(e) {
        let { month, year } = this.data
            , time = this.countMonth(year, month)
            , tapMon = e.currentTarget.dataset.month
            , day = e.currentTarget.dataset.day
            , homeworkid = e.currentTarget.dataset.homeworkid
            , iscomment = e.currentTarget.dataset.iscomment
            , tagid = e.currentTarget.dataset.tagid
            , tagname = e.currentTarget.dataset.tagname
        if (tapMon == time.lastMonth.month) {
            this.changeDate(time.lastMonth.year, time.lastMonth.month)
        } else if (tapMon == time.nextMonth.month) {
            this.changeDate(time.nextMonth.year, time.nextMonth.month)
        } else {
            this.setData({
                day
            })
        }
        let beSelectDate = e.currentTarget.dataset.date;

        this.setData({
            beSelectDate,
            homeworkid,//判断是否有作业
            iscomment,//判断是否批阅
            tagid,//判断是否有课程
            showCaldenlar: false
        })


        //有课程也有作业则看详情
        if (tagid !== '') {
            if (homeworkid === '0' || homeworkid === null) {
                this.setData({
                    isPublic: true
                })
            } else {
                wx.navigateTo({
                    url: `../detail/detail?homeworkid=${homeworkid}&iscomment=${iscomment}`
                })
            }
        }

    },
    bindDateChange(e) {
        if (e.detail.value === this.data.date) {
            return
        }

        const month = e.detail.value.slice(-2)
            , year = e.detail.value.slice(0, 4)

        this.changeDate(year, month)
    },
    prevMonth(e) {
        let { year, month } = this.data
            , time = this.countMonth(year, month)
        this.changeDate(time.lastMonth.year, time.lastMonth.month)
    },
    nextMonth(e) {
        let { year, month } = this.data
            , time = this.countMonth(year, month)
        this.changeDate(time.nextMonth.year, time.nextMonth.month)
    },
	/**
	 * 直接改变日期
	 */
    changeDate(year, month) {
        let { day, today } = this.data
            , that = this
            , calendar = null
            , date = `${year}-${month}`
            , time = this.countMonth(year, month);

        //console.log(time)
        let starttime = `${time.lastMonth.year}-${time.lastMonth.month}-01`,
            endtime = `${time.nextMonth.year}-${time.nextMonth.month}-${time.nextMonth.num}`


        that.getWork(starttime, endtime, function () {

            calendar = that.generateThreeMonths(year, month)
            date.indexOf(today) === -1
                ? day = '01'
                : day = today.slice(-2)

            that.setData({
                calendar,
                day,
                date,
                month,
                year,
            })
        })
    },
	/**
	 * 月份处理
	 */
    countMonth(year, month) {
        let lastMonth = {
            month: this.formatMonth(parseInt(month) - 1)
        }
            , thisMonth = {
                year,
                month,
                num: this.getNumOfDays(year, month)
            }
            , nextMonth = {
                month: this.formatMonth(parseInt(month) + 1)
            }

        lastMonth.year = parseInt(month) === 1 && parseInt(lastMonth.month) === 12
            ? `${parseInt(year) - 1}`
            : year + ''
        lastMonth.num = this.getNumOfDays(lastMonth.year, lastMonth.month)
        nextMonth.year = parseInt(month) === 12 && parseInt(nextMonth.month) === 1
            ? `${parseInt(year) + 1}`
            : year + ''
        nextMonth.num = this.getNumOfDays(nextMonth.year, nextMonth.month)
        return {
            lastMonth,
            thisMonth,
            nextMonth
        }
    },
    currentMonthDays(year, month) {
        const numOfDays = this.getNumOfDays(year, month)
        return this.generateDays(this.data.classinfo, year, month, numOfDays)
    },
	/**
	 * 生成上个月应显示的天
	 */
    lastMonthDays(year, month) {
        const lastMonth = this.formatMonth(parseInt(month) - 1)
            , lastMonthYear = parseInt(month) === 1 && parseInt(lastMonth) === 12
                ? `${parseInt(year) - 1}`
                : year
            , lastNum = this.getNumOfDays(lastMonthYear, lastMonth) //上月天数
        let startWeek = this.getWeekOfDate(year, month - 1, 1) //本月1号是周几
            , days = []
        if (startWeek == 7) {
            return days
        }

        const startDay = lastNum - startWeek

        return this.generateDays(this.data.classinfo, lastMonthYear, lastMonth, lastNum, { startNum: startDay, notCurrent: true })
    },
	/**
	 * 生成下个月应显示天
	 */
    nextMonthDays(year, month) {
        const nextMonth = this.formatMonth(parseInt(month) + 1)
            , nextMonthYear = parseInt(month) === 12 && parseInt(nextMonth) === 1
                ? `${parseInt(year) + 1}`
                : year
            , nextNum = this.getNumOfDays(nextMonthYear, nextMonth)  //下月天数
        let endWeek = this.getWeekOfDate(year, month)	//本月最后一天是周几
            , days = []
            , daysNum = 0
        if (endWeek == 6) {
            return days
        } else if (endWeek == 7) {
            daysNum = 6
        } else {
            daysNum = 6 - endWeek
        }
        return this.generateDays(this.data.classinfo, nextMonthYear, nextMonth, daysNum, { startNum: 1, notCurrent: true })
    },
	/**
	 * 生成一个月的日历
	 */
    generateAllDays(year, month) {
        let lastMonth = this.lastMonthDays(year, month)
            , thisMonth = this.currentMonthDays(year, month)
            , nextMonth = this.nextMonthDays(year, month)
            , days = [].concat(lastMonth, thisMonth, nextMonth)
        return days
    },
	/**
	 * 生成日详情
	 */
    generateDays(classinfo, year, month, daysNum, option = {
        startNum: 1,
        notCurrent: false
    }) {
        const weekMap = ['一', '二', '三', '四', '五', '六', '日'];

        //课程信息为classInfo

        const classInfolength = classinfo.length;
        let days = []
        for (let i = option.startNum; i <= daysNum; i++) {
            let week = weekMap[new Date(year, month - 1, i).getUTCDay()]
            let day = this.formatDay(i)

            let homeworkid = '', iscomment = '', tagid = '', tagname = '';
            //通过year, month, daysNum这三个参数拼出来的日期来和后台匹配是否有课程信息
            // 建议后台返回带日期匹配的键值对，可对应加入到日历中去
            for (let a = 0; a < classInfolength; a++) {
                //此处做判断是否有课程信息需要写入日历
                if (`${year}-${month}-${day}` === classinfo[a].tagdata) {
                    homeworkid = classinfo[a].homeworkid;
                    iscomment = classinfo[a].iscomment;
                    tagid = classinfo[a].tagid;
                    tagname = classinfo[a].tagname;
                }
            }

            days.push({
                date: `${year}-${month}-${day}`,
                event: false,
                day,
                week,
                month,
                year,
                homeworkid,
                iscomment,
                tagid,
                tagname
            })
        }
        return days
    },
	/**
	 * 获取指定月第n天是周几		|
	 */
    getWeekOfDate(year, month, day = 0) {
        let dateOfMonth = new Date(year, month, 0).getUTCDay() + 1;
        dateOfMonth == 7 ? dateOfMonth = 0 : '';
        return dateOfMonth;
    },
	/**
	 * 获取本月天数
	 */
    getNumOfDays(year, month, day = 0) {
        return new Date(year, month, day).getDate()
    },
	/**
	 * 月份处理
	 */
    formatMonth(month) {
        let monthStr = ''
        if (month > 12 || month < 1) {
            monthStr = Math.abs(month - 12) + ''
        } else {
            monthStr = month + ''
        }
        monthStr = `${monthStr.length > 1 ? '' : '0'}${monthStr}`
        return monthStr
    },
    formatDay(day) {
        return `${(day + '').length > 1 ? '' : '0'}${day}`
    },
    showCaldenlar() {
        this.setData({
            showCaldenlar: !this.data.showCaldenlar
        })
    },
    getUserInfo: function (e) {//按钮获取用户信息
        //console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    publicWork: function () {
        wx.navigateTo({
            url: `../submitwork/submitwork?addtime=${this.data.beSelectDate}&tagid=${this.data.tagid}`
        })
    },
})
