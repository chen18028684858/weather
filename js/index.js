$(function(){
    let currentIndex = 0;
    //逐日逐时切换
    $('.weather_nav > div .nav_li').on("click",function(){
        // console.log($(this));
        let index = $(this).index();
        if(currentIndex == index){
            return;
        }
        let fontSize = parseFloat($('html').css('font-size'))
        let move = $(this).width()/fontSize + 0.52;
        $(".moveSpan").animate({
            left:(index*move+0.31) + 'rem'
        },300)
        currentIndex = index; 
        
        $('.weather_more ul').eq(index).css("display","block");
        $('.weather_more ul').eq(index).siblings().css("display","none");
              
    })

    //搜索
    $('.search_icon').on('click', function () {
        //获取输入的城市
        let city = $('.search_ipt').val();
        getWeatherByCity(city);
    })

    setBackground();

    //根据不同时间段设置不同背景
    function setBackground() {
        //获取时间
        let time = new Date().getHours();

        let $weatherBox = $('.weather_box');

        let t = '';
        
        if (time >= 6 && time < 12) {
        //添加morning
        t = 'morning';
        } else if (time >= 12 && time < 19) {
        //添加day
        t = 'day';
        } else {
        //添加night
        t = 'night';
        }
        console.log(t);
        $weatherBox.addClass(t);
    }

    //获取定位信息
    function locationIP(){
        $.ajax({
            url:'https://apis.map.qq.com/ws/location/v1/ip',
            type:'get',
            data:{
                key:'GVOBZ-2F2WU-APTVQ-BWKV4-L7LS5-ZVFF7',
                output:'jsonp'
            },
            dataType:'jsonp',
            success:function (result){
                console.log('result==>',result);
                getWeatherByCity(result.result.ad_info.city);
                $('.location_text').text(result.result.ad_info.city);
            },
            error:function (err){
                console.log('err==>',err);
            }
        })
    }

    //获取天气信息
    function getWeatherByCity(city){
        $.ajax({
            type:'get',
            url:'https://api.heweather.net/s6/weather',
            data:{
                location:city,
                key:'28eaedf44a12460386e66f0af1e00337',
            },
            success:function (result){
                console.log('实况天气：result ==>',result);

                //城市不存在
                if (result.HeWeather6[0].status == 'unknown location') {
                    console.log('不存在该城市天气');
                    return;
                }
        
                $('.location_text').text(city);
                $('.search_ipt').val('');
        

                let weather = result.HeWeather6[0];
                $('.w').each(function(){
                    let id = $(this).attr('id');
                    $(this).text(weather.now[id]);
                })

                // 设置最低温度和最高温度
                let minTmp = weather.daily_forecast[0].tmp_min;
                let maxTmp = weather.daily_forecast[0].tmp_max;
                let tmpRange = minTmp+'℃～'+maxTmp;
                $('#tmp_range').text(tmpRange);

                //获取分钟级降水
                getPcpn(weather.basic.lon, weather.basic.lat);

                //获取逐日预报
                let dailyForecast = weather.daily_forecast;
                //日期
                for(let i=0 ; i<dailyForecast.length ; i++){
                    let dataObj = dailyForecast[i].date;
                    let date = dataObj.substr(5);
                    $('.day .d').eq(i).text(date);
                    //天气
                    let condObj = dailyForecast[i].cond_txt_d;
                    $('.day .co').eq(i).text(condObj);
                    //最高最低温度
                    let tmpObjMax = dailyForecast[i].tmp_max;
                    let tmpObjMin = dailyForecast[i].tmp_min;
                    let dayTmp = tmpObjMin+'°～'+tmpObjMax+'°';
                    $('.day_tmp').eq(i).text(dayTmp);
                    //天气图标
                    let iconsDaily = dailyForecast[i].cond_code_d;
                        $('.day .weather_more_icon').eq(i).css({
                            background:`url("./images/${iconsDaily}.png") no-repeat center center `,
                            width: '0.15rem',
                            height: '0.15rem',
                            backgroundSize: 'cover',
                        })
                    }
                //天气
                // for(let j=0 ; j<dailyForecast.length ; j++){
                //     let condObj = dailyForecast[j].cond_txt_d;
                //     $('.day .co').eq(j).text(condObj)
                // }
                //最高最低温度
                // for(let k=0 ; k<dailyForecast.length ; k++){
                //     let tmpObjMax = dailyForecast[k].tmp_max;
                //     let tmpObjMin = dailyForecast[k].tmp_min;
                //     let dayTmp = tmpObjMin+'°～'+tmpObjMax+'°';
                //     $('.day_tmp').eq(k).text(dayTmp);
                // }
                //天气图标
                // for(){}

                //获取逐时预报
                let hourly = weather.hourly;
                //小时
                for(let l=0 ; l<hourly.length ; l++){
                    let hourObj = hourly[l].time;
                    let hour = hourObj.substr(11);
                    $('.hour .h').eq(l).text(hour);
                    //温度
                    let hourTmpObj = hourly[l].tmp;
                    $('.hour_tmp').eq(l).text(hourTmpObj);
                    //天气
                    let hourCondObj = hourly[l].cond_txt;
                    $('.hour .co').eq(l).text(hourCondObj);
                    //小图标
                    let iconsHourly = hourly[l].cond_code;
                    $('.hour .weather_more_icon').eq(l).css({
                        background:`url("./images/${iconsHourly}.png") no-repeat center center`,
                        width: '0.15rem',
                        height: '0.15rem',
                        backgroundSize: 'cover',
                    })
                }
                //温度
                // for(let m=0 ; m<hourly.length ; m++){
                //     let hourTmpObj = hourly[m].tmp;
                //     $('.hour_tmp').eq(m).text(hourTmpObj);
                // }
                //天气
                // for(let n=0 ; n<hourly.length ; n++){
                //     let hourCondObj = hourly[n].cond_txt;
                //     $('.hour .co').eq(n).text(hourCondObj)
                // }
            },
            error:function (err){
                console.log('err ==>',err);
            }
        })
    }

    // 获取降水信息
    function getPcpn(lon,lat){
        $.ajax({
            type:'get',
            url:'https://api.heweather.net/s6/weather/grid-minute',
            data:{
                key:'28eaedf44a12460386e66f0af1e00337',
                location:lon+','+lat
            },
            success:function(result){
                console.log('result==>',result);
                $('.weather_message').text(result.HeWeather6[0].grid_minute_forecast.txt);
            },
            error:function(err){
                console.log('err==>',err);
            }
        })

    }

   
    
    

    locationIP();

})