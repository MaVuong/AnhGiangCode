var CCPlayer=require('./CCLIB/CCPlayer');
var CCVector=require('./CCLIB/CCVector');
var CCBullet=require('./CCLIB/CCBullet');
var CCCode=require('./CCLIB/CCCode');
var CCRoom=require('./CCLIB/CCRoom');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http,{'pingInterval': 2000, 'pingTimeout': 5000});
app.use(express.static(__dirname + '/DataGame'));

http.listen(2020, function(){
	console.log('listening on : 2020');
});

var thutuWaiting=0;
var List_CODE={};
var ListWAITTING_STOCKET={};

var LIST_SOCKET={};

var room_name_cout=0;
var LISTROOM={};

var adminID=0;
var AMINDCONNECT={};

io.on('connection', function(socket_client){
	thutuWaiting=thutuWaiting+1;
	if (thutuWaiting>99999999) {
		thutuWaiting=1;
	}
	var strindex=""+thutuWaiting;
	socket_client.waitID=strindex;
	socket_client.validatetime=6;
	socket_client.loaded=false;
	ListWAITTING_STOCKET[strindex]=socket_client;

	socket_client.on('tathetcacketnoi',function(data_client){
		if (socket_client.waitID=="XXX") {
			var admjson=JSON.parse(data_client);
			console.log("data_client:"+data_client);
			if (admjson.fnsend=="thoathetclient") {
				var msg=admjson.msgsend;
				for (var skname in LIST_SOCKET) {
					var skClinet=LIST_SOCKET[skname];
					skClinet.emit('ServerCloseMaintain',msg);
				}
				for (var skname in LIST_SOCKET) {
					var skClinet=LIST_SOCKET[skname];
					skClinet.disconnect();
				}
				LIST_SOCKET=[];
			}
		}
	});

	socket_client.on('MyInfo',function(data_client){
		var c_inf0=JSON.parse(data_client);
		if (c_inf0.platform===9) {
			var codeend=new CCCode();
			codeend.endcodeiOS();
			socket_client.emit('RequestValidate',{key:codeend.key1,id:socket_client.waitID});
			List_CODE[strindex]=codeend.key2;
			socket_client.usrdpl=c_inf0.usr;
		}else{
			if (c_inf0.platform===-1001) {
				if (adminID>100000) {
					adminID=0;
				}
				delete ListWAITTING_STOCKET[socket_client.waitID];

				adminID++;
				socket_client.validatetime=600;
				socket_client.waitID="XXX";
				socket_client.adminID=""+adminID;
				AMINDCONNECT[socket_client.adminID]=socket_client;
				
				//connection view info server, lma 1 app quan ly cai nay luon 
			}else{
				console.log("AAAAAAA:"+data_client);
				socket_client.disconnect();
			}
			
		}
		//console.log("MyInfo:"+c_inf0.usr);
	});

	socket_client.on('MyValidate',function(data_client){
		if (socket_client.loaded) {
			console.log("--------------------> client validate 2 lan lien -------");
			return;
		}
		
		var keycheckindex=socket_client.waitID;
		var keycheck2=List_CODE[keycheckindex];
		if (keycheck2==data_client) {
			delete List_CODE[keycheckindex];
			delete ListWAITTING_STOCKET[keycheckindex];



			LIST_SOCKET[keycheckindex]=socket_client;

			var player_tmpAdd=new CCPlayer(keycheckindex);
			player_tmpAdd.lbdisplay=socket_client.usrdpl;

			var roomname_get=null;
			for(var iname  in LISTROOM){
				var currentname=LISTROOM[iname];
				if (currentname.countUser<100) {// user limit =100
					roomname_get=iname;
					break;
				}
			}
			if (roomname_get===null) {
				room_name_cout=room_name_cout+1;
				if (room_name_cout>1000000) {
					room_name_cout=1;
				}
				// khoi tao room va add vao list_room
				roomname_get=""+room_name_cout;
				var newroomx=new CCRoom(roomname_get);
				LISTROOM[newroomx.idNumber]=newroomx;
				newroomx.loadMapAndAI();
				newroomx.AddPlayer(player_tmpAdd);
			}else{
				var getroom=LISTROOM[roomname_get];
				getroom.AddPlayer(player_tmpAdd);
			}

			socket_client.loaded=true;
			player_tmpAdd.roomID=roomname_get;
			socket_client.roomname=roomname_get;
			socket_client.myPlayer=player_tmpAdd;
		}else{
			console.log("co mot ket noi khong hop le:"+socket_client.waitID);
			socket_client.disconnect();

		}
	});



	socket_client.on('changeDir',function(data_client){
		var nbsend=Number(data_client);
		if (nbsend>=1&&nbsend<=4&&socket_client.loaded) {

			socket_client.myPlayer.chuanhoagoc(data_client);
		}
	});
	socket_client.on('fireTarget',function(gunrotated){
		var nbsend=Number(gunrotated);
		if (nbsend>=0&&nbsend<=360&&socket_client.loaded) {
			socket_client.myPlayer.changeRotationGun(gunrotated);

		}
	});


	socket_client.on('disconnect', function () {
		var keycheckindex=socket_client.waitID;
		if (keycheckindex=="XXX") {
			console.log("ket noi kiem soat vua dong ket noi: "+socket_client.adminID);
			delete AMINDCONNECT[socket_client.adminID];
			return;
		}
		
		delete List_CODE[keycheckindex];
		delete ListWAITTING_STOCKET[keycheckindex];
		delete LIST_SOCKET[keycheckindex];
		console.log("socket_client disconnected: id=%s da duoc go bo khoi room name :%s",socket_client.waitID,socket_client.roomname);
		if (typeof(socket_client.roomname)!== 'undefined') {
			var roomdelete=LISTROOM[socket_client.roomname];
			if (typeof(roomdelete)=== 'undefined'){
				console.log("---ERROR CODE--------------loi gi do roi , khong tim thay room :"+socket_client.roomname);
			}else{
				roomdelete.RemovePlayerIfNeed(keycheckindex);
			}			
		}else{
			console.log("client khong phan hoi viec validate key , het timeout "+keycheckindex);
			if (typeof(socket_client.myPlayer)!== 'undefined') {
				console.log("---ERROR CODE---------cho nay vo cung kho hieu -----------"+socket_client.myPlayer);
			}
		}
		

		socket_client.myPlayer=null;
  	});

});



