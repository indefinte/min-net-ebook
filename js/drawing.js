
// Copyright 2010 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var canvas;
var context;
var canvasWidth = 960;
var canvasHeight = 600;
var padding = 25;
var lineWidth = 8;
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";
var outlineImage = new Image();
var crayonImage = new Image();
var markerImage = new Image();
var eraserImage = new Image();
var crayonBackgroundImage = new Image();
var markerBackgroundImage = new Image();
var eraserBackgroundImage = new Image();
var crayonTextureImage = new Image();
var clickX = new Array();
var clickY = new Array();
var clickColor = new Array();
var clickTool = new Array();
var clickSize = new Array();
var clickDrag = new Array();
var paint = false;
var curColor = colorPurple;
var curTool = "marker";
var curSize = "normal";
var mediumStartX = 18;
var mediumStartY = 19;
var mediumImageWidth = 93;
var mediumImageHeight = 46;

var drawingAreaX = 0;
var drawingAreaY = 0;
var drawingAreaWidth = 960;
var drawingAreaHeight = 600;
/*
var drawingAreaX = 111;
var drawingAreaY = 11;
var drawingAreaWidth = 267;
var drawingAreaHeight = 200;
*/
var toolHotspotStartY = 23;
var toolHotspotHeight = 38;
var sizeHotspotStartY = 157;
var sizeHotspotHeight = 36;
var sizeHotspotWidthObject = new Object();
sizeHotspotWidthObject.huge = 39;
sizeHotspotWidthObject.large = 25;
sizeHotspotWidthObject.normal = 18;
sizeHotspotWidthObject.small = 16;
var totalLoadResources = 8;
//var curLoadResNum = 0;
var curLoadResNum = 8;
/**
* Calls the redraw function after all neccessary resources are loaded.
*/
function resourceLoaded()
{
	//if(++curLoadResNum >= totalLoadResources){
		redraw();
	//}
}

