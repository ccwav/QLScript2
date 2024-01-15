/*
cron "0 0 * * *" bot_jd_bean_change.js, tag:机器人查询专用脚本
 */

//详细说明参考 https://github.com/ccwav/QLScript2

const $ = new Env('机器人查询专用脚本');
const JXUserAgent = $.isNode() ? (process.env.JX_USER_AGENT ? process.env.JX_USER_AGENT : ``) : ``;
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const axios = require('axios');
let NowHour = new Date().getHours();
let allMessage = '';
let allReceiveMessage = '';
let allWarnMessage = '';
let ReturnMessage = '';
let notifySkipList = "";
let isSignError = false;
let ReturnMessageTitle="";
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let intPerSent = 0;
let i = 0;
let Today = new Date();
let strAllNotify="";
let strSubNotify="";
let llPetError=false;
let strGuoqi="";
let RemainMessage = '';
let TempBaipiao = "";
let llgeterror=false;
let time = new Date().getHours();
const {getEnvByPtPin} = require('./ql');
let userIndex2 = -1;
let userIndex3 = -1;
let userIndex4 = -1;
let jdSignUrl = 'https://api.nolanstore.top/sign'
if (process.env.SIGNURL)
	jdSignUrl = process.env.SIGNURL;


if ($.isNode()) {
	Object.keys(jdCookieNode).forEach((item) => {
		cookiesArr.push(jdCookieNode[item])
	})
	if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false')
		console.log = () => {};
}
let intcheckckseq=999999;
let strcheckck = process.env.BOTCHECKCODE;

if(!strcheckck){
	console.log("【账号🆔】没有获取到要查询的账号");
	return
}

for (i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
        cookie = cookiesArr[i];
        $.pt_pin = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        if (strcheckck == $.pt_pin) {
            intcheckckseq = i;
            break;
        }
    }
}

if (intcheckckseq == 999999) {
    if (IsNumber(strcheckck)) {
        if (parseInt(strcheckck) > cookiesArr.length) {
            console.log('【账号'+strcheckck+'🆔】你哪来那么多账号,没点逼数吗');
            return
        }
        intcheckckseq = parseInt(strcheckck) - 1;
    }
}
console.log("当前查询的CK序号是:"+(intcheckckseq+1));

//查询开关
let strDisableList = "";
let DisableIndex=-1;
if ($.isNode()) {	
	strDisableList = process.env.BEANCHANGE_BOTDISABLELIST ? process.env.BEANCHANGE_BOTDISABLELIST.split('&') : [];
}

//喜豆查询
let EnableJxBeans=true;
DisableIndex=strDisableList.findIndex((item) => item === "喜豆查询");
if(DisableIndex!=-1){
	console.log("检测到设定关闭喜豆查询");
	EnableJxBeans=false
}

//东东农场
let EnableJdFruit=true;
DisableIndex = strDisableList.findIndex((item) => item === "东东农场");
if(DisableIndex!=-1){
	console.log("检测到设定关闭东东农场查询");
	EnableJdFruit=false;	
}

//极速金币
let EnableJdSpeed=true;
DisableIndex = strDisableList.findIndex((item) => item === "极速金币");
if(DisableIndex!=-1){
	console.log("检测到设定关闭极速金币查询");
	EnableJdSpeed=false;	
}

//领现金
let EnableCash=true;
DisableIndex=strDisableList.findIndex((item) => item === "领现金");
if(DisableIndex!=-1){
	console.log("检测到设定关闭领现金查询");
	EnableCash=false;	
}

//7天过期京豆
let EnableOverBean=true;
DisableIndex=strDisableList.findIndex((item) => item === "过期京豆");
if(DisableIndex!=-1){
	console.log("检测到设定关闭过期京豆查询");
	EnableOverBean=false
}

let EnableCheckEcard=true;
DisableIndex=strDisableList.findIndex((item) => item === "E卡查询");
if(DisableIndex!=-1){
	console.log("检测到设定关闭E卡查询");
	EnableCheckEcard=false
}

