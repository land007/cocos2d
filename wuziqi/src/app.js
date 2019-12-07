 var getQueryString = function(name){
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null)return  unescape(r[2]); return null;
    };
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    xhrGet:function(url, callback){
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST", url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = xhr.responseText;
                //alert(response);
                callback(response);
            }
        };
        xhr.send();
    },
    map : undefined,
    history : undefined,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;
        var mainscene = ccs.load(res.MainScene_json);
        this.addChild(mainscene.node);
        var scrollView_1 = mainscene.node.getChildByName('ScrollView_1');
        var inner = scrollView_1.getInnerContainer();
        var map_1 =scrollView_1.getChildByName('Map_1');
        var sceneLayer = map_1.getLayer("Layer 0");
        var panel_6 = mainscene.node.getChildByName('Panel_6');
        var image_6 = panel_6.getChildByName('Image_6');
        var text_6 = panel_6.getChildByName('Text_6');
        var button_1 = panel_6.getChildByName('Button_1');
        var button_2 = panel_6.getChildByName('Button_2');
        var button_3 = panel_6.getChildByName('Button_3');
        var panel_7 = mainscene.node.getChildByName('Panel_7');
        var text_8 = panel_7.getChildByName('Text_8');
        var button_4 = panel_7.getChildByName('Button_4');
        var panel_8 = mainscene.node.getChildByName('Panel_8');
        var text_9 = panel_8.getChildByName('Text_9');
        var button_5 = panel_8.getChildByName('Button_5');
        var button_6 = panel_8.getChildByName('Button_6');
        var confirm = function(text,yes,no,yf,nf){
            text_9.setText(text);
            button_5.setTitleText(yes);
            button_6.setTitleText(no);
            panel_8.setVisible(true);
        	button_5.addClickEventListener(function(){
            	panel_8.setVisible(false);
                if(yf !== undefined){
                	yf();
                }
            });
            button_6.addClickEventListener(function(){
            	panel_8.setVisible(false);
                if(nf !== undefined){
                	nf();
                }
            });
        };
        var alert = function(text,yf){
            text_8.setText(text);
            panel_7.setVisible(true);
            button_4.addClickEventListener(function(){
            	panel_7.setVisible(false);
                if(yf !== undefined){
                	yf();
                }
            });
        };
        var history = [];//历史记录
        var undoNum = 0;//悔棋次数
        var createMap = function(){
    		var arr=[];
    		for (var i=0; i<15; i++){
    			arr[i]=[];
    			for (var n=0; n<15; n++){
    				arr[i][n]=0;
    			}
    		}
    		return arr;
    	};
    	var map = createMap();
        var i = 0;//步数
        button_1.addClickEventListener(function(){
            confirm('您确定要认输?','认输','取消',function(){
                socket.send(JSON.stringify([{renshu:1}]));
                
            },function(){});
        });
        button_2.addClickEventListener(function(){
            //alert('map_1.x=' + map_1.x + ' map_1.y=' + map_1.y);
            confirm('您确定要悔棋?','悔棋','取消',function(){
                var p = history.pop();
                if(p !== undefined){
                    map[p.x-1][p.y-1] = 0;
                    //alert((p.x-1)+','+(p.y-1)+'='+map[p.x-1][p.y-1]);
                    map_1.removeChild(p.sprite);
                    i--;
                }
                //var r = history.pop();
                //thimap[r.x][r.y] = 0;
                //map_1.removeChild(r.sprite);
            },function(){});
        });
