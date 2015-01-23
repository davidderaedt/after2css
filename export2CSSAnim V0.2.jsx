/*
After Effects CSS Animation exporter
You need to enable scripts to write files in AE's Preferences > General panel
*/

function posConvert (myKeyframeValue, layer){
    return "left:" + (myKeyframeValue[0]-layer.width/2) + "px;top:" + (myKeyframeValue[1]-layer.height/2) + "px;";
}
function opacityConvert (myKeyframeValue){
    return "opacity:" + myKeyframeValue;
}
function scaleConvert (myKeyframeValue){
    return "transform: scale(" + (myKeyframeValue[0]/100) + "," + (myKeyframeValue[1]/100) + ");";
}
function rotationConvert (myKeyframeValue){
    return "transform: rotate(" + myKeyframeValue + "deg);" ;
}

function getKeyframeData(layer, duration, propName, convertFunc){
    
    var prop = layer[propName];
    var numKeys = prop.numKeys; 

    var myKeyframeTime, myKeyframeValue;

    if (numKeys== 0) {
        return "";
    }

    var txt = "";
    
    var durationPc = duration/100;

    for(var n=1 ; n <= numKeys ; n++){
        myKeyframeTime = prop.keyTime(n); 
        myKeyframeValue = prop.keyValue(n);        
        var relativeTime = Math.round(myKeyframeTime/durationPc);
        
        txt += relativeTime + "% {" + convertFunc(myKeyframeValue, layer) + "}\n";
    }
    
    var mainTxt = "@-webkit-keyframes "+layer.name+propName+"data {\n"+txt+"\n}\n";
    mainTxt+= "@keyframes "+layer.name+propName+"data {\n"+txt+"\n}\n";
    
    return mainTxt;
}

function getAnimTxt(layerName, compDur, prefix){    
    
    var t = "#"+layerName+"{";
    t+="transform-origin: " + layer.anchorPoint.value[0] + "px " + layer.anchorPoint.value[1] +"px;";
    t+=prefix+"animation: "
    t+=layerName+"positiondata " + compDur + "s 0s,"
    t+=layerName+"opacitydata " + compDur + "s 0s,"
    t+=layerName+"scaledata " + compDur + "s 0s,"
    t+=layerName+"rotationdata " + compDur + "s 0s;"
    t+="}\n\n";
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

// Usage
var proj = app.project; 
var comp = proj.activeItem;
var compDur = comp.workAreaDuration;

var outputTxt = "";
var animTxt = "";
var framesTxt="";

var totalLayers = comp.numLayers;

for (var i = 1; i <= totalLayers ; i++){
    
    var layer = comp.layer(i);

    var positionFramesTxt = getKeyframeData(layer, compDur, "position", posConvert);
    var opacityFramesTxt = getKeyframeData(layer, compDur, "opacity", opacityConvert);
    var scaleFramesTxt = getKeyframeData(layer, compDur, "scale", scaleConvert);
    var rotationFramesTxt = getKeyframeData(layer, compDur, "rotation", rotationConvert);

    framesTxt += positionFramesTxt + opacityFramesTxt + scaleFramesTxt + rotationFramesTxt;

    animTxt += getAnimTxt(layer.name, compDur, "");
    animTxt += getAnimTxt(layer.name, compDur, "-webkit-");
}

outputTxt = "/*Generated by AfterEffects CSS animation exporter v0*/\n\n" + framesTxt + animTxt;

var destFile = File.saveDialog ("Save CSS file");	
saveTextFile(outputTxt, destFile.fullName);

//$.writeln(outputTxt);

 