!(async() => {
    if (!cookiesArr[intcheckckseq]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
            "open-url": "https://bean.m.jd.com/bean/signIndex.action"
        });
        return;
    }
    i = intcheckckseq;
    if (cookiesArr[i]) {
        cookie = cookiesArr[i];
        $.pt_pin = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
        $.index = i + 1;
        $.beanCount = 0;
        $.incomeBean = 0;
        $.expenseBean = 0;
        $.todayIncomeBean = 0;
        $.todayOutcomeBean = 0;
        $.errorMsg = '';
        $.isLogin = true;
        $.nickName = '';
        $.levelName = '';
        $.message = '';
        $.balance = 0;
        $.expiredBalance = 0;
        $.JdFarmProdName = '';
        $.JdtreeEnergy = 0;
        $.JdtreeTotalEnergy = 0;
        $.treeState = 0;
        $.JdwaterTotalT = 0;
        $.JdwaterD = 0;
        $.JDwaterEveryDayT = 0;
        $.JDtotalcash = 0;        
        $.jdCash = 0;
        $.isPlusVip = false;
		$.isRealNameAuth=false;
        $.JingXiang = "";
        $.allincomeBean = 0; //月收入
        $.allexpenseBean = 0; //月支出
        $.beanChangeXi = 0;
        $.inJxBean = 0;
        $.OutJxBean = 0;
        $.todayinJxBean = 0;
        $.todayOutJxBean = 0;
        $.xibeanCount = 0;
        $.YunFeiTitle = "";
        $.YunFeiQuan = 0;
        $.YunFeiQuanEndTime = "";
        $.YunFeiTitle2 = "";
        $.YunFeiQuan2 = 0;
        $.YunFeiQuanEndTime2 = "";
		$.ECardinfo = "";
		$.PlustotalScore=0;
		$.marketCardTotal="";
        TempBaipiao = "";
        strGuoqi = "";
		await TotalBean();
        if (!$.isLogin) {
            await isLoginByX1a0He();
        }
        if (!$.isLogin) {
            console.log(`【提示】cookie已失效,\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`);
            return
        }
		
		await Promise.all([
		         getjdfruitinfo(), //东东农场
		         cash(), //极速金币
		         bean(), //京豆查询
		         jdCash(), //领现金
		         GetJxBeaninfo(), //喜豆查询	
				 CheckEcard(), //E卡查询
				 getmarketCard()	 
		     ])
        await showMsg();    
    }

})()
.catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
})
.finally(() => {
    $.done();
})
async function showMsg() {
	//if ($.errorMsg)
	//return
	ReturnMessageTitle="";
	ReturnMessage = "";
	var strsummary="";
	var temptest = await getEnvByPtPin($.UserName);
	var strRemark=getRemark(temptest.remarks);
	if(strRemark)
		ReturnMessageTitle = `【账号🆔${(intcheckckseq+1)}】`+strRemark;
	else
		ReturnMessageTitle = `【账号${(intcheckckseq+1)}收支情况】`;
	
		
	if ($.JingXiang) {
		if ($.isRealNameAuth)
			ReturnMessageTitle += `(已实名)\n`;
		else
			ReturnMessageTitle += `(未实名)\n`;
	    ReturnMessage += `【账号信息】`;
	    if ($.isPlusVip) {
	        ReturnMessage += `Plus会员`;
	        if ($.PlustotalScore)
	            ReturnMessage += `(${$.PlustotalScore}分)`
	    } else {
	        ReturnMessage += `普通会员`;
	    }  
	    ReturnMessage += `,京享值${$.JingXiang}\n`;	    
	}else{
		ReturnMessageTitle+= `\n`;
	}
	
	ReturnMessage += `【今日京豆】收${$.todayIncomeBean}豆`;
	strsummary+= `【今日京豆】收${$.todayIncomeBean}豆`;
	if ($.todayOutcomeBean != 0) {
		ReturnMessage += `,支${$.todayOutcomeBean}豆`;
		strsummary += `,支${$.todayOutcomeBean}豆`;
	}
	ReturnMessage += `\n`;
	strsummary+= `\n`;
	ReturnMessage += `【昨日京豆】收${$.incomeBean}豆`;
	
	if ($.expenseBean != 0) {
		ReturnMessage += `,支${$.expenseBean}豆`;		
	}
	ReturnMessage += `\n`;	
	
	if ($.beanCount){		
		ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
		strsummary+= `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;	
	} else {
		if($.levelName || $.JingXiang)
			ReturnMessage += `【当前京豆】获取失败,接口返回空数据\n`;
		else{
			ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
			strsummary += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
		}			
	}
	
	if (EnableJxBeans) {
		ReturnMessage += `【今日喜豆】收${$.todayinJxBean}豆`;		
		if ($.todayOutJxBean != 0) {
			ReturnMessage += `,支${$.todayOutJxBean}豆`;			
		}
		ReturnMessage += `\n`;		
		ReturnMessage += `【昨日喜豆】收${$.inJxBean}豆`;		
		if ($.OutJxBean != 0) {
			ReturnMessage += `,支${$.OutJxBean}豆`;			
		}
		ReturnMessage += `\n`;		
		ReturnMessage += `【当前喜豆】${$.xibeanCount}喜豆(≈${($.xibeanCount/ 100).toFixed(2)}元)\n`;
		strsummary += `【当前喜豆】${$.xibeanCount}豆(≈${($.xibeanCount/ 100).toFixed(2)}元)\n`;
	}


	
	if ($.JDtotalcash) {
		ReturnMessage += `【特价金币】${$.JDtotalcash}币(≈${($.JDtotalcash / 10000).toFixed(2)}元)\n`;
	}
		
	if($.ECardinfo)
		ReturnMessage += `【礼品卡余额】${$.ECardinfo}\n`;	
	
	if($.marketCardTotal)
		ReturnMessage += `【超市卡余额】${$.marketCardTotal}\n`;	
	
	if ($.JdFarmProdName != "") {
		if ($.JdtreeEnergy != 0) {
			if ($.treeState === 2 || $.treeState === 3) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				TempBaipiao += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				allReceiveMessage += `【账号🆔】${$.JdFarmProdName} (东东农场)\n`;
			} else {
				if ($.JdwaterD != 'Infinity' && $.JdwaterD != '-Infinity') {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%,${$.JdwaterD}天)\n`;
				} else {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%)\n`;

				}
			}
		} else {
			if ($.treeState === 0) {
				TempBaipiao += `【东东农场】水果领取后未重新种植!\n`;
				allWarnMessage += `【账号🆔】水果领取后未重新种植! (东东农场)\n`;

			} else if ($.treeState === 1) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName}种植中...\n`;
			} else {
				TempBaipiao += `【东东农场】状态异常!\n`;
				allWarnMessage += `【账号🆔】状态异常! (东东农场)\n`;
				//ReturnMessage += `【东东农场】${$.JdFarmProdName}状态异常${$.treeState}...\n`;
			}
		}
	}
	
	if ($.jdCash) {
		ReturnMessage += `【其他信息】`;		
		if ($.jdCash) {				
			ReturnMessage += `领现金:${$.jdCash}元`;
		}		
		ReturnMessage += `\n`;

	}
	
	if(strGuoqi){		
		ReturnMessage += `💸💸💸临期京豆明细💸💸💸\n`;
		ReturnMessage += `${strGuoqi}`;
	}
	ReturnMessage += `🧧🧧🧧红包明细🧧🧧🧧\n`;
	ReturnMessage += `${$.message}`;
	strsummary +=`${$.message}`;
	
	if($.YunFeiQuan){
		var strTempYF="【免运费券】"+$.YunFeiQuan+"张";
		if($.YunFeiQuanEndTime)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime+")";
		strTempYF+="\n";
		ReturnMessage +=strTempYF
		strsummary +=strTempYF;
	}
	if($.YunFeiQuan2){
		var strTempYF2="【免运费券】"+$.YunFeiQuan2+"张";
		if($.YunFeiQuanEndTime2)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime2+")";
		strTempYF2+="\n";
		ReturnMessage +=strTempYF2
		strsummary +=strTempYF2;
	}
	
	allMessage += ReturnMessageTitle+ReturnMessage + `\n`;

	console.log(`${ReturnMessageTitle+ReturnMessage}`);
}
async function bean() {
	// console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
	// console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
	// 不管哪个时区。得到都是当前时刻北京时间的时间戳 new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000

	//前一天的0:0:0时间戳
	const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
	// 今天0:0:0时间戳
	const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
	let page = 1,
	t = 0,
	yesterdayArr = [],
	todayArr = [];
	do {
		let response = await getJingBeanBalanceDetail(page);		
		// console.log(`第${page}页: ${JSON.stringify(response)}`);
		if (response && response.code === "0") {
			page++;
			let detailList = response.jingDetailList;
			if (detailList && detailList.length > 0) {
				for (let item of detailList) {
					const date = item.date.replace(/-/g, '/') + "+08:00";
					if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
						todayArr.push(item);
					} else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
						//昨日的
						yesterdayArr.push(item);
					} else if (tm > new Date(date).getTime()) {
						//前天的
						t = 1;
						break;
					}
				}
			} else {
				$.errorMsg = `数据异常`;
				$.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
				t = 1;
			}
		} else if (response && response.code === "3") {
			console.log(`cookie已过期，或者填写不规范，跳出`)
			t = 1;
		} else {
			console.log(`未知情况：${JSON.stringify(response)}`);
			console.log(`未知情况，跳出`)
			t = 1;
		}
	} while (t === 0);
	for (let item of yesterdayArr) {
		if (Number(item.amount) > 0) {
			$.incomeBean += Number(item.amount);
		} else if (Number(item.amount) < 0) {
			$.expenseBean += Number(item.amount);
		}
	}
	for (let item of todayArr) {
		if (Number(item.amount) > 0) {
			$.todayIncomeBean += Number(item.amount);
		} else if (Number(item.amount) < 0) {
			$.todayOutcomeBean += Number(item.amount);
		}
	}
	$.todayOutcomeBean = -$.todayOutcomeBean;
	$.expenseBean = -$.expenseBean;	
	
	if(EnableOverBean)
		await jingBeanDetail();//过期京豆		
	await redPacket();
}