setInterval(function(){
	for(var irname  in LISTROOM){
		var roomtmp=LISTROOM[irname];
		var croomusr=roomtmp.getCountUserSocket();
		if (croomusr==0) {
			delete LISTROOM[irname];
			break;
		}
	}
},5000);



setInterval(function(){
	var arrayDelete=[];
	for(var i  in ListWAITTING_STOCKET){
		var socketObj=ListWAITTING_STOCKET[i];
		socketObj.validatetime=socketObj.validatetime-1;
		if (socketObj.validatetime<0) {
			arrayDelete.push(i);
		}
	}
	var lengthdelete=arrayDelete.length;
	for(var mx=0;mx<lengthdelete;mx++){
		var indexDelte=arrayDelete[mx];
		var socketObj_delete=ListWAITTING_STOCKET[indexDelte]; 
		socketObj_delete.disconnect();
		console.log("het thoi gian nen xoa: "+socketObj_delete.waitID);
	}
	arrayDelete=[];



	var length_admID=0;
	for(var va in AMINDCONNECT){
		length_admID=length_admID+1;
	}
	if (length_admID>0) {
		for(var va in AMINDCONNECT){
			var leng1=0;
			for(var i  in ListWAITTING_STOCKET){
				leng1=leng1+1;
			}
			var leng2=0;
			for(var i  in List_CODE){
				leng2=leng2+1;
			}
			var tmpalluser=0;
			for (var sname in LIST_SOCKET) {
				tmpalluser=tmpalluser+1;
			}

			var c_room=0;
			for (var xcsroom in LISTROOM) {
				c_room=c_room+1;
			}

			var adminsk=AMINDCONNECT[va];
			adminsk.validatetime=adminsk.validatetime-1;
			if (adminsk.validatetime>0) {
				var demuserthat=thutuWaiting-adminID;
				var datainfo={waitingSK:leng1,waitingCode:leng2,countplay:tmpalluser,
							  admcount:length_admID,timeleft:adminsk.validatetime,
							  countroom:c_room,maxplayerID:demuserthat,adminID:adminsk.adminID};
				adminsk.emit('updateInfoAdmin',datainfo);
			}else{
				adminsk.disconnect();
			}
			
		}
	}
	

},1000);



setInterval(function(){
	var timedt=60/1000;
	for(var irname  in LISTROOM){
		var roomtmp=LISTROOM[irname];
		roomtmp.updateFrameStep(timedt);
	}

	for (var sname in LIST_SOCKET) {
		var usr_tmp=LIST_SOCKET[sname];
		var numbersend=usr_tmp.myPlayer.numberID;
//		console.log(usr_tmp.myPlayer.pack_obs.length);
		usr_tmp.emit('UpdatePosition',{
			numberID:numbersend,
			tank:usr_tmp.myPlayer.pack_player,
			obstacbles:usr_tmp.myPlayer.pack_obs,
			bullet:usr_tmp.myPlayer.pack_bullet,
			item:[]
		});
		// var Buf=new Buffer('[{y:292w:263id:1x:294h:174}{y:103w:263id:2x:294h:174}{y:545w:243id:3x:145h:304}{y:191w:243id:4x:678h:304}{y:163w:255id:5x:987h:103}{y:454w:255id:6x:426h:103}{y:570w:391id:7x:543h:105}{y:687w:484id:8x:531h:105}{y:644w:484id:9x:1199h:105}{y:484w:484id:10x:1199h:122}{y:437w:173id:11x:809h:159}{y:714w:161id:12x:860h:159}{y:289w:331id:13x:1225h:136}{y:53w:553id:14x:1340h:79}{y:180w:306id:15x:1658h:136}{y:410w:170id:16x:1591h:270}{y:410w:216id:17x:1879h:275}{y:697w:216id:18x:1636h:275}{y:147w:361id:19x:2078h:242}{y:410w:157id:20x:2179h:265}{y:163w:216id:21x:2470h:275}]');
		// usr_tmp.emit('UpdatePosition',Buf);
	}
},60);













