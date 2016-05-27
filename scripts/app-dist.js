
;$(document).ready(function(){$("#StudentCount").keypress(function(e){"13"==e.keyCode&&e.preventDefault()})});var app=angular.module("IC",["firebase","ngAnimate","ngRoute","angular-loading-bar","hue"]),config={apiKey:"AIzaSyBpdRvCW0oJH5ukKNWBZp3jipGVg8w0wyE",authDomain:"interactiveclassroom.firebaseapp.com",databaseURL:"https://interactiveclassroom.firebaseio.com",storageBucket:"project-3354574417935505015.appspot.com"};firebase.initializeApp(config),app.factory("fbRef",[function(){var ref=firebase.database().ref();return ref}]),app.factory("Auth",["$firebaseAuth","fbRef",function($firebaseAuth,fbRef){return $firebaseAuth(fbRef)}]),app.directive("myEnter",function(){return function(scope,element,attrs){element.bind("keydown keypress",function(event){13===event.which&&(scope.$apply(function(){scope.$eval(attrs.myEnter)}),event.preventDefault())})}});
angular.module("IC").run(["$rootScope","$location",function($rootScope,$location){$rootScope.$on("$routeChangeError",function(event,next,previous,error){"AUTH_REQUIRED"===error&&$location.path("/")})}]),angular.module("IC").config(["$routeProvider",function($routeProvider){$routeProvider.when("/class:classid",{controller:"Student",templateUrl:"student.html",resolve:{currentAuth:["Auth",function(Auth){return Auth.$requireAuth()}]}}).when("/dashboard:classid",{controller:"Teacher",templateUrl:"teacher.html",resolve:{currentAuth:["Auth",function(Auth){return Auth.$requireAuth()}]}}).when("/",{templateUrl:"home.html",controller:"Home"}).when("/:action",{templateUrl:"home.html",controller:"Home"}).otherwise({redirectTo:"/"})}]);
angular.module("IC").controller("Home",["$scope","$firebaseObject","$firebaseArray","$timeout","$location","$rootScope","$routeParams","cfpLoadingBar","fbRef",function($scope,$firebaseObject,$firebaseArray,$timeout,$location,$rootScope,$routeParams,cfpLoadingBar,fbRef){var root=fbRef;if(void 0!=$routeParams.action){var action=$routeParams.action.substring(1);switch(action){case"logout":$rootScope.$broadcast("logout")}}$scope.btngrpclass="",$scope.invitecode="",$scope.labeltext="",$scope.addingClass=!1,$scope.joinBtn=!1,$scope.cancel=function(){$scope.btngrpclass="",$scope.invitecode="",$scope.addingClass=!1,$scope.joinBtn=!1},$scope.userData={},cfpLoadingBar.start(),$scope.$on("userGuid",function(event,guid){void 0==guid||null==guid?($scope.userData={},$scope.cancel(),cfpLoadingBar.complete()):($scope.userData=$firebaseObject(root.child("Users").child(guid)),$scope.userData.$loaded(function(){$scope.joinBtn?($scope.btngrpclass="homebtngrp--loggedin",$scope.invitecode="Welcome "+$scope.userData.name.split(" ")[0]+"!",$timeout(function(){$scope.invitecode="",$scope.labeltext=$scope.labelText(),$scope.btngrpclass="homebtngrp--invitecode",setTimeout(function(){$(".homebtngrp-left-input").focus()},500)},2e3)):$scope.cancel(),cfpLoadingBar.complete()}))}),$rootScope.$broadcast("userGuidReq"),$scope.classroom=function(addnew){$scope.addingClass=addnew,void 0==$scope.userData.uid?($scope.btngrpclass="homebtngrp--login",$scope.joinBtn=!0,$rootScope.$broadcast("login")):($scope.labeltext=$scope.labelText(),$scope.btngrpclass="homebtngrp--invitecode",setTimeout(function(){$(".homebtngrp-left-input").focus()},500))},$scope.labelText=function(){return $scope.addingClass?"Name your new class.":"Please enter your invite code."},$scope.secondary=function(){switch($scope.btngrpclass){case"homebtngrp--login":$rootScope.$broadcast("login");break;case"homebtngrp--loggedin":break;case"homebtngrp--invitecode":$scope.addingClass?$scope.createClass():$scope.joinClass();break;default:$scope.classroom(!0)}},$scope.createClass=function(){var classes=$firebaseArray(root.child("Classes"));classes.$add({Pub:{CurrentLesson:null,CurrentTopic:null,Name:$scope.invitecode,Teacher:$scope.userData.uid},Lessons:null}).then(function(newRef){void 0==$scope.userData.Teaches[newRef.key()]&&null!=$scope.userData.Teaches[newRef.key()]&&($scope.userData.Teaches[newRef.key()]=Date(),$scope.userData.$save()),$location.path("/dashboard:"+newRef.key())})},$scope.joinClass=function(){if(""!=$scope.invitecode&&$scope.invitecode.length>3){var joiner=$firebaseObject(root.child("Joiners").child($scope.invitecode));joiner.$loaded(function(){null!=joiner&&void 0!=joiner&&(void 0==$scope.userData.Partakes&&($scope.userData.Partakes={}),void 0==$scope.userData.Partakes[joiner.Class]&&($scope.userData.Partakes[joiner.Class]=Date(),$scope.userData.$save()),void 0!=$scope.userData.Teaches&&void 0!=$scope.userData.Teaches[joiner.Class]?$location.path("/dashboard:"+joiner.Class):$location.path("/class:"+joiner.Class))})}}}]);
angular.module("IC").controller("Student",["$scope","$firebaseObject","$firebaseArray","$routeParams","$interval","$rootScope","cfpLoadingBar",function($scope,$firebaseObject,$firebaseArray,$routeParams,$interval,$rootScope,cfpLoadingBar){var root=new Firebase("https://interactiveclassroom.firebaseio.com");$scope.classid=$routeParams.classid.substring(1),$scope.classInfo=$firebaseObject(root.child("Classes").child($scope.classid).child("/Pub")),$scope.currentAnswer={};var heartbeatIntervalPromise={};cfpLoadingBar.start(),$scope.$on("userGuid",function(event,guid){void 0==guid||null==guid?$scope.userData={}:$scope.classInfo.$loaded(function(){var lessonRef=root.child("Classes").child($scope.classid).child("Lessons").child($scope.classInfo.CurrentLesson);$scope.userData=$firebaseObject(root.child("Users").child(guid)),$scope.userData.$loaded(function(){$scope.myHeartbeat=$firebaseObject(lessonRef.child("Students").child($scope.userData.uid)),$scope.myHeartbeat.$value=Date(),$scope.myHeartbeat.$save(),heartbeatIntervalPromise=$interval(function(){$scope.myHeartbeat.$value=Date(),$scope.myHeartbeat.$save()},3e4),$scope.currentAnswer=$firebaseObject(lessonRef.child("Topics").child($scope.classInfo.CurrentTopic).child("Answers").child($scope.userData.uid)),cfpLoadingBar.complete()})})}),$rootScope.$broadcast("userGuidReq"),$scope.$on("$destroy",function(){$interval.cancel(heartbeatIntervalPromise)}),$scope.answer=function(answer){$scope.currentAnswer.Answer=answer,$scope.currentAnswer.Date=Date(),$scope.currentAnswer.$save()}}]);
angular.module("IC").controller("Teacher",["$scope","$firebaseObject","$firebaseArray","$routeParams","$rootScope","hue",function($scope,$firebaseObject,$firebaseArray,$routeParams,$rootScope,hue){var root=new Firebase("https://interactiveclassroom.firebaseio.com");$scope.classid=$routeParams.classid.substring(1);var myHue=hue;myHue.setup({username:"datuserdoe",bridgeIP:"172.16.10.76",debug:!0});var username=myHue.createUser({devicetype:"interactiveclassroom#amdevice"});console.log(username),myHue.getLights().then(function(lights){$scope.lights=lights,myHue.setLightState(1,{on:!0}).then(function(response){$scope.lights[1].state.on=!1,console.log("API response: ",response)})}),$rootScope.$broadcast("userGuidReq"),$scope.$on("userGuid",function(event,guid){void 0==guid||null==guid?$scope.userData={}:$scope.userData=$firebaseObject(root.child("Users").child(guid))});var classRef=new Firebase("https://interactiveclassroom.firebaseio.com/Classes/"+$scope.classid),classInfoRef=classRef.child("/Pub");$scope.classInfo=$firebaseObject(classInfoRef);var lampsRef=new Firebase("https://huehue.firebaseio.com/Hue/Lamps");$scope.Lamps=$firebaseObject(lampsRef),$scope.Lamps.$loaded(function(){}),$scope.Lesson={},$scope.Topic={},$scope.$watch("classInfo",function(newVal,oldVal){void 0!=newVal.CurrentLesson&&newVal.CurrentLesson!=oldVal.CurrentLesson&&($scope.Lesson=$firebaseObject(classInfoRef.child("Lessons").child(newVal.CurrentLesson))),void 0!=newVal.CurrentTopic&&newVal.CurrentTopic!=oldVal.CurrentTopic&&($scope.Lesson=$firebaseObject(classInfoRef.child("Lessons").child(newVal.CurrentLesson).child("Topics").child(newVal.CurrentTopic)))}),$scope.pluralsAreGoodIGuess=function(numb){return numb>1?"s":void 0},$scope.$watch("lampSel",function(newVal){console.log(newVal),angular.forEach($scope.Lamps,function(lamp,key){newVal==lamp&&($scope.Settings.Lamp=key,$scope.Settings.$save())})}),$scope.createNewLesson=function(){var newLessonRef=new Firebase($scope.fbRefClass+"/Lessons"),theNewLesson=({Date:Date(),Students:null},newLessonRef.push(les)),newSessionRef=new Firebase(theNewLesson.toString()+"/Sessions"),sesh={Date:Date(),StudentCount:$scope.stuCount,TrueCount:0,FalseCount:0},theNewSession=newSessionRef.push(sesh);$scope.Settings.CurrentLesson=theNewLesson.key(),$scope.Settings.CurrentSession=theNewSession.key(),$scope.Settings.$save()},$scope.createNewSession=function(){var newSessionRef=new Firebase($scope.fbRefClass+"/Lessons/"+$scope.Settings.CurrentLesson+"/Sessions"),sesh={Date:Date(),StudentCount:$scope.stuCount,TrueCount:0,FalseCount:0},theNewSession=newSessionRef.push(sesh);$scope.Settings.CurrentSession=theNewSession.key(),$scope.Settings.$save()},$scope.finishLesson=function(){$scope.Settings.CurrentSession="",$scope.Settings.CurrentLesson="",$scope.Settings.$save(),$scope.CurrentSession={}},$scope.editc=!1,$scope.colors=new Array,$scope.avalicolors=["Violet","RoyalBlue","LightSkyBlue","Aqua","AquaMarine","Green","LimeGreen","Yellow","Goldenrod","Orange","Red","Pink","Fuchsia","Orchid","Lavender"],$scope.colors.push({perc:"0%"}),$scope.colors.push({color:"Violet",perc:"40%"}),$scope.colors.push({color:"RoyalBlue",perc:"50%"}),$scope.colors.push({color:"LightSkyBlue",perc:"70%"}),$scope.colors.push({color:"AquaMarine",perc:"100%"}),$scope.colorPercDiff=function(color){var indx=$scope.colors.indexOf(color)-1,st=parseInt($scope.colors[indx].perc.substring(0,color.perc.length-1)),en=parseInt(color.perc.substring(0,color.perc.length-1));return en-st+"%"},$scope.findColor=function(perc){var ret="bgc-gray",lastperc=0;return angular.forEach($scope.colors,function(col){var en=parseInt(col.perc.substring(0,col.perc.length-1));perc>=lastperc&&en>perc&&(ret="bglc-"+col.color),lastperc=en}),ret}}]);
angular.module("IC").controller("Nav",["$scope","$firebaseObject","$firebaseArray","Auth","$timeout","$location","$rootScope","fbRef",function($scope,$firebaseObject,$firebaseArray,Auth,$timeout,$location,$rootScope,fbRef){var root=fbRef;$rootScope.userData={},Auth.$onAuthStateChanged(function(authData){null!=authData?(console.log(authData),$rootScope.userData=$firebaseObject(root.child("Users").child(authData.uid)),$rootScope.userData.$loaded(function(){$rootScope.userData.uid=authData.uid,$rootScope.userData.email=authData.google.email,$rootScope.userData.name=authData.google.displayName,$rootScope.userData.profileImageURL=authData.google.profileImageURL,$rootScope.userData.LastLogin=Date(),$rootScope.userData.$save().then(function(){$rootScope.$broadcast("userGuid",$rootScope.userData.uid)})})):($rootScope.userData={},$rootScope.$broadcast("userGuid",void 0))}),$scope.$on("userGuidReq",function(){$rootScope.$broadcast("userGuid",$rootScope.userData.uid)}),$scope.$watch("userData.uid",function(n){void 0==n&&Auth.$getAuth(),console.log("watchauth: "+n)}),$scope.$on("login",function(){Auth.$authWithOAuthPopup("google",{scope:"email"}).then(function(){})["catch"](function(error){"TRANSPORT_UNAVAILABLE"===error.code?Auth.$authWithOAuthRedirect(authMethod).then(function(){}):$rootScope.$broadcast("userGuidHome",null)})}),$scope.$on("logout",function(){Auth.$unauth(),$location.path("/")}),$scope.nav=!1,$scope.showNav=function(){return void 0==$rootScope.userData.uid?!1:!0},$scope.navitemsdef=new Array({icon:"replay",link:"#/",fb:{Name:"Home"}},{icon:"highlight_off",link:"#/:logout",fb:{Name:"Log off"}}),$scope.navitems=new Array,$scope.navitemspartakes=new Array,$scope.navitemsteaches=new Array,$scope.itemsUpdate=function(){var arrayOfArrays=[$scope.navitemspartakes,$scope.navitemsteaches,$scope.navitemsdef];$scope.navitems=[],angular.forEach(arrayOfArrays,function(array){angular.forEach(array,function(item){$scope.navitems.push(item)})}),$scope.nav&&($scope.items=$scope.navitems)},$scope.$watch("userData.Partakes",function(newVal){$scope.navitemspartakes=new Array,void 0!=newVal&&null!=newVal?angular.forEach(newVal,function(partake,key){var theClass=$firebaseObject(root.child("Classes").child(key).child("Pub"));theClass.$loaded(function(){var active=!1;""!=theClass.CurrentLesson&&(active=!0),$scope.navitemspartakes.push({icon:"face",link:"#/class:"+key,active:active,fb:theClass}),$scope.itemsUpdate()})}):$scope.itemsUpdate()}),$scope.$watch("userData.Teaches",function(newVal){$scope.navitemsteaches=new Array,void 0!=newVal&&null!=newVal?angular.forEach(newVal,function(teach,key){var theClass=$firebaseObject(root.child("Classes").child(key).child("Pub"));theClass.$loaded(function(){var active=!1;""!=theClass.CurrentLesson&&(active=!0),$scope.navitemsteaches.push({icon:"stars",link:"#/dashboard:"+key,active:active,fb:theClass}),$scope.itemsUpdate()})}):$scope.itemsUpdate()}),$scope.toggle=function(){$scope.items=new Array,$scope.nav||($scope.items=$scope.navitems),$scope.nav=!$scope.nav}}]);
"use strict";angular.module("hue",[]).service("hue",["$http","$q","$log",function($http,$q,$log){var buildApiUrl,config,getBridgeNupnp,isReady,_apiCall,_buildUrl,_del,_get,_post,_put,_responseHandler,_setup;config={username:"",apiUrl:"",bridgeIP:""},isReady=!1,_setup=function(){var deferred;return deferred=$q.defer(),isReady?(deferred.resolve(),deferred.promise):""===config.username?($log.error("Error in setup: Username has to be set"),deferred.reject,deferred.promise):""!==config.apiUrl?(isReady=!0,deferred.resolve(),deferred.promise):(""!==config.bridgeIP?(config.apiUrl=buildApiUrl(),isReady=!0,deferred.resolve()):getBridgeNupnp().then(function(data){return null!=data[0]?(config.bridgeIP=data[0].internalipaddress,config.apiUrl=buildApiUrl(),isReady=!0,deferred.resolve()):($log.error("Error in setup: Returned data from nupnp is empty. Is there a hue bridge present in this network?"),deferred.reject)},function(error){return $log.error("Error in setup: "+error),deferred.reject}),deferred.promise)},_put=function(name,url,data){var deferred;return deferred=$q.defer(),$http.put(url,data).success(function(response){return _responseHandler(name,response,deferred)}).error(function(response){return $log.error("Error: "+name,response),deferred.reject}),deferred.promise},_post=function(name,url,data){var deferred;return deferred=$q.defer(),$http.post(url,data).success(function(response){return _responseHandler(name,response,deferred)}).error(function(response){return $log.error("Error: "+name,response),deferred.reject}),deferred.promise},_del=function(name,url){var deferred;return deferred=$q.defer(),$http["delete"](url).success(function(response){return _responseHandler(name,response,deferred)}).error(function(response){return $log.error("Error: "+name,response),deferred.reject}),deferred.promise},_get=function(name,url){var deferred;return deferred=$q.defer(),$http.get(url).success(function(response){return _responseHandler(name,response,deferred)}).error(function(response){return $log.error(""+name,response),deferred.reject}),deferred.promise},_responseHandler=function(name,response,deferred){return null!=response[0]&&response[0].error?($log.error(""+name,response),deferred.reject):($log.debug("Response of "+name+":",response),deferred.resolve(response))},_buildUrl=function(urlParts){var part,url,_i,_len;for(null==urlParts&&(urlParts=[]),url=config.apiUrl,_i=0,_len=urlParts.length;_len>_i;_i++)part=urlParts[_i],url+="/"+part;return url},_apiCall=function(method,path,params){var name,url;switch(null==path&&(path=[]),null==params&&(params=null),name=method+path.join("/"),url=_buildUrl(path),method){case"get":return _get(name,url);case"post":return _post(name,url,params);case"put":return _put(name,url,params);case"delete":return _del(name,url);default:return $log.error("unsupported method "+method)}},getBridgeNupnp=function(){return _get("getBridgeNupnp","https://www.meethue.com/api/nupnp")},buildApiUrl=function(){return"http://"+config.bridgeIP+"/api/"+config.username},this.getBridgeIP=function(){return _setup().then(function(){return config.bridgeIP})},this.setup=function(newconfig){return null==newconfig&&(newconfig={}),angular.extend(config,newconfig)},this.getLights=function(){return _setup().then(function(){return _apiCall("get",["lights"])})},this.getNewLights=function(){return _setup().then(function(){return _apiCall("get",["lights","new"])})},this.searchNewLights=function(){return _setup().then(function(){return _apiCall("post",["lights"],{})})},this.getLight=function(id){return _setup().then(function(){return _apiCall("get",["lights",id])})},this.setLightName=function(id,name){return _setup().then(function(){return _apiCall("put",["lights",id],{name:name})})},this.setLightState=function(id,state){return _setup().then(function(){return _apiCall("put",["lights",id,"state"],state)})},this.getConfiguration=function(){return _setup().then(function(){return _apiCall("get",["config"])})},this.setConfiguration=function(configuration){return _setup().then(function(){return _apiCall("put",["config"],configuration)})},this.createUser=function(devicetype,username){return null==username&&(username=!1),_setup().then(function(){var user;return user={devicetype:devicetype},username&&(user.username=username),_apiCall("post",["api"],user)})},this.deleteUser=function(username){return _setup().then(function(){return _apiCall("delete",["config","whitelist",username])})},this.getFullState=function(){return _setup().then(function(){return _apiCall("get")})},this.getGroups=function(){return _setup().then(function(){return _apiCall("get",["groups"])})},this.createGroup=function(name,lights){return _setup().then(function(){var body;return body={lights:lights,name:name},$log.debug("Debug: createGroup body",body),_apiCall("post",["groups"],body)})},this.getGroupAttributes=function(id){return _setup().then(function(){return _apiCall("get",["groups",id])})},this.setGroupAttributes=function(id,name,lights){return _setup().then(function(){var body;return body={lights:lights,name:name},_apiCall("put",["groups",id],body)})},this.setGroupState=function(id,state){return _setup().then(function(){return _apiCall("put",["groups",id,"action"],state)})},this.deleteGroup=function(id){return _setup().then(function(){return _apiCall("delete",["groups",id])})},this.getRules=function(){return _setup().then(function(){return _apiCall("get",["rules"])})},this.getRule=function(id){return _setup().then(function(){return _apiCall("get",["rules",id])})},this.createRule=function(name,conditions,actions){return _setup().then(function(){var body;return body={name:name,conditions:conditions,actions:actions},_apiCall("post",["rules"],body)})},this.updateRule=function(id,name,conditions,actions){return null==name&&(name=!1),null==conditions&&(conditions=!1),null==actions&&(actions=!1),_setup().then(function(){var body;return body={},name&&(body.name=name),conditions&&(body.conditions=conditions),actions&&(body.actions=actions),$log.debug("Debug: updateRule body",body),_apiCall("put",["rules"],body)})},this.deleteRule=function(id){return _setup().then(function(){return _apiCall("delete",["rules",id])})},this.getSchedules=function(){return _setup().then(function(){return _apiCall("get",["schedules"])})},this.createSchedule=function(name,description,command,time,status,autodelete){return null==name&&(name="schedule"),null==description&&(description=""),null==status&&(status="enabled"),null==autodelete&&(autodelete=!1),_setup().then(function(){var body;return body={name:name,description:description,command:command,time:time,status:status,autodelete:autodelete},_apiCall("post",["schedules"],body)})},this.getScheduleAttributes=function(id){return _setup().then(function(){return _apiCall("get",["schedules",id])})},this.setScheduleAttributes=function(id,name,description,command,time,status,autodelete){return null==name&&(name=null),null==description&&(description=null),null==command&&(command=null),null==time&&(time=null),null==status&&(status=null),null==autodelete&&(autodelete=null),_setup().then(function(){var body;return body={},name&&(body.name=name),description&&(body.description=description),command&&(body.command=command),status&&(body.status=status),null!==autodelete&&(body.autodelete=autodelete),_apiCall("put",["schedules",id],body)})},this.deleteSchedule=function(id){return _setup().then(function(){return _apiCall("delete",["schedules",id])})},this.getScenes=function(){return _setup().then(function(){return _apiCall("get",["scenes"])})},this.createScene=function(id,name,lights){return _setup().then(function(){var body;return body={name:name,lights:lights},_apiCall("put",["scenes",id],body)})},this.updateScene=function(id,light,state){return _setup().then(function(){return _apiCall("put",["scenes",id,"lights",light,"state"],state)})},this.getSensors=function(){return _setup().then(function(){return _apiCall("get",["sensors"])})},this.createSensor=function(name,modelid,swversion,type,uniqueid,manufacturername,state,config){return null==state&&(state=null),null==config&&(config=null),_setup().then(function(){var body;return body={name:name,modelid:modelid,swversion:swversion,type:type,uniqueid:uniqueid,manufacturername:manufacturername},state&&(body.state=state),config&&(body.config=config),_apiCall("post",["sensors"],body)})},this.searchNewSensors=function(){return _setup().then(function(){return _apiCall("post",["sensors"],null)})},this.getNewSensors=function(){return _setup().then(function(){return _apiCall("get",["sensors","new"])})},this.getSensor=function(id){return _setup().then(function(){return _apiCall("get",["sensors",id])})},this.renameSensor=function(id,name){return _setup().then(function(){var body;return body={name:name},_apiCall("put",["sensors",id],body)})},this.updateSensor=function(id,config){return _setup().then(function(){return _apiCall("put",["sensors",id,"config"],config)})},this.setSensorState=function(id,state){return _setup().then(function(){return _apiCall("put",["sensors",id,"state"],state)})},this.getTimezones=function(){return _setup().then(function(){return _apiCall("get",["info","timezones"])})},this.setEffect=function(_this){return function(id,effect){return null==effect&&(effect="none"),_this.setLightState(id,{effect:effect})}}(this),this.setAlert=function(_this){return function(id,alert){return null==alert&&(alert="none"),_this.setLightState(id,{alert:alert})}}(this),this.setBrightness=function(_this){return function(id,brightness){return _this.setLightState(id,{bri:brightness})}}(this)}]);