async function jdCash() {
	if (!EnableCash)
		return;
    let functionId = "cash_homePage";
    let sign = `body=%7B%7D&build=167968&client=apple&clientVersion=10.4.0&d_brand=apple&d_model=iPhone13%2C3&ef=1&eid=eidI25488122a6s9Uqq6qodtQx6rgQhFlHkaE1KqvCRbzRnPZgP/93P%2BzfeY8nyrCw1FMzlQ1pE4X9JdmFEYKWdd1VxutadX0iJ6xedL%2BVBrSHCeDGV1&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJO3CMeyDJCy%22%2C%22osVersion%22%3A%22CJUkDK%3D%3D%22%2C%22openudid%22%3A%22CJSmCWU0DNYnYtS0DtGmCJY0YJcmDwCmYJC0DNHwZNc5ZQU2DJc3Zq%3D%3D%22%2C%22area%22%3A%22CJZpCJCmC180ENcnCv80ENc1EK%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1648428189%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=104&lang=zh_CN&networkType=3g&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=11&sign=98c0ea91318ef1313786d86d832f1d4d&st=1648428208392&sv=101&uemps=0-0&uts=0f31TVRjBSv7E8yLFU2g86XnPdLdKKyuazYDek9RnAdkKCbH50GbhlCSab3I2jwM04d75h5qDPiLMTl0I3dvlb3OFGnqX9NrfHUwDOpTEaxACTwWl6n//EOFSpqtKDhg%2BvlR1wAh0RSZ3J87iAf36Ce6nonmQvQAva7GoJM9Nbtdah0dgzXboUL2m5YqrJ1hWoxhCecLcrUWWbHTyAY3Rw%3D%3D`
        return new Promise((resolve) => {
            $.post(apptaskUrl(functionId, sign), async(err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`jdCash API请求失败，请检查网路重试`)
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                            if (data.code === 0 && data.data.result) {
                                $.jdCash = data.data.result.totalMoney || 0;
                                return
                            }
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                }
                finally {
                    resolve(data);
                }
            })
        })
}
function randomUserAgent() {
    const uuid = generateRandomString('abcdefghijklmnopqrstuvwxyz0123456789', 40);
    const addressid = generateRandomString('1234567898647', 10);
    const iosVer = selectRandomFromArray(["15.1.1", "14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1"]);
    const iosV = iosVer.replace(/\./g, '_');
    const clientVersion = selectRandomFromArray(["10.3.0", "10.2.7", "10.2.4"]);
    const iPhone = selectRandomFromArray(["8", "9", "10", "11", "12", "13"]);
    const ADID = `${generateRandomString('0987654321ABCDEF', 8)}-${generateRandomString('0987654321ABCDEF', 4)}-${generateRandomString('0987654321ABCDEF', 4)}-${generateRandomString('0987654321ABCDEF', 4)}-${generateRandomString('0987654321ABCDEF', 12)}`;
    const area = `${generateRandomString('0123456789', 2)}_${generateRandomString('0123456789', 4)}_${generateRandomString('0123456789', 5)}_${generateRandomString('0123456789', 4)}`;
    const lng = `119.31991256596${randomInt(100, 999)}`;
    const lat = `26.1187118976${randomInt(100, 999)}`;

    const UserAgent = `jdapp;iPhone;10.0.4;${iosVer};${uuid};network/wifi;ADID/${ADID};model/iPhone${iPhone},1;addressid/${addressid};appBuild/167707;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS ${iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/null;supportJDSHWK/1`;
    return UserAgent;
}

