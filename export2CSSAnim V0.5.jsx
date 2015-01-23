/*
After Effects CSS Animation exporter
You need to enable scripts to write files in AE's Preferences > General panel
*/

function posConvert (myKeyframeValue, layer){
    return "left:" + (myKeyframeValue[0]-layer.width/2) + "px;top:" + (myKeyframeValue[1]-layer.height/2) + "px;";
}
function opacityConvert (myKeyframeValue){
    return "opacity:" + myKeyframeValue+";";
}
function scaleConvert (myKeyframeValue){
    return "transform: scale(" + (myKeyframeValue[0]/100) + "," + (myKeyframeValue[1]/100) + ");";
}
function rotationConvert (myKeyframeValue){
    return "transform: rotate(" + myKeyframeValue + "deg);" ;
}

function getKeyframeData(layer, eltName, duration, propName, convertFunc){
    
    var prop = layer[propName];
    var numKeys = prop.numKeys; 

    var myKeyframeTime, myKeyframeValue;

    if (numKeys== 0) {
        return null;
    }

    var txt = "";
    
    var durationPc = duration/100;
    
    $.writeln(layer.name + "-" + propName);

    for(var n=1 ; n <= numKeys ; n++){
        myKeyframeTime = prop.keyTime(n);
        myKeyframeValue = prop.keyValue(n);
        var relativeTime = Math.ceil(myKeyframeTime/durationPc);
        
        var ease="";
        /*
        $.writeln("in is linear? "+ (prop.keyInInterpolationType(n)==KeyframeInterpolationType.LINEAR));
        $.writeln("out is linear? "+ (prop.keyOutInterpolationType(n)==KeyframeInterpolationType.LINEAR));
        $.writeln("in=" + easeIn[0].speed +", "+easeIn[0].influence);
        $.writeln("out=" + easeOut[0].speed +", "+easeOut[0].influence);
        */
        
        // Handle linear easings
        if(prop.keyOutInterpolationType(n)==KeyframeInterpolationType.LINEAR){
            ease=" -webkit-animation-timing-function: linear;animation-timing-function: linear;";
        }        
        
        txt +="  " + relativeTime + "% {" + convertFunc(myKeyframeValue, layer) + ease + " }\n";
        
        // handle holds
        var nextRelativeTime;
        if(prop.keyOutInterpolationType(n)==KeyframeInterpolationType.HOLD){            
            if(n<numKeys){ 
                var nextTime = prop.keyTime(n+1);
                nextRelativeTime = Math.ceil(nextTime/durationPc) - 0.001;
            }
            else nextRelativeTime = 100;
            txt +="  " + nextRelativeTime + "% {" + convertFunc(myKeyframeValue, layer) + ease + " }\n";
        }

    }
    //add last keyframe to hold last value
    if(relativeTime!=100 && nextRelativeTime!=100) txt +="  100% {" + convertFunc(myKeyframeValue, layer) + ease + " }\n";
    
    var mainTxt = "@-webkit-keyframes "+eltName + "-" + propName+" {\n"+txt+"}\n\n";
    mainTxt+= "@keyframes "+eltName+"-"+propName+" {\n"+txt+"}\n\n";
    
    // generate animation text
    var animPropTxt = eltName+"-"+ propName+" " + duration + "s 0s forwards";
        
    return {keyframesTxt:mainTxt, animTxt:animPropTxt};
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
            animList.push(positionData.animTxt);
        }
        var opacityData = getKeyframeData(layer, eltName, compDur, "opacity", opacityConvert);
        if(opacityData) {
            framesTxt += opacityData.keyframesTxt;
            animList.push(opacityData.animTxt);
        }
        var scaleData = getKeyframeData(layer, eltName, compDur, "scale", scaleConvert);
        if(scaleData) { 
            framesTxt += scaleData.keyframesTxt;
            animList.push (scaleData.animTxt);
        }
        var rotationData = getKeyframeData(layer, eltName, compDur, "rotation", rotationConvert);
        if(rotationData) {
            framesTxt += rotationData.keyframesTxt;
            animList.push (rotationData.animTxt);
        }

        //framesTxt += positionFramesTxt + opacityFramesTxt + scaleFramesTxt + rotationFramesTxt;

        var sAnim = getAnimTxt(animList);
        classTxt += "#"+eltName+"{";
        classTxt+="transform-origin: " + layer.anchorPoint.value[0] + "px " + layer.anchorPoint.value[1] +"px;";
        classTxt += sAnim + "-webkit-" + sAnim;
        classTxt+="}\n\n";
    }

    outputTxt = "/*Generated by AfterEffects CSS animation exporter v0*/\n\n" + framesTxt + classTxt;

    var destFile = File.saveDialog ("Save CSS file");	
    saveTextFile(outputTxt, destFile.fullName);

    //$.writeln(outputTxt);

}
 main();

 