/**
* Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
*/
function prepareCanvas()
{
	// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
	var canvasDiv = document.getElementById('noteDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d"); // Grab the 2d canvas context	
}

function startDraw(){
	console.log('startDraw');
	
	//stopZoom();
	
	// Add touch events	
	$('#canvas').on('touchstart',function(e){
		var touchEvent = e.originalEvent.changedTouches[0];        
		var mouseX = touchEvent.pageX - this.offsetLeft - window.fixLeft;
		var mouseY = touchEvent.pageY - this.offsetTop;
		if(paint==true){
			addClick(mouseX, mouseY, false);
			redraw();
		}
	});
    $('#canvas').on('touchmove',function(e){
		var touchEvent = e.originalEvent.changedTouches[0];
        e.preventDefault();
		addClick(touchEvent.pageX - this.offsetLeft - window.fixLeft, touchEvent.pageY - this.offsetTop, true);
		redraw();
	});
	$('#canvas').on('touchend',function(e){
		paint = false;
		//clearPoints
		clearPoints();
	});	
	// Add mouse events
	// ----------------
	$('#canvas').on('mousedown',function(e)
	{
		// Mouse down location	
		var mouseX = e.pageX - this.offsetLeft - window.fixLeft;
		var mouseY = e.pageY - this.offsetTop;			
		paint = true;
		addClick(mouseX, mouseY, false);
		redraw();
	});	
	$('#canvas').on('mousemove',function(e){
		if(paint==true){
			//addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
			addClick(e.pageX - this.offsetLeft - window.fixLeft, e.pageY - this.offsetTop, true);
			redraw();
		}
	});	
	$('#canvas').on('mouseup',function(e){
		paint = false;
	  	redraw();
		clearPoints();	
	});
	$('#canvas').on('mouseleave',function(e){
		paint = false;
	});
}

function stopDraw(){
	console.log('stopDraw');
	$('#canvas').off('touchstart touchmove mousedown mousemove mouseup mouseleave');   
	
	clearPoints();
	//ext
	if($('.bTool').hasClass('clk')){
		$('.bTool').removeClass('clk');
		$('.bExt').fadeOut();
	}
}

function startZoom(){
	window.zoom = 2;
	window.viewPages = 1;
	var pg = getPage();
	//prepareSize();
	loadCanvas();
	closeBook();
	openBook('single', pg);
	//console.log('pg = ' + pg);
	
	
	
	console.log('startZoom');
	
	
	//console.log('page = ' + page);
	
	stopDraw();
	//$('.sample-docs').turn('disable', true);
	
	//$('.p' + page + '>img').css({'width':window.nW * window.zoom,'height':window.nH * window.zoom});	
	$('#noteDiv').css({'width':window.dW * window.zoom,'height':window.dH * window.zoom});
	$('#noteDiv canvas').css({'width':window.dW * window.zoom,'height':window.dH * window.zoom});
	
	$('#noteDiv').draggable({
		drag: function(event, ui) {
			//console.log('ui.position.left  = ' + ui.position.left );        
			if (ui.position.top > 0) {
				ui.position.top = 0;
			}
			if (ui.position.top < window.nH - $(this).height()) {
				ui.position.top = window.nH - $(this).height();
			}  
			//console.log('$(this).width() = ' + $(this).width());
			//console.log('ui.position.left = ' + ui.position.left);
			
			if (ui.position.left > 0) {
				ui.position.left = 0;
			}
			if (ui.position.left < window.nW - $(this).width()) {
				ui.position.left = window.nW - $(this).width();
			} 
			
			var page = $('.sample-docs').turn('page');
			$('.p' + page +' img').offset({ top: ui.position.top, left: (ui.position.left + window.fixLeft) });
		},
		scroll: false,
		cursor: 'move'
	});
}

function stopZoom(){
	window.zoom = 1;
	window.viewPages = 2;
	var pg = getPage();
	//prepareSize();
	loadCanvas();
	closeBook();
	openBook('double', pg);

	
	
	console.log('stopZoom');
	
	var page = $('.sample-docs').turn('page');	
	//console.log('page = ' + page);
	
	//$('.sample-docs').turn('disable', false);
	
	//$('.p' + page +' img').css({'width':window.nW * window.zoom,'height':window.nH * window.zoom});
	$('#noteDiv').css({'width':window.nW * window.zoom,'height':window.nH * window.zoom});
	$('#noteDiv canvas').css({'width':window.nW * window.zoom,'height':window.nH * window.zoom});
	
	//$('#noteDiv').draggable('disable');
	$('#noteDiv').draggable('destroy');
	
	$('#noteDiv').offset({ top: 0, left: window.fixLeft });
	//$('.p' + page +' img').offset({ top: 0, left: window.fixLeft });
	
	//ext
	if($('.bZoom').hasClass('clk')){
		$('.bZoom').removeClass('clk');
	}
}

/**
* Adds a point to the drawing array.
* @param x
* @param y
* @param dragging
*/
function addClick(x, y, dragging)
{
	clickX.push(x);
	clickY.push(y);
	clickTool.push(curTool);
	clickColor.push(curColor);
	clickSize.push(curSize);
	clickDrag.push(dragging);
}

/**
* Clears the canvas.
*/
function clearPoints(){
	clickX = new Array();
	clickY = new Array();
	clickColor = new Array();
	clickTool = new Array();
	clickSize = new Array();
	clickDrag = new Array();
}

function clearCanvas()
{
	context.clearRect(0, 0, canvasWidth, canvasHeight);
}

function resetCanvas()
{
	clearPoints();
	clearCanvas();
}
/**
* Redraws the canvas.
*/
function redraw()
{
	// Make sure required resources are loaded before redrawing
	if(curLoadResNum < totalLoadResources){ return; }
	
	//clearCanvas();
	
	var locX;
	var locY;
	
	
	// Keep the drawing in the drawing area
	context.save();
	context.beginPath();
	context.rect(drawingAreaX, drawingAreaY, drawingAreaWidth, drawingAreaHeight);
	context.clip();
		
	var radius;
	var i = 0;
	for(; i < clickX.length; i++)
	{		
		if(clickSize[i] == "small"){
			radius = 2;
		}else if(clickSize[i] == "normal"){
			radius = 5;
		}else if(clickSize[i] == "large"){
			radius = 10;
		}else if(clickSize[i] == "huge"){
			radius = 20;
		}else{
			alert("Error: Radius is zero for click " + i);
			radius = 0;	
		}
		
		context.beginPath();
		if(clickDrag[i] && i){
			context.moveTo(clickX[i-1], clickY[i-1]);
		}else{
			context.moveTo(clickX[i], clickY[i]);
		}
		context.lineTo(clickX[i], clickY[i]);
		context.closePath();
		
		if(clickTool[i] == "eraser"){								
			context.globalCompositeOperation = "destination-out"; // To erase instead of draw over with white
			context.fillStyle = "rgba(0,0,0,1)";
			context.strokeStyle = "rgba(0,0,0,1)";			
		}else{
			context.globalCompositeOperation = "source-over";	// To erase instead of draw over with white
			context.strokeStyle = clickColor[i];
		}
		context.lineJoin = "round";
		context.lineWidth = radius;
		context.stroke();
		
	}
	//context.globalCompositeOperation = "source-over";// To erase instead of draw over with white
	context.restore();
	
	// Overlay a crayon texture (if the current tool is crayon)
	if(curTool == "crayon"){
		context.globalCompositeOperation = "source-atop";
		context.globalAlpha = 0.4; // No IE support
		context.drawImage(crayonTextureImage, 0, 0, canvasWidth, canvasHeight);
	}
	context.globalAlpha = 1; // No IE support
	
	// Draw the outline image
	//context.drawImage(outlineImage, drawingAreaX, drawingAreaY, drawingAreaWidth, drawingAreaHeight);
}