function generateRandomString(chars, length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function selectRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function CheckEcard(ck) {
	if (!EnableCheckEcard)
        return;
	const UA=randomUserAgent();
    const url = 'https://mygiftcard.jd.com/giftcard/queryGiftCardItem/app?source=JDAP';
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh-Hans;q=0.9",
        "content-length": "44",
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie,
        "origin": "https://mygiftcard.jd.com",
        "referer": "https://mygiftcard.jd.com/giftcardForM.html?source=JDAP&sid=9f55a224c8286baa2fe3a7545bbd411w&un_area=16_1303_48712_48758",
        "user-agent": UA
    };
    
    let balance = 0;
	let TotalCard = 0;
    try {
		var data = 'pageNo=1&queryType=1&cardType=-1&pageSize=20';
        var response = await axios.post(url, data, { headers: headers });
        var couponVOList = response.data.couponVOList;
		
		TotalCard+=couponVOList.length;
        for (let i = 0; i < couponVOList.length; i++) {
            balance += couponVOList[i]['balance'];
        }
		
		if (TotalCard==20){
			data = 'pageNo=2&queryType=1&cardType=-1&pageSize=20';
			response = await axios.post(url, data, { headers: headers });
			couponVOList = response.data.couponVOList;
			TotalCard+=couponVOList.length;
			for (let i = 0; i < couponVOList.length; i++) {
				balance += couponVOList[i]['balance'];
			}
		}
		
        if (balance > 0) 
			$.ECardinfo = '共' + TotalCard + '张E卡,合计' + parseFloat(balance).toFixed(2) + '元';
		
    } catch (e) {
        console.error(e);
    }
}
async function getmarketCard() {
    const url = 'https://api.m.jd.com/atop_channel_marketCard_cardInfo';
	const UA=randomUserAgent();
    const headers = {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh-Hans;q=0.9",
        "content-length": "1250",
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie,
        "origin": "https://pro.m.jd.com",
        "referer": "https://pro.m.jd.com/mall/active/3KehY4eAj3D1iLzFB7p5pb68qXkT/index.html?stath=54&navh=44&topNavStyle=1&babelChannel=ttt9&hideAnchorBottomTab=1&hideBack=1&tttparams=ib0MwweyJnTGF0IjoiMjYuMTE5OTQ2IiwidW5fYXJlYSI6IjE2XzEzMDNfNDg3MTJfNDg3NTgiLCJkTGF0IjoiIiwicHJzdGF0ZSI6IjAiLCJhZGRyZXNzSWQiOiI5MjU4MDQyNTg3IiwibGF0IjoiMC4wMDAwMDAiLCJwb3NMYXQiOiIyNi4xMTk5NDYiLCJwb3NMbmciOiIxMTkuMzIwMzM5IiwiZ3BzX2FyZWEiOiIwXzBfMF8wIiwibG5nIjoiMC4wMDAwMDAiLCJ1ZW1wcyI6IjAtMC0yIiwiZ0xuZyI6IjExOS4zMjAzMzkiLCJtb2RlbCI6ImlQaG9uZTE1LDIiLCJkTG5nIjoiIn60%3D&forceCurrentView=1&showhead=no",
        "request-from": "native",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": UA,
        "x-referer-page": "https://pro.m.jd.com/mall/active/3KehY4eAj3D1iLzFB7p5pb68qXkT/index.html",
        "x-rp-client": "h5_1.0.0"
    };
	const data='appid=jd-super-market&t=1705212843271&functionId=atop_channel_marketCard_cardInfo&client=m&uuid=1201e4461b24640164a706c0a3444fd79de6577f&body=%7B%22babelChannel%22%3A%22ttt9%22%2C%22isJdApp%22%3A%221%22%2C%22isWx%22%3A%220%22%7D&h5st=20240114141403366%3Btnyqq56fhh69dd12%3B35fa0%3Btk02w847d1aac41lMXgyKzErM2w1k33PAhGy9ZX69M3Rvtgag743srkufMW1LE0zE5Crn405w3HPl20IgdET8DfgM32d%3B87c14a095a901f37feabf4d6616b8e149539de48e2fd715bedda5baea9729c41%3B4.3%3B1705212843366%3B5fb5b0eea0d604be5747ccee135178e687458f7f659003bdc2ca943d6e3006043ae4bf75ab450370c9d309909a15a988f37ccb53c9ced6e3017095a1065b75238ed637a529a266eb3370fc34ce5a9036017e96632bec64838fdb2f9b39c675cdc7d19ddc121504a7a32f7e1da54fc20c2f8ce6b879c255b77a506eb644aa4e532df91f2c44c6e7412b713f82847feb7e76668e7b0dd6e97685dfff3708e0fa5d4a08ca7a4eba27b71f0d5ecbc75cb17e6c4a6052b5b7b30d17005a24eb576981c7dd1b066a8ac01ffee3f77faa4cba708daf2be433c83204e302ac610d3eba913f78a2d39a82d2f74c9f05fee1768d97ffae5668989394f4412c7de5dd105e663aca420a85fa949e412ff869d0199814a265a0f13cad4ff8e0a4e6c3ccebbd22cb1f0398da3ef6eedb3b6941fdc55d7449823c957977e607ddbdf39a6e016f98&x-api-eid-token=jdd03NK6FVUZZ5D76SCVX2RZCJX3PGM7JVJNWMQ56NLLLQEEVURFKGHP537UFXMCBYWZUBFICVZMQJNXLODQMJOA6B3YOIAAAAAMNA2NP7SQAAAAAD5BK47RNLM7UAYX'
    try {
		const response = await axios.post(url, data, { headers });		
        if (response.data.success && response.data.data?.floorData?.items && response.data.data?.floorData?.items[0].marketCardVO.balance>0) {
            $.marketCardTotal = "总"+response.data.data?.floorData?.items[0].marketCardVO.balance+"元";
			if(response.data.data?.floorData?.items[0].marketCardVO.expirationGiftAmountDes)
				$.marketCardTotal +=","+response.data.data?.floorData?.items[0].marketCardVO.expirationGiftAmountDes;
        }
	} catch (e) {
		console.error(e);
	}
}

