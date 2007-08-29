/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.3.0

NOTE: This file contains a preview release of the YUI library made
available for testing purposes.  It is not recommended that this code
be used in production environments.  You should replace this version
with the 2.3.0 release as soon as it is available.

*/

YAHOO.namespace("tool");YAHOO.tool.TestLogger=function(element,config){YAHOO.tool.TestLogger.superclass.constructor.call(this,element,config);this.init();};YAHOO.lang.extend(YAHOO.tool.TestLogger,YAHOO.widget.LogReader,{footerEnabled:true,newestOnTop:false,formatMsg:function(message){var category=message.category;var text=this.html2Text(message.msg);return"<pre><p><span class=\""+category+"\">"+category.toUpperCase()+"</span> "+text+"</p></pre>";},init:function(){if(YAHOO.tool.TestRunner){this.setTestRunner(YAHOO.tool.TestRunner);}
this.hideSource("global");this.hideSource("LogReader");this.hideCategory("warn");this.hideCategory("window");this.hideCategory("time");this.clearConsole();},clearTestRunner:function(){if(this._runner){this._runner.unsubscribeAll();this._runner=null;}},setTestRunner:function(testRunner){if(this._runner){this.clearTestRunner();}
this._runner=testRunner;testRunner.subscribe(testRunner.TEST_PASS_EVENT,this._handleTestRunnerEvent,this,true);testRunner.subscribe(testRunner.TEST_FAIL_EVENT,this._handleTestRunnerEvent,this,true);testRunner.subscribe(testRunner.TEST_IGNORE_EVENT,this._handleTestRunnerEvent,this,true);testRunner.subscribe(testRunner.BEGIN_EVENT,this._handleTestRunnerEvent,this,true);testRunner.subscribe(testRunner.COMPLETE_EVENT,this._handleTestRunnerEvent,this,true);testRunner.subscribe(testRunner.TEST_SUITE_BEGIN_EVENT,this._handleTestRunnerEvent,this,true);testRunner.subscribe(testRunner.TEST_SUITE_COMPLETE_EVENT,this._handleTestRunnerEvent,this,true);testRunner.subscribe(testRunner.TEST_CASE_BEGIN_EVENT,this._handleTestRunnerEvent,this,true);testRunner.subscribe(testRunner.TEST_CASE_COMPLETE_EVENT,this._handleTestRunnerEvent,this,true);},_handleTestRunnerEvent:function(data){var TestRunner=YAHOO.tool.TestRunner;var message="";var messageType="";switch(data.type){case TestRunner.BEGIN_EVENT:message="Testing began at "+(new Date()).toString()+".";messageType="info";break;case TestRunner.COMPLETE_EVENT:message="Testing completed at "+(new Date()).toString()+".\nPassed:"
+data.results.passed+" Failed:"+data.results.failed+" Total:"+data.results.total;messageType="info";break;case TestRunner.TEST_FAIL_EVENT:message=data.testName+": "+data.error.getMessage();messageType="fail";break;case TestRunner.TEST_IGNORE_EVENT:message=data.testName+": ignored.";messageType="ignore";break;case TestRunner.TEST_PASS_EVENT:message=data.testName+": passed.";messageType="pass";break;case TestRunner.TEST_SUITE_BEGIN_EVENT:message="Test suite \""+data.testSuite.name+"\" started.";messageType="info";break;case TestRunner.TEST_SUITE_COMPLETE_EVENT:message="Test suite \""+data.testSuite.name+"\" completed.\nPassed:"
+data.results.passed+" Failed:"+data.results.failed+" Total:"+data.results.total
messageType="info";break;case TestRunner.TEST_CASE_BEGIN_EVENT:message="Test case \""+data.testCase.name+"\" started.";messageType="info";break;case TestRunner.TEST_CASE_COMPLETE_EVENT:message="Test case \""+data.testCase.name+"\" completed.\nPassed:"
+data.results.passed+" Failed:"+data.results.failed+" Total:"+data.results.total
messageType="info";break;default:message="Unexpected event "+data.type;message="info";}
YAHOO.log(message,messageType,"TestRunner");}});YAHOO.namespace("tool");YAHOO.tool.TestRunner=(function(){function TestRunner(){TestRunner.superclass.constructor.apply(this,arguments);this.items=[];var events=[this.TEST_CASE_BEGIN_EVENT,this.TEST_CASE_COMPLETE_EVENT,this.TEST_SUITE_BEGIN_EVENT,this.TEST_SUITE_COMPLETE_EVENT,this.TEST_PASS_EVENT,this.TEST_FAIL_EVENT,this.TEST_IGNORE_EVENT,this.COMPLETE_EVENT,this.BEGIN_EVENT];for(var i=0;i<events.length;i++){this.createEvent(events[i],{scope:this});}}
YAHOO.lang.extend(TestRunner,YAHOO.util.EventProvider,{TEST_CASE_BEGIN_EVENT:"testcasebegin",TEST_CASE_COMPLETE_EVENT:"testcasecomplete",TEST_SUITE_BEGIN_EVENT:"testsuitebegin",TEST_SUITE_COMPLETE_EVENT:"testsuitecomplete",TEST_PASS_EVENT:"pass",TEST_FAIL_EVENT:"fail",TEST_IGNORE_EVENT:"ignore",COMPLETE_EVENT:"complete",BEGIN_EVENT:"begin",_runTestCase:function(testCase){var results={};this.fireEvent(this.TEST_CASE_BEGIN_EVENT,{testCase:testCase});var tests=[];for(var prop in testCase){if(prop.indexOf("test")===0&&typeof testCase[prop]=="function"){tests.push(prop);}}
var shouldFail=testCase._should.fail||{};var shouldError=testCase._should.error||{};var shouldIgnore=testCase._should.ignore||{};var failCount=0;var passCount=0;var runCount=0;for(var i=0;i<tests.length;i++){if(shouldIgnore[tests[i]]){this.fireEvent(this.TEST_IGNORE_EVENT,{testCase:testCase,testName:tests[i]});continue;}
var failed=false;var error=null;testCase.setUp();try{testCase[tests[i]]();if(shouldFail[tests[i]]){error=new YAHOO.util.ShouldFail();failed=true;}else if(shouldError[tests[i]]){error=new YAHOO.util.ShouldError();failed=true;}}catch(thrown){if(thrown instanceof YAHOO.util.AssertionError){if(!shouldFail[tests[i]]){error=thrown;failed=true;}}else{if(!shouldError[tests[i]]){error=new YAHOO.util.UnexpectedError(thrown);failed=true;}else{if(YAHOO.lang.isString(shouldError[tests[i]])){if(thrown.message!=shouldError[tests[i]]){error=new YAHOO.util.UnexpectedError(thrown);failed=true;}}else if(YAHOO.lang.isObject(shouldError[tests[i]])){if(!(thrown instanceof shouldError[tests[i]].constructor)||thrown.message!=shouldError[tests[i]].message){error=new YAHOO.util.UnexpectedError(thrown);failed=true;}}}}}finally{if(failed){this.fireEvent(this.TEST_FAIL_EVENT,{testCase:testCase,testName:tests[i],error:error});}else{this.fireEvent(this.TEST_PASS_EVENT,{testCase:testCase,testName:tests[i]});}}
testCase.tearDown();results[tests[i]]={result:failed?"fail":"pass",message:error?error.getMessage():"Test passed"};runCount++;failCount+=(failed?1:0);passCount+=(failed?0:1);}
results.total=runCount;results.failed=failCount;results.passed=passCount;this.fireEvent(this.TEST_CASE_COMPLETE_EVENT,{testCase:testCase,results:results});return results;},_runTestSuite:function(testSuite){var results={passed:0,failed:0,total:0};this.fireEvent(this.TEST_SUITE_BEGIN_EVENT,{testSuite:testSuite});for(var i=0;i<testSuite.items.length;i++){var result=null;if(testSuite.items[i]instanceof YAHOO.tool.TestSuite){result=this._runTestSuite(testSuite.items[i]);}else if(testSuite.items[i]instanceof YAHOO.tool.TestCase){result=this._runTestCase(testSuite.items[i]);}
if(result!=null){results.total+=result.total;results.passed+=result.passed;results.failed+=result.failed;results[testSuite.items[i].name]=result;}}
this.fireEvent(this.TEST_SUITE_COMPLETE_EVENT,{testSuite:testSuite,results:results});return results;},_run:function(testObject){if(YAHOO.lang.isObject(testObject)){if(testObject instanceof YAHOO.tool.TestSuite){return this._runTestSuite(testObject);}else if(testObject instanceof YAHOO.tool.TestCase){return this._runTestCase(testObject);}else{throw new TypeError("_run(): Expected either YAHOO.tool.TestCase or YAHOO.tool.TestSuite.");}}},fireEvent:function(type,data){data=data||{};data.type=type;TestRunner.superclass.fireEvent.call(this,type,data);},add:function(testObject){this.items.push(testObject);},clear:function(){while(this.items.length){this.items.pop();}},run:function(testObject){var results=null;this.fireEvent(this.BEGIN_EVENT);if(YAHOO.lang.isObject(testObject)){results=this._run(testObject);}else{results={passed:0,failed:0,total:0};for(var i=0;i<this.items.length;i++){var result=this._run(this.items[i]);results.passed+=result.passed;results.failed+=result.failed;results.total+=result.total;results[this.items[i].name]=result;}}
this.fireEvent(this.COMPLETE_EVENT,{results:results});}});return new TestRunner();})();YAHOO.namespace("tool");YAHOO.tool.TestSuite=function(name){this.name=name||YAHOO.util.Dom.generateId(null,"testSuite");this.items=[];};YAHOO.tool.TestSuite.prototype={add:function(testObject){if(testObject instanceof YAHOO.tool.TestSuite||testObject instanceof YAHOO.tool.TestCase){this.items.push(testObject);}}};YAHOO.namespace("tool");YAHOO.tool.TestCase=function(template){this._should={};for(var prop in template){this[prop]=template[prop];}
if(!YAHOO.lang.isString(this.name)){this.name=YAHOO.util.Dom.generateId(null,"testCase");}};YAHOO.tool.TestCase.prototype={setUp:function(){},tearDown:function(){}};YAHOO.namespace("util");YAHOO.util.Assert={fail:function(message){throw new YAHOO.util.AssertionError(message||"Test force-failed.");},areEqual:function(expected,actual,message){if(expected!=actual){throw new YAHOO.util.ComparisonFailure(message||"Values should be equal.",expected,actual);}},areNotEqual:function(unexpected,actual,message){if(unexpected==actual){throw new YAHOO.util.UnexpectedValue(message||"Values should not be equal.",unexpected);}},areNotSame:function(unexpected,actual,message){if(unexpected===actual){throw new YAHOO.util.UnexpectedValue(message||"Values should not be the same.",unexpected);}},areSame:function(expected,actual,message){if(expected!==actual){throw new YAHOO.util.ComparisonFailure(message||"Values should be the same.",expected,actual);}},isFalse:function(actual,message){if(false!==actual){throw new YAHOO.util.ComparisonFailure(message||"Value should be false.",false,actual);}},isTrue:function(actual,message){if(true!==actual){throw new YAHOO.util.ComparisonFailure(message||"Value should be true.",true,actual);}},isNaN:function(actual,message){if(!isNaN(actual)){throw new YAHOO.util.ComparisonFailure(message||"Value should be NaN.",NaN,actual);}},isNotNaN:function(actual,message){if(isNaN(actual)){throw new YAHOO.util.UnexpectedValue(message||"Values should not be NaN.",NaN);}},isNotNull:function(actual,message){if(YAHOO.lang.isNull(actual)){throw new YAHOO.util.UnexpectedValue(message||"Values should not be null.",null);}},isNotUndefined:function(actual,message){if(YAHOO.lang.isUndefined(actual)){throw new YAHOO.util.UnexpectedValue(message||"Value should not be undefined.",undefined);}},isNull:function(actual,message){if(!YAHOO.lang.isNull(actual)){throw new YAHOO.util.ComparisonFailure(message||"Value should be null.",null,actual);}},isUndefined:function(actual,message){if(!YAHOO.lang.isUndefined(actual)){throw new YAHOO.util.ComparisonFailure(message||"Value should be undefined.",undefined,actual);}},isArray:function(actual,message){if(!YAHOO.lang.isArray(actual)){throw new YAHOO.util.UnexpectedValue(message||"Value should be an array.",actual);}},isBoolean:function(actual,message){if(!YAHOO.lang.isBoolean(actual)){throw new YAHOO.util.UnexpectedValue(message||"Value should be a Boolean.",actual);}},isFunction:function(actual,message){if(!YAHOO.lang.isFunction(actual)){throw new YAHOO.util.UnexpectedValue(message||"Value should be a function.",actual);}},isInstanceOf:function(expected,actual,message){if(!(actual instanceof expected)){throw new YAHOO.util.ComparisonFailure(message||"Value isn't an instance of expected type.",expected,actual);}},isNumber:function(actual,message){if(!YAHOO.lang.isNumber(actual)){throw new YAHOO.util.UnexpectedValue(message||"Value should be a number.",actual);}},isObject:function(actual,message){if(!YAHOO.lang.isObject(actual)){throw new YAHOO.util.UnexpectedValue(message||"Value should be an object.",actual);}},isString:function(actual,message){if(!YAHOO.lang.isString(actual)){throw new YAHOO.util.UnexpectedValue(message||"Value should be a string.",actual);}},isTypeOf:function(expectedType,actualValue,message){if(typeof actualValue!=expectedType){throw new YAHOO.util.ComparisonFailure(message||"Value should be of type "+expected+".",expected,typeof actual);}}};YAHOO.util.AssertionError=function(message){arguments.callee.superclass.constructor.call(this,message);this.message=message;this.name="AssertionError";};YAHOO.lang.extend(YAHOO.util.AssertionError,Error,{getMessage:function(){return this.message;},toString:function(){return this.name+": "+this.getMessage();},valueOf:function(){return this.toString();}});YAHOO.util.ComparisonFailure=function(message,expected,actual){arguments.callee.superclass.constructor.call(this,message);this.expected=expected;this.actual=actual;this.name="ComparisonFailure";};YAHOO.lang.extend(YAHOO.util.ComparisonFailure,YAHOO.util.AssertionError,{getMessage:function(){return this.message+"\nExpected: "+this.expected+" ("+(typeof this.expected)+")"+"\nActual:"+this.actual+" ("+(typeof this.actual)+")";}});YAHOO.util.UnexpectedValue=function(message,unexpected){arguments.callee.superclass.constructor.call(this,message);this.unexpected=unexpected;this.name="UnexpectedValue";};YAHOO.lang.extend(YAHOO.util.UnexpectedValue,YAHOO.util.AssertionError,{getMessage:function(){return this.message+"\nUnexpected: "+this.unexpected+" ("+(typeof this.unexpected)+") ";}});YAHOO.util.ShouldFail=function(message){arguments.callee.superclass.constructor.call(this,message||"This test should fail but didn't.");this.name="ShouldFail";};YAHOO.lang.extend(YAHOO.util.ShouldFail,YAHOO.util.AssertionError);YAHOO.util.ShouldError=function(message){arguments.callee.superclass.constructor.call(this,message||"This test should have thrown an error but didn't.");this.name="ShouldError";};YAHOO.lang.extend(YAHOO.util.ShouldError,YAHOO.util.AssertionError);YAHOO.util.UnexpectedError=function(cause){arguments.callee.superclass.constructor.call(this,"Unexpected error: "+cause.message);this.cause=cause;this.name="UnexpectedError";};YAHOO.lang.extend(YAHOO.util.UnexpectedError,YAHOO.util.AssertionError);YAHOO.util.ArrayAssert={contains:function(needle,haystack,message){var found=false;for(var i=0;i<haystack.length&&!found;i++){if(haystack[i]===needle){found=true;}}
if(!found){YAHOO.util.Assert.fail(message||"Value ("+needle+") not found in array.");}},containsItems:function(needles,haystack,message){for(var i=0;i<needles.length;i++){this.contains(needles[i],haystack,message);}
if(!found){YAHOO.util.Assert.fail(message||"Value not found in array.");}},containsMatch:function(matcher,haystack,message){if(typeof matcher!="function"){throw new TypeError("ArrayAssert.containsMatch(): First argument must be a function.");}
var found=false;for(var i=0;i<haystack.length&&!found;i++){if(matcher(haystack[i])){found=true;}}
if(!found){YAHOO.util.Assert.fail(message||"No match found in array.");}},doesNotContain:function(needle,haystack,message){var found=false;for(var i=0;i<haystack.length&&!found;i++){if(haystack[i]===needle){found=true;}}
if(found){YAHOO.util.Assert.fail(message||"Value found in array.");}},doesNotContainItems:function(needles,haystack,message){for(var i=0;i<needles.length;i++){this.doesNotContain(needles[i],haystack,message);}},doesNotContainMatch:function(matcher,haystack,message){if(typeof matcher!="function"){throw new TypeError("ArrayAssert.doesNotContainMatch(): First argument must be a function.");}
var found=false;for(var i=0;i<haystack.length&&!found;i++){if(matcher(haystack[i])){found=true;}}
if(found){YAHOO.util.Assert.fail(message||"Value found in array.");}},indexOf:function(needle,haystack,index,message){for(var i=0;i<haystack.length;i++){if(haystack[i]===needle){YAHOO.util.Assert.areEqual(index,i,message||"Value exists at index "+i+" but should be at index "+index+".");return;}}
YAHOO.util.Assert.fail(message||"Value doesn't exist in array.");},itemsAreEqual:function(expected,actual,message){var len=Math.max(expected.length,actual.length);for(var i=0;i<len;i++){YAHOO.util.Assert.areEqual(expected[i],actual[i],message||"Values in position "+i+" are not equal.");}},itemsAreEquivalent:function(expected,actual,comparator,message){if(typeof comparator!="function"){throw new TypeError("ArrayAssert.itemsAreEquivalent(): Third argument must be a function.");}
var len=Math.max(expected.length,actual.length);for(var i=0;i<len;i++){if(!comparator(expected[i],actual[i])){throw new YAHOO.util.ComparisonFailure(message||"Values in position "+i+" are not equivalent.",expected[i],actual[i]);}}},isEmpty:function(actual,message){if(actual.length>0){YAHOO.util.Assert.fail(message||"Array should be empty.");}},isNotEmpty:function(actual,message){if(actual.length===0){YAHOO.util.Assert.fail(message||"Array should not be empty.");}},itemsAreSame:function(expected,actual,message){var len=Math.max(expected.length,actual.length);for(var i=0;i<len;i++){YAHOO.util.Assert.areSame(expected[i],actual[i],message||"Values in position "+i+" are not the same.");}},lastIndexOf:function(needle,haystack,index,message){for(var i=haystack.length;i>=0;i--){if(haystack[i]===needle){YAHOO.util.Assert.areEqual(index,i,message||"Value exists at index "+i+" but should be at index "+index+".");return;}}
YAHOO.util.Assert.fail(message||"Value doesn't exist in array.");}};YAHOO.namespace("util");YAHOO.util.ObjectAssert={propertiesAreEqual:function(expected,actual,message){var properties=[];for(var property in expected){properties.push(property);}
for(var i=0;i<properties.length;i++){YAHOO.util.Assert.isNotUndefined(actual[properties[i]],message||"Property'"+properties[i]+"' expected.");}},hasProperty:function(propertyName,object,message){if(YAHOO.lang.isUndefined(object[propertyName])){YAHOO.util.Assert.fail(message||"Property "+propertyName+" not found on object.");}},hasOwnProperty:function(propertyName,object,message){if(!YAHOO.lang.hasOwnProperty(object,propertyName)){YAHOO.util.Assert.fail(message||"Property "+propertyName+" not found on object instance.");}}};YAHOO.util.DateAssert={datesAreEqual:function(expected,actual,message){if(expected instanceof Date&&actual instanceof Date){YAHOO.util.Assert.areEqual(expected.getFullYear(),actual.getFullYear(),message||"Years should be equal.");YAHOO.util.Assert.areEqual(expected.getMonth(),actual.getMonth(),message||"Months should be equal.");YAHOO.util.Assert.areEqual(expected.getDate(),actual.getDate(),message||"Day of month should be equal.");}else{throw new TypeError("DateAssert.datesAreEqual(): Expected and actual values must be Date objects.");}},timesAreEqual:function(expected,actual,message){if(expected instanceof Date&&actual instanceof Date){YAHOO.util.Assert.areEqual(expected.getHours(),actual.getHours(),message||"Hours should be equal.");YAHOO.util.Assert.areEqual(expected.getMinutes(),actual.getMinutes(),message||"Minutes should be equal.");YAHOO.util.Assert.areEqual(expected.getSeconds(),actual.getSeconds(),message||"Seconds should be equal.");}else{throw new TypeError("DateAssert.timesAreEqual(): Expected and actual values must be Date objects.");}}};YAHOO.namespace("util");YAHOO.util.UserAction={simulateKeyEvent:function(target,type,bubbles,cancelable,view,ctrlKey,altKey,shiftKey,metaKey,keyCode,charCode)
{target=YAHOO.util.Dom.get(target);if(!target){throw new Error("simulateKeyEvent(): Invalid target.");}
if(YAHOO.lang.isString(type)){type=type.toLowerCase();switch(type){case"keyup":case"keydown":case"keypress":break;case"textevent":type="keypress";break;default:throw new Error("simulateKeyEvent(): Event type '"+type+"' not supported.");}}else{throw new Error("simulateKeyEvent(): Event type must be a string.");}
if(!YAHOO.lang.isBoolean(bubbles)){bubbles=true;}
if(!YAHOO.lang.isBoolean(cancelable)){cancelable=true;}
if(!YAHOO.lang.isObject(view)){view=window;}
if(!YAHOO.lang.isBoolean(ctrlKey)){ctrlKey=false;}
if(!YAHOO.lang.isBoolean(altKey)){altKey=false;}
if(!YAHOO.lang.isBoolean(shiftKey)){shiftKey=false;}
if(!YAHOO.lang.isBoolean(metaKey)){metaKey=false;}
if(!YAHOO.lang.isNumber(keyCode)){keyCode=0;}
if(!YAHOO.lang.isNumber(charCode)){charCode=0;}
if(YAHOO.lang.isFunction(document.createEvent)){var event=null;try{event=document.createEvent("KeyEvents");event.initKeyEvent(type,bubbles,cancelable,view,ctrlKey,altKey,shiftKey,metaKey,keyCode,charCode);}catch(ex){try{event=document.createEvent("Events");}catch(uierror){event=document.createEvent("UIEvents");}finally{event.initEvent(type,bubbles,cancelable);event.view=view;event.altKey=altKey;event.ctrlKey=ctrlKey;event.shiftKey=shiftKey;event.metaKey=metaKey;event.keyCode=keyCode;event.charCode=charCode;}}
target.dispatchEvent(event);}else if(YAHOO.lang.isObject(document.createEventObject)){event=document.createEventObject();event.bubbles=bubbles;event.cancelable=cancelable;event.view=view;event.ctrlKey=ctrlKey;event.altKey=altKey;event.shiftKey=shiftKey;event.metaKey=metaKey;event.keyCode=(charCode>0)?charCode:keyCode;target.fireEvent("on"+type,event);}else{throw new Error("simulateKeyEvent(): No event simulation framework present.");}},simulateMouseEvent:function(target,type,bubbles,cancelable,view,detail,screenX,screenY,clientX,clientY,ctrlKey,altKey,shiftKey,metaKey,button,relatedTarget)
{target=YAHOO.util.Dom.get(target);if(!target){throw new Error("simulateMouseEvent(): Invalid target.");}
if(YAHOO.lang.isString(type)){type=type.toLowerCase();switch(type){case"mouseover":case"mouseout":case"mousedown":case"mouseup":case"click":case"dblclick":case"mousemove":break;default:throw new Error("simulateMouseEvent(): Event type '"+type+"' not supported.");}}else{throw new Error("simulateMouseEvent(): Event type must be a string.");}
if(!YAHOO.lang.isBoolean(bubbles)){bubbles=true;}
if(!YAHOO.lang.isBoolean(cancelable)){cancelable=(type!="mousemove");}
if(!YAHOO.lang.isObject(view)){view=window;}
if(!YAHOO.lang.isNumber(detail)){detail=1;}
if(!YAHOO.lang.isNumber(screenX)){screenX=0;}
if(!YAHOO.lang.isNumber(screenY)){screenY=0;}
if(!YAHOO.lang.isNumber(clientX)){clientX=0;}
if(!YAHOO.lang.isNumber(clientY)){clientY=0;}
if(!YAHOO.lang.isBoolean(ctrlKey)){ctrlKey=false;}
if(!YAHOO.lang.isBoolean(altKey)){altKey=false;}
if(!YAHOO.lang.isBoolean(shiftKey)){shiftKey=false;}
if(!YAHOO.lang.isBoolean(metaKey)){metaKey=false;}
if(!YAHOO.lang.isNumber(button)){button=0;}
if(YAHOO.lang.isFunction(document.createEvent)){var event=document.createEvent("MouseEvents");if(event.initMouseEvent){event.initMouseEvent(type,bubbles,cancelable,view,detail,screenX,screenY,clientX,clientY,ctrlKey,altKey,shiftKey,metaKey,button,relatedTarget);}else{event=document.createEvent("UIEvents");event.initEvent(type,bubbles,cancelable);event.view=view;event.detail=detail;event.screenX=screenX;event.screenY=screenY;event.clientX=clientX;event.clientY=clientY;event.ctrlKey=ctrlKey;event.altKey=altKey;event.metaKey=metaKey;event.shiftKey=shiftKey;event.button=button;event.relatedTarget=relatedTarget;}
if(relatedTarget&&!event.relatedTarget){if(type=="mouseout"){event.toElement=relatedTarget;}else if(type=="mouseover"){event.fromElement=relatedTarget;}}
target.dispatchEvent(event);}else if(YAHOO.lang.isObject(document.createEventObject)){event=document.createEventObject();event.bubbles=bubbles;event.cancelable=cancelable;event.view=view;event.detail=detail;event.screenX=screenX;event.screenY=screenY;event.clientX=clientX;event.clientY=clientY;event.ctrlKey=ctrlKey;event.altKey=altKey;event.metaKey=metaKey;event.shiftKey=shiftKey;switch(button){case 0:event.button=1;break;case 1:event.button=4;break;case 2:break;default:event.button=0;}
event.relatedTarget=relatedTarget;target.fireEvent("on"+type,event);}else{throw new Error("simulateMouseEvent(): No event simulation framework present.");}},fireMouseEvent:function(target,type,options)
{options=options||{};this.simulateMouseEvent(target,type,options.bubbles,options.cancelable,options.view,options.detail,options.screenX,options.screenY,options.clientX,options.clientY,options.ctrlKey,options.altKey,options.shiftKey,options.metaKey,options.button,options.relatedTarget);},click:function(target,options){this.fireMouseEvent(target,"click",options);},dblclick:function(target,options){this.fireMouseEvent(target,"dblclick",options);},mousedown:function(target,options){this.fireMouseEvent(target,"mousedown",options);},mousemove:function(target,options){this.fireMouseEvent(target,"mousemove",options);},mouseout:function(target,options){this.fireMouseEvent(target,"mouseout",options);},mouseover:function(target,options){this.fireMouseEvent(target,"mouseover",options);},mouseup:function(target,options){this.fireMouseEvent(target,"mouseup",options);},fireKeyEvent:function(type,target,options)
{options=options||{};this.simulateKeyEvent(target,type,options.bubbles,options.cancelable,options.view,options.ctrlKey,options.altKey,options.shiftKey,options.metaKey,options.keyCode,options.charCode);},keydown:function(target,options){this.fireKeyEvent("keydown",target,options);},keypress:function(target,options){this.fireKeyEvent("keypress",target,options);},keyup:function(target,options){this.fireKeyEvent("keyup",target,options);}};YAHOO.namespace("tool");YAHOO.tool.TestManager={_curPage:null,_frame:null,_logger:null,_timeoutId:0,_pages:new Array(),_results:new Object(),_handleTestRunnerComplete:function(data){this._results[this.curPage]=data.results;this._processResults(this.curPage,data.results);this._logger.clearTestRunner();if(this._pages.length){this._timeoutId=setTimeout(function(){YAHOO.tool.TestManager._run();},1000);}},_processResults:function(page,results){},_run:function(){this._curPage=this._pages.shift();this._frame.location.replace(this._curPage);},load:function(){if(parent.YAHOO.tool.TestManager!==this){parent.YAHOO.tool.TestManager.load();}else{var TestRunner=this._frame.YAHOO.tool.TestRunner;this._logger.setTestRunner(TestRunner);TestRunner.subscribe(TestRunner.COMPLETE_EVENT,this._handleTestRunnerComplete,this,true);TestRunner.run();}},setPages:function(pages){this._pages=pages;},start:function(){if(!this._frame){var frame=document.createElement("iframe");frame.style.visibility="hidden";frame.style.position="absolute";document.body.appendChild(frame);this._frame=frame.contentWindow||frame.contentDocument.ownerWindow;}
if(!this._logger){this._logger=new YAHOO.tool.TestLogger();}
this._run();},stop:function(){clearTimeout(this._timeoutId);}};YAHOO.register("yuitest",YAHOO.tool.TestRunner,{version:"2.3.0",build:"357"});