//        button_3.addClickEventListener(function(){
//        	alert("onClick");
//        });
        button_3.addTouchEventListener(function(sender, type) {
        	var localId;
            var serverId;
			switch (type) {
			case ccui.Widget.TOUCH_BEGAN:
//				alert("TOUCH_BEGAN");
				wx.startRecord();
	    		wx.onVoiceRecordEnd({
	                // 录音时间超过一分钟没有停止的时候会执行 complete 回调
	                complete: function (res) {
	                    localId = res.localId;
	                    //alert(localId);
	                }
	    		});
				break;
//			case ccui.Widget.TOUCH_MOVED:
//				alert("TOUCH_MOVED");
//				break;
			case ccui.Widget.TOUCH_ENDED:
//				alert("TOUCH_ENDED");
				wx.stopRecord({
	                success: function (res) {
	                    localId = res.localId;
	                    //alert(localId);
	                    wx.uploadVoice({
	                        localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
	                        isShowProgressTips: 0, // 默认为1，显示进度提示
	                        success: function (res) {
	                            serverId = res.serverId; // 返回音频的服务器端ID
	                            //alert(serverId);
	                            socket.send(JSON.stringify([{yy:{serverId:serverId}}]));
	                        }
	                    });
	                    wx.translateVoice({
	                       localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
	                        isShowProgressTips: 0, // 默认为1，显示进度提示
	                        success: function (res) {
	                            //alert(res.translateResult); // 语音识别的结果
	                        }
	                    });
	                    
	                }
	            });
				break;
			}
		});
        
        var isWin = function(x,y,my){
    		//这里特殊说明一下，由于上面的得到xy的算法，从而使得正常的二维数组逆时针方向旋转了90度
    		//横方向
    		var arr=[];
    		for(var i=0;i<map.length;i++)
    		{
    			arr.push(map[i][y]);
    		}
    		if(win(arr,my)) return true;
    		//竖方向
    		var arr=map[x];
    		if(win(arr,my)) return true;
    		//撇方向
    		var arr=[];
    		for(i=0;i<map.length;i++)
    		{
    			var temp=map[i][y-(x-i)];
    			if(temp!==undefined)
    			{
    				arr.push(temp);
    			}
    		}
    		if(win(arr,my)) return true;
    		//捺方向
    		var arr=[];
    		for(i=0;i<map.length;i++)
    		{
    			var temp=map[i][y+(x-i)];
    			if(temp!==undefined)
    			{
    				arr.push(temp);
    			}
    		}
    		if(win(arr,my)) return true;
    	};
    	var win = function(arr,my){
    		var n=0;
    		for(var i=0;i<arr.length;i++){
    			if(arr[i]==my){
    				n++;
    				if(n==5) return true;
    			}
    			else{
    				n=0;
    			}
    		}
    		return false;
    	};
        
        var onConnect = function(){
            console.log('onConnect');
            var host = getQueryString('host');
            var time = getQueryString('time');
            //alert(host);
            //alert(time);
            //this.socket.send('hi');
        };
        var onMessage = function (msg) {
            console.log('onMessage:'+msg);
            //alert('onMessage:'+msg);
            var data = JSON.parse(msg);
            for(var d in data){
                var wzq = data[d]['wzq'];
                var yy = data[d]['yy'];
                var xinkai = data[d]['xinkai'];
                var renshu = data[d]['renshu'];
                if(wzq !== undefined) {
                	doPoint({x:wzq.pointX,y:wzq.pointY});
                    //gameScene1._onTouchBegan(wzq.pointX,wzq.pointY);
                } else if(yy !== undefined){
                    wx.downloadVoice({
                        serverId: yy.serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
                        isShowProgressTips: 0, // 默认为1，显示进度提示
                        success: function (res) {
                            var localId = res.localId; // 返回音频的本地ID
                            //alert('某人说话:'+localId);
                            wx.playVoice({
                                localId: localId // 需要播放的音频的本地ID，由stopRecord接口获得
                            });
                            wx.onVoicePlayEnd({
                                success: function (res) {
                                    var localId = res.localId; // 返回音频的本地ID
                                    //alert('某人说完话:'+localId);
                                }
                            });
                        }
                    });
                } else if(xinkai !== undefined) {
                	if (xinkai%2==1){
						alert("恭喜，黑方赢了！",function(){
                        	var p = history.pop()
                            while(p !== undefined){
                                map_1.removeChild(p.sprite);
                                p = history.pop()
                            }
                            history = [];
                            i=0;
                            map = createMap();
                        });
					}else{
						alert("恭喜，白方赢了！",function(){
                        	var p = history.pop()
                            while(p !== undefined){
                                map_1.removeChild(p.sprite);
                                p = history.pop()
                            }
                            history = [];
                            i=0;
                            map = createMap();
                        });
					}
                }  else if(renshu !== undefined) {
                	var p = history.pop()
                    while(p !== undefined){
                        map_1.removeChild(p.sprite);
                        p = history.pop()
                    }
                    history = [];
                    i=0;
                    map = createMap();
                } 
            }
        };
        var doPoint = function(point){
        	console.log(point);
            var area = sceneLayer.getTileAt(point);
//          area.setColor(cc.color(255, 0, 0));
			var piece;
			if(i%2==0){
				map[point.x-1][point.y-1]=1;
				piece = new cc.Sprite.create(res.a_png);
				//scrollView_1.setBackGroundColorVector({x: 1, y: 0});//{x: -0.1736, y: 0.9848}
			}else{
				map[point.x-1][point.y-1]=-1;
				piece = new cc.Sprite.create(res.b_png);
				//scrollView_1.setBackGroundColorVector({x: 0, y: 1});//{x: -0.1736, y: 0.9848}
			}
            if(false)
			if(isWin(point.x-1,point.y-1,map[point.x-1][point.y-1])){
				setTimeout(function(){
					if (map[point.x-1][point.y-1]==1){
						alert("恭喜，黑方赢了！",function(){
                        	var p = history.pop()
                            while(p !== undefined){
                                map_1.removeChild(p.sprite);
                                p = history.pop()
                            }
                            history = [];
                            i=0;
                            map = createMap();
                        });
					}else{
						alert("恭喜，白方赢了！",function(){
                        	var p = history.pop()
                            while(p !== undefined){
                                map_1.removeChild(p.sprite);
                                p = history.pop()
                            }
                            history = [];
                            i=0;
                            map = createMap();
                        });
					}
				}, 300);
			}
			history.push({x:point.x,y:point.y,sprite:piece});
			i++;
	  		var piecex = area.x+area.width/2;
	  		var piecey = area.y+area.height/2;
	  		piece.setAnchorPoint(0.5,0.6);
	  		piece.setPosition(piecex, piecey);
	  		map_1.addChild(piece);
        };
        var onClick = function(eventx, eventy){
//            console.log({eventx: eventx, eventy: eventy, innerx: inner.x, innery: inner.y});
            var point = {x:eventx-inner.x, y:eventy-inner.y};
            point.x = Math.floor((point.x-map_1.x)/(37*map_1.scale));
            point.y = map_1.getMapSize().height - Math.floor((point.y-map_1.y)/(37*map_1.scale))-1;
            if(!(point.x < 1 || point.x > 15 || point.y < 1 || point.y > 15)){
                //alert((point.x-1)+','+(point.y-1)+'='+map[point.x-1][point.y-1]);
            	if(map[point.x-1][point.y-1]==0){
            		socket.send(JSON.stringify([{wzq:{pointX:point.x,pointY:point.y}}]));
                    //doPoint(point);
            	}
            }
        };
        var angle = function angle(start,end){
            var diff_x = end.x - start.x,
                diff_y = end.y - start.y;
            //返回角度
            return 360*Math.atan(diff_y/diff_x)/(2*Math.PI);
        };
        var socket = (window.SocketIO || window.io).connect('http://team.qhkly.com:30352/');
        socket.on('connect', onConnect);
        socket.on('message', onMessage);
        this.xhrGet('/weixin', function(response){
            var json = JSON.parse(response);
            //alert(json);
            wx.config(json);
            wx.ready(function(){
                wx.getNetworkType({
                    success: function (res) {
                        var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
                        //alert(JSON.stringify(networkType));
                        var title = '五子棋，赢冰棍的啦！';
                        var link = 'http://www.qhkly.com/wuziqi-web/';
                        var desc = '小伙伴都来玩吧，我在这里等着你。';
                        var imgUrl = 'http://demo.open.weixin.qq.com/jssdk/images/p2166127561.jpg';
                        if(false)
                            wx.onMenuShareTimeline({
                                title: title, // 分享标题
                                link: link, // 分享链接
                                imgUrl: imgUrl, // 分享图标
                                trigger: function (res) {
                                    //alert('用户点击分享到朋友圈'+JSON.stringify(res));
                                }, success: function () { 
                                    // 用户确认分享后执行的回调函数
                                }, cancel: function () { 
                                    // 用户取消分享后执行的回调函数
                                }
                            });
                        if(false)
                            wx.onMenuShareAppMessage({
                                title: title, // 分享标题
                                desc: desc, // 分享描述
                                link: link, // 分享链接
                                imgUrl: imgUrl, // 分享图标
                                type: 'link', // 分享类型,music、video或link，不填默认为link
                                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                                trigger: function (res) {
                                    //alert('用户点击分享到朋友圈'+JSON.stringify(res));
                                }, success: function () { 
                                    // 用户确认分享后执行的回调函数
                                }, cancel: function () { 
                                    // 用户取消分享后执行的回调函数
                                }
                            });			
                    }
                });
                if(false){
                    wx.getLocation({
                        success: function (res) {
                            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                            var speed = res.speed; // 速度，以米/每秒计
                            var accuracy = res.accuracy; // 位置精度
                            alert(JSON.stringify(res));
                        }
                    });
                }
            });
            wx.error(function(res){
                alert(JSON.stringify(res));
            });
        });

        this.xhrGet('/weixin-info', function(response){
            if(response == ''){
                return;
                    }
            //alert(response);
            var json = JSON.parse(response);
            var openid = json.openid;
            var nickname = json.nickname;
            var headimgurl = json.headimgurl;
            //headimgurl = 'http://wx.qlogo.cn/mmopen/ajNVdqHZLLB02G9XZXkal6Fomkrp109glFPzE0GTyhdgeUsiciaxe0qzz37KEfmRqNEicUAdFuanDnG4J45ayypxw/0';
            //headimgurl = 'http://www.qhkly.com/wuziqi-web/res/HD/a.png';
            //headimgurl = 'http://bae.qhkly.com:30352/mmopen/ajNVdqHZLLB02G9XZXkal6Fomkrp109glFPzE0GTyhdgeUsiciaxe0qzz37KEfmRqNEicUAdFuanDnG4J45ayypxw/0';
            headimgurl = headimgurl.replace('wx.qlogo.cn','www.qhkly.com');
            var logoData = "data:image/png;base64,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";
                //alert(headimgurl);
                //convertImgToBase64(headimgurl, function(data){
                //alert(data);
                //});
            var title = '五子棋，赢冰棍的啦！'+nickname+'请你一起玩。';
            var link = 'http://www.qhkly.com/wuziqi-web/?host='+openid+'&time='+new Date().getTime();
            var desc = '小伙伴都来玩吧，我在这里等着你。';
            var imgUrl = 'http://demo.open.weixin.qq.com/jssdk/images/p2166127561.jpg';
            //alert(title);
            wx.onMenuShareTimeline({
                title: title, // 分享标题
                link: link, // 分享链接
                imgUrl: headimgurl, // 分享图标
                success: function () { 
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () { 
                    // 用户取消分享后执行的回调函数
                }
            });
            wx.onMenuShareAppMessage({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: link, // 分享链接
                imgUrl: headimgurl, // 分享图标
                type: 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                trigger: function (res) {
                    //alert('用户点击分享到朋友圈'+JSON.stringify(res));
                }, success: function () { 
                    // 用户确认分享后执行的回调函数
                }, cancel: function () { 
                    // 用户取消分享后执行的回调函数
                }
            });
            //if(false)
            cc.loader.loadImg(headimgurl, {isCrossOrigin : true}, function(err,img){
                var texture2d = new cc.Texture2D();
                texture2d.initWithElement(img);
                res.crossOrigin = "anonymous";
                texture2d.handleLoadedTexture();
                //var logo  = cc.Sprite.create(texture2d);
                //alert(4);
                //logo.setPosition(300,100);
                //logo.setOpacity(175);
                //logo.setScale(0.1);
                //logo.setAnchorPoint(0.45,0.6);
                //sprite.setBackGroundImage(headimgurl);
                image_6.loadTexture(headimgurl);
                text_6.setText(nickname);
                //sprite.addChild(logo,100);
            });
        });
        //headimgurl = 'http://www.qhkly.com/img/pic1386qj0p.jpg';
        //cc.loader.loadImg(headimgurl, {isCrossOrigin : true}, function(err,img){
        //        var sprite = mainscene.node.getChildByName('Panel_6');
        //        sprite = sprite.getChildByName('Image_6');
        //        sprite.loadTexture(headimgurl);
        //    });
        //var panel_6 = mainscene.node.getChildByName('Panel_6');
        //var text_6 = panel_6.getChildByName('Text_6');
        
//        sprite.setColor(cc.color(255,0,0,255));
//		sprite ColorVector
		//var x = 0;
		//var y = 0;
		//setInterval(function(){
		//	x-=0.001;
		//	y+=0.001;
		//	var vector = {x: x, y: y};
		//	console.log(vector);
		//	node1.setBackGroundColorVector(vector);//{x: -0.1736, y: 0.9848}
		//}, 100);
		//node1.setBackGroundColorVector({x: 0.6428, y: 0.766});
		//node1.setBackGroundColor(cc.color(255,255,255,255),cc.color(0,0,255,255));
//        node.setAnchorPoint(0.5,0.5);
        var time = new Date().getTime();
        if ('touches' in cc.sys.capabilities){
        	cc.eventManager.addListener({
//            	event: cc.EventListener.TOUCH_ONE_BY_ONE,
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            	onTouchBegan:function (touch, event) {
            		alert("onTouchBegan");
            	},
            	onTouchMoved:function (touch, event) {
            		alert("onTouchMoved");
            	},
            	onTouchEnded:function (touch, event) {
            		alert("onTouchEnded");
            	},
            	onTouchCancelled:function (touch, event) {
            		alert("onTouchCancelled");
            	},
                onTouchesBegan: function (touches, event) {
//                	alert("onTouchesBegan");
//                	var log = JSON.stringify(touches)+touches.length;
//                	test_console.innerText=log+'\n'+test_console.innerText;
                },
                onTouchesEnded: function (touches, event) {
//                	var log = JSON.stringify(touches)+touches.length;
//                	test_console.innerText=log+'\n'+test_console.innerText;
                	if(new Date().getTime() - time > 500){
                    	var target = event.getCurrentTarget();
                		var point = target.convertToNodeSpace(touches[0].getLocation());
                		onClick(point.x, point.y);
                	}
                },
                onTouchesMoved: function (touches, event) {
//                	var log = JSON.stringify(touches)+touches.length;
//                	test_console.innerText=log+'\n'+test_console.innerText;
                	time = new Date().getTime();
                	var touch = touches[0];
                	var delta = touch.getDelta();
//                	var node = event.getCurrentTarget().getChildByTag(TAG_TILE_MAP);
                	if (touches.length == 1) {
                		cc.log("move");
                        map_1.x += delta.x;
                        map_1.y += delta.y;
                        if(map_1.x > -20) {
                        	map_1.x = -20;
                        }
                        if(map_1.x < -284) {
                        	map_1.x = -284;
                        }
                        if(map_1.y > 333) {
                        	map_1.y = 333;
                        }
                        if(map_1.y < 84) {
                        	map_1.y = 84;
                        }
                        return;
                	}
                	if (touches.length >= 2 && false) {
                		cc.log("double");
                		var touch1 = touches[1];
                        var delta1 = touch1.getDelta();
                        var point = touch.getLocation();
                        temp = point;
                        var point1 = touch1.getLocation();
                        //缩放
                        var area = (point.x - point1.x);
                        var area1 = (point.x - point1.x + delta.x - delta1.x);
                        map_1.scale = area1/area*map_1.scale;
//                        this.sprite.scale = area1/area*this.sprite.scale;
                          
                        //旋转
                        var degree = angle(point,point1);
                        point.x += delta.x;
                        point1.x += delta1.x;
                        point.y += delta.y;
                        point1.y += delta1.y;
      
                        var degree1 = angle(point,point1);
                        var rota = Math.round(degree-degree1)
//                        node.rotation = rota+node.rotation;
//                        this.sprite.rotation = rota+this.sprite.rotation;
                	}
                },
                onTouchCancelled: function (touches, event) {
                	alert('onTouchCancelled'+touches.length);
                }
            }, scrollView_1);
	    } else if ('mouse' in cc.sys.capabilities){
	    	cc.eventManager.addListener({
	            event: cc.EventListener.MOUSE,
	            onMouseMove: function(event){
	                if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
	//                        var node = event.getCurrentTarget().getChildByTag(TAG_TILE_MAP);
	                    map_1.x += event.getDeltaX();
	                    map_1.y += event.getDeltaY();
	                }
	            },
	            onMouseDown: function(event){
	                if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
	                	var eventx = event.getLocationX();
	                	var eventy = event.getLocationY();
	                	onClick(eventx, eventy);
	                }
	            }
	        }, scrollView_1);
	    }

//        var sceneLayer = sprite1.getLayer("Layer 0");
//        var point = {x:1, y:1};
//        var t = sceneLayer.getTileAt(point);
//        t.setColor(cc.color(255, 0, 0));
        return true;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