function apptaskUrl(functionId = "", body = "") {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}`,
    body,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': '',
      'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: 10000
  }
}

/* function TotalBean() {
	return new Promise(async resolve => {
		const options = {
			url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
			headers: {
				"Accept": "application/json, text/plain",
				"accept-encoding": "gzip, deflate, br",
				"content-type": "application/json;charset=UTF-8",
				Cookie: cookie,
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.42"
			},
			timeout: 10000
		}
		$.get(options, (err, resp, data) => {
			try {
				if (err) {
					$.logErr(err)
				} else {					
					if (data) {
						data = JSON.parse(data);

						if (data['retcode'] === "1001") {
							$.isLogin = false; //cookie过期
							return;
						}
						if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
							$.nickName = data.data.userInfo.baseInfo.nickname;
							$.levelName = data.data.userInfo.baseInfo.levelName;
							$.isPlusVip = data.data.userInfo.isPlusVip;

						}
						if (data['retcode'] === '0' && data.data && data.data['assetInfo']) {
							if ($.beanCount == 0)
								$.beanCount = data.data && data.data['assetInfo']['beanNum'];
						} else {
							$.errorMsg = `数据异常`;
						}
					} else {
						$.log('京东服务器返回空数据,将无法获取等级及VIP信息');
					}
				}
			} catch (e) {
				$.logErr(e)
			}
			finally {
				resolve();
			}
		})
	})
} */


function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === 13) {
                            $.isLogin = false; //cookie过期
                            return
                        }
                        if (data['retcode'] === 0) {
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
							$.isPlusVip=data['isPlusVip'];
							$.isRealNameAuth=data['isRealNameAuth'];
							$.beanCount=(data['base'] && data['base'].jdNum) || 0 ;		
							$.JingXiang = (data['base'] && data['base'].jvalue) || 0 ;						
                        } else {
                            $.nickName = $.UserName
                        }
						
							
							
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}


function isLoginByX1a0He() {
	return new Promise((resolve) => {
		const options = {
			url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
			headers: {
				"Cookie": cookie,
				"referer": "https://h5.m.jd.com/",
				"User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
			},
			timeout: 10000
		}
		$.get(options, (err, resp, data) => {
			try {
				if (data) {
					data = JSON.parse(data);
					if (data.islogin === "1") {
						console.log(`使用X1a0He写的接口加强检测: Cookie有效\n`)
					} else if (data.islogin === "0") {
						$.isLogin = false;
						console.log(`使用X1a0He写的接口加强检测: Cookie无效\n`)
					} else {
						console.log(`使用X1a0He写的接口加强检测: 未知返回，不作变更...\n`)
						$.error = `${$.nickName} :` + `使用X1a0He写的接口加强检测: 未知返回...\n`
					}
				}
			} catch (e) {
				console.log(e);
			}
			finally {
				resolve();
			}
		});
	});
}
function getJingBeanBalanceDetail(page) {
  return new Promise(async resolve => {
    const options = {
      "url": `https://bean.m.jd.com/beanDetail/detail.json?page=${page}`,
      "body": `body=${escape(JSON.stringify({"pageSize": "20", "page": page.toString()}))}&appid=ld`,
      "headers": {
        'User-Agent': "Mozilla/5.0 (Linux; Android 12; SM-G9880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Mobile Safari/537.36 EdgA/106.0.1370.47",       
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          // console.log(`${JSON.stringify(err)}`)
          // console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            // console.log(data)
          } else {
            // console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function jingBeanDetail() {
	return new Promise(async resolve => {
	  setTimeout(async () => {
		const strsign = await getSignfromNolan('jingBeanDetail', {"pageSize": "20", "page": "1"});		
		const options = {
		  "url": `https://api.m.jd.com/client.action?functionId=jingBeanDetail`,
		  "body": strsign,
		  "headers": {
			'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
			'Host': 'api.m.jd.com',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Cookie': cookie,
		  }
		}
		$.post(options, (err, resp, data) => {
		  try {
			if (err) {
			  console.log(`${JSON.stringify(err)}`)
			  console.log(`${$.name} getJingBeanBalanceDetail API请求失败，请检查网路重试`)
			} else {
			  if (data) {				
				data = JSON.parse(data);				
				if (data?.others?.jingBeanExpiringInfo?.detailList) {				  
				  const { detailList = [] } = data?.others?.jingBeanExpiringInfo;
				  detailList.map(item => {
					strGuoqi+=`【${(item['eventMassage']).replace("即将过期京豆","").replace("年","-").replace("月","-").replace("日","")}】过期${item['amount']}豆\n`;
				  })
				} 
			  } else {
				console.log(`jingBeanDetail 京东服务器返回空数据`)
			  }
			}
		  } catch (e) {
			$.logErr(e, resp)
		  } finally {
			resolve(data);
		  }
		})
	  }, 0 * 1000);
	})
  } 

function getSignfromNolan(functionId, body) {	
    var strsign = '';
	let data = {
      "fn":functionId,
      "body": body
    }
    return new Promise((resolve) => {
        let url = {
            url: jdSignUrl,
            body: JSON.stringify(data),
		    followRedirect: false,
		    headers: {
		        'Accept': '*/*',
		        "accept-encoding": "gzip, deflate, br",
		        'Content-Type': 'application/json'
		    },
		    timeout: 30000
        }
        $.post(url, async(err, resp, data) => {
            try {				
                data = JSON.parse(data);
                if (data && data.body) {                    
                    if (data.body)
                        strsign = data.body || '';
                    if (strsign != '')
                        resolve(strsign);
                    else
                        console.log("签名获取失败.");
                } else {
                    console.log("签名获取失败.");
                }				
            }catch (e) {
                $.logErr(e, resp);
            }finally {
				resolve(strsign);
			}
        })
    })
}

