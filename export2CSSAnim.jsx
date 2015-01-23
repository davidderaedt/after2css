/*
After Effects CSS Animation exporter
You need to enable scripts to write files in AE's Preferences > General panel
*/

function posConvert (myKeyframeValue, layer, prefix){
    /*
    return "left:" + (myKeyframeValue[0]-layer.width/2) + "px;top:" + (myKeyframeValue[1]-layer.height/2) + "px;";
    */
    
    var oriPos = layer.position.valueAtTime(0, false);
    var x = (myKeyframeValue[0]) - oriPos[0];
    var y = (myKeyframeValue[1]) - oriPos[1];;
    return prefix+"transform: translate(" + x + "px, " + y + "px);";
    
}
function opacityConvert (myKeyframeValue,layer, prefix){
    return "opacity:" + myKeyframeValue+";";
}
function scaleConvert (myKeyframeValue, layer, prefix){
    return prefix+"transform: scale(" + (myKeyframeValue[0]/100) + "," + (myKeyframeValue[1]/100) + ");";
}
function rotationConvert (myKeyframeValue, layer, prefix){
    return prefix+"transform: rotate(" + myKeyframeValue + "deg);" ;
}

function getKeyframeData(layer, eltName, duration, propName, convertFunc){
    
    var prop = layer[propName];
    var numKeys = prop.numKeys;

    var myKeyframeTime, myKeyframeValue;

    if (numKeys== 0) {
        return null;
    }

    var txt = "";
    var wktxt = "";
    
    var durationPc = duration/100;
    
    //$.writeln(layer.name + "-" + propName);

    for(var n=1 ; n <= numKeys ; n++){
        
        myKeyframeTime = prop.keyTime(n);
        myKeyframeValue = prop.keyValue(n);
        var relativeTime = Math.ceil(myKeyframeTime/durationPc);
        
        var ease="";
        var wkease="";
        
        // Handle linear easings
        /*Note: css timing functions describe the future, hence the use of keyOut*/
        if(prop.keyOutInterpolationType(n)==KeyframeInterpolationType.LINEAR){
            /*
            $.writeln("in=" + easeIn[0].speed +", "+easeIn[0].influence);
            $.writeln("out=" + easeOut[0].speed +", "+easeOut[0].influence);
            */            
            ease= "animation-timing-function: linear;";
            wkease= "-webkit-animation-timing-function: linear;";
        }        
        
        txt +="  " + relativeTime + "% {" + convertFunc(myKeyframeValue, layer, "") + ease + "}\n";
        wktxt +="  " + relativeTime + "% {" + convertFunc(myKeyframeValue, layer, "-webkit-") + wkease + "}\n";
        
        // handle holds
        var nextRelativeTime;
        if(prop.keyOutInterpolationType(n)==KeyframeInterpolationType.HOLD){
            if(n<numKeys){
                var nextTime = prop.keyTime(n+1);
                nextRelativeTime = Math.ceil(nextTime/durationPc) - 0.001;
            }
            else nextRelativeTime = 100;
            txt +="  " + nextRelativeTime + "% {" + convertFunc(myKeyframeValue, layer, "") + ease + "}\n";
            wktxt +="  " + nextRelativeTime + "% {" + convertFunc(myKeyframeValue, layer, "-webkit-") + wkease + "}\n";
        }
    }
    
    //add last keyframe to hold last value
    if(relativeTime!=100 && nextRelativeTime!=100){
        txt +="  100% {" + convertFunc(myKeyframeValue, layer, "") + ease + "}\n";
        wktxt +="  100% {" + convertFunc(myKeyframeValue, layer, "-webkit-") + wkease + "}\n";
    }
    
    var mainTxt = "@keyframes "+eltName + "-" + propName+" {\n"+txt+"}\n\n";
    var mainwkTxt = "@-webkit-keyframes "+eltName + "-" + propName+" {\n"+wktxt+"}\n\n";
        
    // generate animation text
    var animPropTxt = eltName+"-"+ propName+" " + duration + "s 0s forwards";
        
    return {keyframesTxt:mainTxt, keyframeswkTxt:mainwkTxt, animTxt:animPropTxt};
}

function getAnimTxt(animList){
    
    if(animList.length==0) return "";
    
    var t="animation: ";
    var n = animList.length;
    for (var i=0; i<n; i++){
        var anim=animList[i];
        t+=anim;
        if(i<n-1) t+=",";
    }
    t+=";"
    return t;
}

function saveTextFile(pText, filepath) {
		
    // get OS specific linefeed
    var fileLineFeed; 
    if ($.os.search(/windows/i) != -1) {
        fileLineFeed = "Windows";
    } else {
		fileLineFeed = "Unix";
	}
	
    fileOut = new File(filepath);
    fileOut.lineFeed = fileLineFeed;
    fileOut.open("w", "TEXT", "????");
    fileOut.write(pText);
    fileOut.close();
}

function main(){
    
    var proj = app.project; 
    var comp = proj.activeItem;
    var compDur = comp.workAreaDuration;

    var outputTxt = "";
    var classTxt = "";
    var framesTxt="";

    var totalLayers = comp.numLayers;

    for (var i = 1; i <= totalLayers ; i++){

        var layer = comp.layer(i);
        var eltName = layer.name.split(".")[0];

        var animList = [];

        var positionData = getKeyframeData(layer, eltName, compDur, "position", posConvert);
        if(positionData) {
            framesTxt += positionData.keyframesTxt;
            framesTxt += positionData.keyframeswkTxt;
            animList.push(positionData.animTxt);
        }
        var opacityData = getKeyframeData(layer, eltName, compDur, "opacity", opacityConvert);
        if(opacityData) {
            framesTxt += opacityData.keyframesTxt;
            framesTxt += opacityData.keyframeswkTxt;
            animList.push(opacityData.animTxt);
        }
        var scaleData = getKeyframeData(layer, eltName, compDur, "scale", scaleConvert);
        if(scaleData) { 
            framesTxt += scaleData.keyframesTxt;
            framesTxt += scaleData.keyframeswkTxt;
            animList.push (scaleData.animTxt);
        }
        var rotationData = getKeyframeData(layer, eltName, compDur, "rotation", rotationConvert);
        if(rotationData) {
            framesTxt += rotationData.keyframesTxt;
            framesTxt += rotationData.keyframeswkTxt;
            animList.push (rotationData.animTxt);
        }

        var sAnim = getAnimTxt(animList);
        classTxt += "#"+eltName+"{";
        var ax = Math.round(layer.anchorPoint.value[0]);
        var ay = Math.round(layer.anchorPoint.value[1]);
        classTxt+="transform-origin: " + ax + "px " + ay +"px;";
        classTxt+="-webkit-transform-origin: " + ax + "px " + ay +"px;";
        classTxt += sAnim + "-webkit-" + sAnim;
        classTxt+="}\n\n";
    }

    outputTxt = "/*Generated by AfterEffects CSS animation exporter v0*/\n\n" + framesTxt + classTxt;

    var destFile = File.saveDialog ("Save CSS file");	
    saveTextFile(outputTxt, destFile.fullName);

    //$.writeln(outputTxt);

}
 main();

 