function redPacket() {
	return new Promise(async resolve => {
		const options = {
			"url": `https://api.m.jd.com/client.action?functionId=myhongbao_getUsableHongBaoList&body=%7B%22appId%22%3A%22appHongBao%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22platformId%22%3A%22appHongBao%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22platform%22%3A%221%22%2C%22orgType%22%3A%222%22%2C%22country%22%3A%22cn%22%2C%22childActivityId%22%3A%22-1%22%2C%22childActiveName%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22openId%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22eid%22%3A%22-1%22%2C%22fp%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22shshshfpb%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22activityType%22%3A%221%22%2C%22isRvc%22%3A%22-1%22%2C%22pageClickKey%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22organization%22%3A%22JD%22%7D&appid=JDReactMyRedEnvelope&client=apple&clientVersion=7.0.0`,
			"headers": {
				'Host': 'api.m.jd.com',
				'Accept': '*/*',
				'Connection': 'keep-alive',
				'Accept-Language': 'zh-cn',
				'Referer': 'https://h5.m.jd.com/',
				'Accept-Encoding': 'gzip, deflate, br',
				"Cookie": cookie,
				'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
			}
		}
		$.get(options, (err, resp, data) => {
			try {				
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`redPacket API请求失败，请检查网路重试`)
				} else {
					if (data) {
						data = JSON.parse(data);
						$.jxRed = 0,
						$.jsRed = 0,
						$.jdRed = 0,
						$.jdhRed = 0,
						$.jdwxRed = 0,
						$.jdGeneralRed = 0,
						$.jxRedExpire = 0,
						$.jsRedExpire = 0,
						$.jdRedExpire = 0,
						$.jdhRedExpire = 0;
						$.jdwxRedExpire = 0,
						$.jdGeneralRedExpire = 0
						
						let t = new Date();
						t.setDate(t.getDate() + 1);
						t.setHours(0, 0, 0, 0);
						t = parseInt((t - 1) / 1000)*1000;
						
						for (let vo of data.hongBaoList || []) {
						    if (vo.orgLimitStr) {								
						        if (vo.orgLimitStr.includes("京喜") && !vo.orgLimitStr.includes("特价")) {
						            $.jxRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jxRedExpire += parseFloat(vo.balance)									
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("购物小程序")) {
						            $.jdwxRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdwxRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("京东商城")) {
						            $.jdRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("极速") || vo.orgLimitStr.includes("京东特价") || vo.orgLimitStr.includes("京喜特价")) {
						            $.jsRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jsRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
						            $.jdhRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdhRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        }
						    }
						    $.jdGeneralRed += parseFloat(vo.balance)
						    if (vo['endTime'] === t) {
						        $.jdGeneralRedExpire += parseFloat(vo.balance)
						    }
						}
						
						$.balance = ($.jxRed+$.jsRed+$.jdRed +$.jdhRed+$.jdwxRed+$.jdGeneralRed).toFixed(2);
						$.jxRed = $.jxRed.toFixed(2);
						$.jsRed = $.jsRed.toFixed(2);
						$.jdRed = $.jdRed.toFixed(2);						
						$.jdhRed = $.jdhRed.toFixed(2);
						$.jdwxRed = $.jdwxRed.toFixed(2);
						$.jdGeneralRed = $.jdGeneralRed.toFixed(2);						
						$.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire+$.jdhRedExpire+$.jdwxRedExpire+$.jdGeneralRedExpire).toFixed(2);
						$.message += `【红包总额】${$.balance}(总过期${$.expiredBalance})元 \n`;
						if ($.jxRed > 0){
							if($.jxRedExpire>0)
								$.message += `【京喜红包】${$.jxRed}(将过期${$.jxRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【京喜红包】${$.jxRed}元 \n`;
						}
							
						if ($.jsRed > 0){
							if($.jsRedExpire>0)
								$.message += `【京喜特价】${$.jsRed}(将过期${$.jsRedExpire.toFixed(2)})元(原极速版) \n`;
							else
								$.message += `【京喜特价】${$.jsRed}元(原极速版) \n`;
						}
							
						if ($.jdRed > 0){
							if($.jdRedExpire>0)
								$.message += `【京东红包】${$.jdRed}(将过期${$.jdRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【京东红包】${$.jdRed}元 \n`;
						}
							
						if ($.jdhRed > 0){
							if($.jdhRedExpire>0)
								$.message += `【健康红包】${$.jdhRed}(将过期${$.jdhRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【健康红包】${$.jdhRed}元 \n`;
						}
							
						if ($.jdwxRed > 0){
							if($.jdwxRedExpire>0)
								$.message += `【微信小程序】${$.jdwxRed}(将过期${$.jdwxRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【微信小程序】${$.jdwxRed}元 \n`;
						}
							
						if ($.jdGeneralRed > 0){
							if($.jdGeneralRedExpire>0)
								$.message += `【全平台通用】${$.jdGeneralRed}(将过期${$.jdGeneralRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【全平台通用】${$.jdGeneralRed}元 \n`;
							
						}
							
					} else {
						console.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function jdfruitRequest(function_id, body = {}, timeout = 1000) {
	return new Promise(resolve => {
		setTimeout(() => {
			$.get(taskfruitUrl(function_id, body), (err, resp, data) => {
				try {
					if (err) {
						console.log('\n东东农场: API查询请求失败 ‼️‼️')
						console.log(JSON.stringify(err));
						console.log(`function_id:${function_id}`)
						$.logErr(err);
					} else {
						if (safeGet(data)) {							
							data = JSON.parse(data);
							if (data.code=="400"){
								console.log('东东农场: '+data.message)
								llgeterror = true;
							}
							else
								$.JDwaterEveryDayT = data.totalWaterTaskInit.totalWaterTaskTimes;
						}
					}
				} catch (e) {
					$.logErr(e, resp);
				}
				finally {
					resolve(data);
				}
			})
		}, timeout)
	})
}

async function getjdfruitinfo() {
    if (EnableJdFruit) {
        llgeterror = false;

        await jdfruitRequest('taskInitForFarm', {
            "version": 14,
            "channel": 1,
            "babelChannel": "120"
        });
		if (llgeterror)
			return
        await getjdfruit();
        if (llgeterror) {
            console.log(`东东农场API查询失败,等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await getjdfruit();
        }
        if (llgeterror) {
            console.log(`东东农场API查询失败,有空重启路由器换个IP吧.`)
        }

    }
	return;
}

async function GetJxBeaninfo() {
    await GetJxBean(),
    await jxbean();
	return;
}

async function getjdfruit() {
	return new Promise(resolve => {
		const option = {
			url: `${JD_API_HOST}?functionId=initForFarm`,
			body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
			headers: {
				"accept": "*/*",
				"accept-encoding": "gzip, deflate, br",
				"accept-language": "zh-CN,zh;q=0.9",
				"cache-control": "no-cache",
				"cookie": cookie,
				"origin": "https://home.m.jd.com",
				"pragma": "no-cache",
				"referer": "https://home.m.jd.com/myJd/newhome.action",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site",
				"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			timeout: 10000
		};
		$.post(option, (err, resp, data) => {
			try {
				if (err) {
					if(!llgeterror){
						console.log('\n东东农场: API查询请求失败 ‼️‼️');
						console.log(JSON.stringify(err));
					}
					llgeterror = true;
				} else {
					llgeterror = false;
					if (safeGet(data)) {
						$.farmInfo = JSON.parse(data)
							if ($.farmInfo.farmUserPro) {
								$.JdFarmProdName = $.farmInfo.farmUserPro.name;
								$.JdtreeEnergy = $.farmInfo.farmUserPro.treeEnergy;
								$.JdtreeTotalEnergy = $.farmInfo.farmUserPro.treeTotalEnergy;
								$.treeState = $.farmInfo.treeState;
								let waterEveryDayT = $.JDwaterEveryDayT;
								let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10; //一共还需浇多少次水
								let waterD = Math.ceil(waterTotalT / waterEveryDayT);

								$.JdwaterTotalT = waterTotalT;
								$.JdwaterD = waterD;
							}
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}


function taskfruitUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "*/*",
      "Origin": "https://carry.m.jd.com",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Referer": "https://carry.m.jd.com/",
      "Cookie": cookie
    },
    timeout: 10000
  }
}

function safeGet(data) {
	try {
		if (typeof JSON.parse(data) == "object") {
			return true;
		}
	} catch (e) {
		console.log(e);
		console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
		return false;
	}
}

function cash() {
	if (!EnableJdSpeed)
		return;
	return new Promise(resolve => {
		$.get(taskcashUrl('MyAssetsService.execute', {
				"method": "userCashRecord",
				"data": {
					"channel": 1,
					"pageNum": 1,
					"pageSize": 20
				}
			}),
			async(err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`cash API请求失败，请检查网路重试`)
				} else {
					if (safeGet(data)) {
						data = JSON.parse(data);
						if (data.data.goldBalance)
							$.JDtotalcash = data.data.goldBalance;
						else
							console.log(`领现金查询失败，服务器没有返回具体值.`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function taskcashUrl(functionId, body = {}) {
	const struuid = randomString(16);
	let nowTime = Date.now();
	let _0x7683x5 = `${"lite-android&"}${JSON["stringify"](body)}${"&android&3.1.0&"}${functionId}&${nowTime}&${struuid}`;
	let _0x7683x6 = "12aea658f76e453faf803d15c40a72e0";
	const _0x7683x7 = $["isNode"]() ? require("crypto-js") : CryptoJS;
	let sign = _0x7683x7.HmacSHA256(_0x7683x5, _0x7683x6).toString();
	let strurl=JD_API_HOST+"api?functionId="+functionId+"&body="+`${escape(JSON["stringify"](body))}&appid=lite-android&client=android&uuid=`+struuid+`&clientVersion=3.1.0&t=${nowTime}&sign=${sign}`;
	return {
		url: strurl,
		headers: {
			'Host': "api.m.jd.com",
			'accept': "*/*",
			'kernelplatform': "RN",
			'user-agent': "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)",
			'accept-language': "zh-Hans-CN;q=1, ja-CN;q=0.9",
			'Cookie': cookie
		},
		timeout: 10000
	}
}


function taskJxUrl(functionId, body = '') {
    let url = ``;
    var UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`;

    if (body) {
        url = `https://m.jingxi.com/activeapi/${functionId}?${body}`;
        url += `&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
    } else {
        url = `https://m.jingxi.com/activeapi/${functionId}?_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
    }
    return {
        url,
        headers: {
            "Host": "m.jingxi.com",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": UA,
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Referer": "https://st.jingxi.com/",
            "Cookie": cookie
        },
		timeout: 10000
    }
}


function GetJxBeanDetailData() {
  return new Promise((resolve) => {
    $.get(taskJxUrl("queryuserjingdoudetail","pagesize=10&type=16"), async (err, resp, data) => {
        try {
          if (err) {
            console.log(JSON.stringify(err));
            console.log(`GetJxBeanDetailData请求失败，请检查网路重试`);
          } else {
            data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);      
            
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      });
  });
}
function GetJxBean() {
    if (!EnableJxBeans)
        return;
    return new Promise((resolve) => {
        $.get(taskJxUrl("querybeanamount"), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    console.log(`GetJxBean请求失败，请检查网路重试`);
                } else {
                    data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                    if (data) {
                        if (data.errcode == 0) {
                            $.xibeanCount = data.data.xibean;
                            if (!$.beanCount) {
                                $.beanCount = data.data.jingbean;
                            }
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve(data);
            }
        });
    });
}
async function jxbean() {
	if (!EnableJxBeans)
        return;
    //前一天的0:0:0时间戳
    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
    // 今天0:0:0时间戳
    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
    var JxYesterdayArr = [],
    JxTodayArr = [];
    var JxResponse = await GetJxBeanDetailData();
    if (JxResponse && JxResponse.ret == "0") {
        var Jxdetail = JxResponse.detail;
        if (Jxdetail && Jxdetail.length > 0) {
            for (let item of Jxdetail) {
                const date = item.createdate.replace(/-/g, '/') + "+08:00";
                if (new Date(date).getTime() >= tm1 && (!item['visibleinfo'].includes("退还") && !item['visibleinfo'].includes('扣赠'))) {
                    JxTodayArr.push(item);
                } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['visibleinfo'].includes("退还") && !item['visibleinfo'].includes('扣赠'))) {
                    //昨日的
                    JxYesterdayArr.push(item);
                } else if (tm > new Date(date).getTime()) {
                    break;
                }
            }
        } else {
            $.errorMsg = `数据异常`;
            $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
        }

        for (let item of JxYesterdayArr) {
            if (Number(item.amount) > 0) {
                $.inJxBean += Number(item.amount);
            } else if (Number(item.amount) < 0) {
                $.OutJxBean += Number(item.amount);
            }
        }
        for (let item of JxTodayArr) {
            if (Number(item.amount) > 0) {
                $.todayinJxBean += Number(item.amount);
            } else if (Number(item.amount) < 0) {
                $.todayOutJxBean += Number(item.amount);
            }
        }
		$.todayOutJxBean = -$.todayOutJxBean;
		$.OutJxBean = -$.OutJxBean;
    }

}
	
function randomString(e) {
	e = e || 32;
	let t = "0123456789abcdef",
	a = t.length,
	n = "";
	for (let i = 0; i < e; i++)
		n += t.charAt(Math.floor(Math.random() * a));
	return n
}

Date.prototype.Format = function (fmt) {
	var e,
	n = this,
	d = fmt,
	l = {
		"M+": n.getMonth() + 1,
		"d+": n.getDate(),
		"D+": n.getDate(),
		"h+": n.getHours(),
		"H+": n.getHours(),
		"m+": n.getMinutes(),
		"s+": n.getSeconds(),
		"w+": n.getDay(),
		"q+": Math.floor((n.getMonth() + 3) / 3),
		"S+": n.getMilliseconds()
	};
	/(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
	for (var k in l) {
		if (new RegExp("(".concat(k, ")")).test(d)) {
			var t,
			a = "S+" === k ? "000" : "00";
			d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
		}
	}
	return d;
}

function getRemark(strRemark) {
    var strTempRemark = "";
    if (strRemark) {
        var Tempindex = strRemark.indexOf("@@");
        if (Tempindex != -1) {
			var TempRemarkList = strRemark.split("@@");
			strTempRemark=TempRemarkList[0];            
        } else{
			strTempRemark=strRemark;
		}
    }
   
    return strTempRemark;
}

function timeFormat(time) {
	let date;
	if (time) {
		date = new Date(time)
	} else {
		date = new Date();
	}
	return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}


function IsNumber(value) {
    intPerSent = parseInt(value);
    if (!intPerSent)
        return false;
    else
        return true;
}


// prettier-ignore
function Env(t, e) {
	"undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
	class s {
		constructor(t) {
			this.env = t
		}
		send(t, e = "GET") {
			t = "string" == typeof t ? {
				url: t
			}
			 : t;
			let s = this.get;
			return "POST" === e && (s = this.post),
			new Promise((e, i) => {
				s.call(this, t, (t, s, r) => {
					t ? i(t) : e(s)
				})
			})
		}
		get(t) {
			return this.send.call(this.env, t)
		}
		post(t) {
			return this.send.call(this.env, t, "POST")
		}
	}
	return new class {
		constructor(t, e) {
			this.name = t,
			this.http = new s(this),
			this.data = null,
			this.dataFile = "box.dat",
			this.logs = [],
			this.isMute = !1,
			this.isNeedRewrite = !1,
			this.logSeparator = "\n",
			this.startTime = (new Date).getTime(),
			Object.assign(this, e),
			this.log("", `🔔${this.name}, 开始!`)
		}
		isNode() {
			return "undefined" != typeof module && !!module.exports
		}
		isQuanX() {
			return "undefined" != typeof $task
		}
		isSurge() {
			return "undefined" != typeof $httpClient && "undefined" == typeof $loon
		}
		isLoon() {
			return "undefined" != typeof $loon
		}
		toObj(t, e = null) {
			try {
				return JSON.parse(t)
			} catch {
				return e
			}
		}
		toStr(t, e = null) {
			try {
				return JSON.stringify(t)
			} catch {
				return e
			}
		}
		getjson(t, e) {
			let s = e;
			const i = this.getdata(t);
			if (i)
				try {
					s = JSON.parse(this.getdata(t))
				} catch {}
			return s
		}
		setjson(t, e) {
			try {
				return this.setdata(JSON.stringify(t), e)
			} catch {
				return !1
			}
		}
		getScript(t) {
			return new Promise(e => {
				this.get({
					url: t
				}, (t, s, i) => e(i))
			})
		}
		runScript(t, e) {
			return new Promise(s => {
				let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
				i = i ? i.replace(/\n/g, "").trim() : i;
				let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
				r = r ? 1 * r : 20,
				r = e && e.timeout ? e.timeout : r;
				const[o, h] = i.split("@"),
				n = {
					url: `http://${h}/v1/scripting/evaluate`,
					body: {
						script_text: t,
						mock_type: "cron",
						timeout: r
					},
					headers: {
						"X-Key": o,
						Accept: "*/*"
					}
				};
				this.post(n, (t, e, i) => s(i))
			}).catch(t => this.logErr(t))
		}
		loaddata() {
			if (!this.isNode())
				return {}; {
				this.fs = this.fs ? this.fs : require("fs"),
				this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
				e = this.path.resolve(process.cwd(), this.dataFile),
				s = this.fs.existsSync(t),
				i = !s && this.fs.existsSync(e);
				if (!s && !i)
					return {}; {
					const i = s ? t : e;
					try {
						return JSON.parse(this.fs.readFileSync(i))
					} catch (t) {
						return {}
					}
				}
			}
		}
		writedata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require("fs"),
				this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
				e = this.path.resolve(process.cwd(), this.dataFile),
				s = this.fs.existsSync(t),
				i = !s && this.fs.existsSync(e),
				r = JSON.stringify(this.data);
				s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
			}
		}
		lodash_get(t, e, s) {
			const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
			let r = t;
			for (const t of i)
				if (r = Object(r)[t], void 0 === r)
					return s;
			return r
		}
		lodash_set(t, e, s) {
			return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
		}
		getdata(t) {
			let e = this.getval(t);
			if (/^@/.test(t)) {
				const[, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
				r = s ? this.getval(s) : "";
				if (r)
					try {
						const t = JSON.parse(r);
						e = t ? this.lodash_get(t, i, "") : e
					} catch (t) {
						e = ""
					}
			}
			return e
		}
		setdata(t, e) {
			let s = !1;
			if (/^@/.test(e)) {
				const[, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
				o = this.getval(i),
				h = i ? "null" === o ? null : o || "{}" : "{}";
				try {
					const e = JSON.parse(h);
					this.lodash_set(e, r, t),
					s = this.setval(JSON.stringify(e), i)
				} catch (e) {
					const o = {};
					this.lodash_set(o, r, t),
					s = this.setval(JSON.stringify(o), i)
				}
			} else
				s = this.setval(t, e);
			return s
		}
		getval(t) {
			return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
		}
		setval(t, e) {
			return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
		}
		initGotEnv(t) {
			this.got = this.got ? this.got : require("got"),
			this.cktough = this.cktough ? this.cktough : require("tough-cookie"),
			this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar,
			t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
		}
		get(t, e = (() => {})) {
			t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
			this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
						"X-Surge-Skip-Scripting": !1
					})), $httpClient.get(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status),
					e(t, s, i)
				})) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
						hints: !1
					})), $task.fetch(t).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
					try {
						if (t.headers["set-cookie"]) {
							const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
							s && this.ckjar.setCookieSync(s, null),
							e.cookieJar = this.ckjar
						}
					} catch (t) {
						this.logErr(t)
					}
				}).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => {
					const {
						message: s,
						response: i
					} = t;
					e(s, i, i && i.body)
				}))
		}
		post(t, e = (() => {})) {
			if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon())
				this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
						"X-Surge-Skip-Scripting": !1
					})), $httpClient.post(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status),
					e(t, s, i)
				});
			else if (this.isQuanX())
				t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
						hints: !1
					})), $task.fetch(t).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => e(t));
			else if (this.isNode()) {
				this.initGotEnv(t);
				const {
					url: s,
					...i
				} = t;
				this.got.post(s, i).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => {
					const {
						message: s,
						response: i
					} = t;
					e(s, i, i && i.body)
				})
			}
		}
		time(t, e = null) {
			const s = e ? new Date(e) : new Date;
			let i = {
				"M+": s.getMonth() + 1,
				"d+": s.getDate(),
				"H+": s.getHours(),
				"m+": s.getMinutes(),
				"s+": s.getSeconds(),
				"q+": Math.floor((s.getMonth() + 3) / 3),
				S: s.getMilliseconds()
			};
			/(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
			for (let e in i)
				new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
			return t
		}
		msg(e = t, s = "", i = "", r) {
			const o = t => {
				if (!t)
					return t;
				if ("string" == typeof t)
					return this.isLoon() ? t : this.isQuanX() ? {
						"open-url": t
					}
				 : this.isSurge() ? {
					url: t
				}
				 : void 0;
				if ("object" == typeof t) {
					if (this.isLoon()) {
						let e = t.openUrl || t.url || t["open-url"],
						s = t.mediaUrl || t["media-url"];
						return {
							openUrl: e,
							mediaUrl: s
						}
					}
					if (this.isQuanX()) {
						let e = t["open-url"] || t.url || t.openUrl,
						s = t["media-url"] || t.mediaUrl;
						return {
							"open-url": e,
							"media-url": s
						}
					}
					if (this.isSurge()) {
						let e = t.url || t.openUrl || t["open-url"];
						return {
							url: e
						}
					}
				}
			};
			if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
				let t = ["", "==============📣系统通知📣=============="];
				t.push(e),
				s && t.push(s),
				i && t.push(i),
				console.log(t.join("\n")),
				this.logs = this.logs.concat(t)
			}
		}
		log(...t) {
			t.length > 0 && (this.logs = [...this.logs, ...t]),
			console.log(t.join(this.logSeparator))
		}
		logErr(t, e) {
			const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
			s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
		}
		wait(t) {
			return new Promise(e => setTimeout(e, t))
		}
		done(t = {}) {
			const e = (new Date).getTime(),
			s = (e - this.startTime) / 1e3;
			this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
			this.log(),
			(this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
		}
	}
	(t, e)
}
