
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


/**
* Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
*/
function prepareCanvas()
{
	// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
	var canvasDiv = document.getElementById('drawDiv');
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
	/*
	$('#drawDiv').on('touchstart',function(e){
		var touchEvent = e.originalEvent.changedTouches[0];        
		var mouseX = touchEvent.pageX - this.offsetLeft - window.fixLeft;
		var mouseY = touchEvent.pageY - this.offsetTop;
		if(paint==true){
			addClick(mouseX, mouseY, false);
			redraw();
		}
	});
    $('#drawDiv').on('touchmove',function(e){
		var touchEvent = e.originalEvent.changedTouches[0];
        e.preventDefault();
		addClick(touchEvent.pageX - this.offsetLeft - window.fixLeft, touchEvent.pageY - this.offsetTop, true);
		redraw();
	});
	$('#drawDiv').on('touchend',function(e){
		paint = false;
		//clearPoints
		clearPoints();
	});	
	*/
	// Add mouse events
	// ----------------
	//$('#canvas').on('mousedown',function(e)
	$('#drawDiv').on('mousedown',function(e)
	{
		// Mouse down location	
		var mouseX = e.pageX - this.offsetLeft - window.fixLeft;
		var mouseY = e.pageY - this.offsetTop;	
		//console.log('----------------');
		//console.log('e.pageY = ' + e.pageY);
		//console.log('this.offsetTop = ' + this.offsetTop);
		//console.log('mouseY = ' + mouseY);
		
		paint = true;
		addClick(mouseX, mouseY, false);
		redraw();
	});	
	//$('#canvas').on('mousemove',function(e){
	$('#drawDiv').on('mousemove',function(e){
		if(paint==true){
			//addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
			var mouseX = e.pageX - this.offsetLeft - window.fixLeft;
			var mouseY = e.pageY - this.offsetTop;
			
			addClick(mouseX, mouseY, true);
			redraw();
		}
	});	
	//$('#canvas').on('mouseup',function(e){
	$('#drawDiv').on('mouseup',function(e){
		paint = false;
	  	redraw();
		clearPoints();	
	});
	//$('#canvas').on('mouseleave',function(e){
	$('#drawDiv').on('mouseleave',function(e){
		paint = false;
	});
}

function stopDraw(callback){
	console.log('stopDraw');
	$('#drawDiv').off('touchstart touchmove mousedown mousemove mouseup mouseleave');   
	
	clearPoints();
	//ext
	if($('.bTool').hasClass('clk')){
		$('.bTool').removeClass('clk');
		$('.bExt').fadeOut();
	}
	
	if (callback && typeof(callback) === "function") {
        callback();
    }
}

function startZoom(){
	window.zoom = 2;
	window.viewPages = 1;
	var pg = getPage();

	closeBook();
	openBook('single', pg);
	
	//fix
	canvasWidth = window.nW * window.zoom;//window.nW
	canvasHeight = window.nH * window.zoom;
	canvas.setAttribute('width', window.nW * window.zoom);//window.nW
	canvas.setAttribute('height', window.nH * window.zoom);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d");		
	
	loadCanvas();
		
	//
	console.log('startZoom');	
	$('#drawDiv').css({'width':window.nW * window.zoom,'height':window.nH * window.zoom}); //window.nW
	$('#drawDiv canvas').css({'width':window.nW * window.zoom,'height':window.nH * window.zoom}); //window.nW
	
	stopDraw(function(){
		startDrag();		
	});	
}

function stopZoom(callback){
	window.zoom = 1;
	window.viewPages = 1;//2
	var pg = getPage();
	//var pageExt = Math.floor(pg / window.viewPages) * window.viewPages;	
		
	closeBook();
	openBook('single', pg);//double	
	
	//fix
	canvasWidth = window.nW * window.zoom;//window.nW
	canvasHeight = window.nH * window.zoom;
	canvas.setAttribute('width', window.nW * window.zoom);//window.nW
	canvas.setAttribute('height', window.nH * window.zoom);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d");
	
	loadCanvas(pg);	
	
	console.log('stopZoom');	
		
	$('#drawDiv').css({'width':window.nW,'height':window.nH * window.zoom});
	$('#drawDiv canvas').css({'width':window.nW,'height':window.nH * window.zoom});		
	$('#drawDiv').offset({ top: 0, left: window.fixLeft });		
	
	stopDrag();
	
	//ext
	if($('.bZoom').hasClass('clk')){
		$('.bZoom').removeClass('clk');
	}
	
	if (callback && typeof(callback) === "function") {
        callback();
    }
}

function startDrag(){
	var pg = getPage();
	
	$('#drawDiv').draggable({
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

function stopDrag(callback){
	$('#drawDiv').draggable('destroy');
	
	if (callback && typeof(callback) === "function") {
        callback();
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

function clearCanvas(callback)
{
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	
	if (callback && typeof(callback) === "function") {
        callback();
    }
}

function resetCanvas(callback)
{
	clearPoints();
	clearCanvas(callback);
}
/**
* Redraws the canvas.
*/
function redraw()
{
	//fix drawingAreaHeight
	drawingAreaHeight = window.nH * window.zoom - 60;
	
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
		context.lineWidth = radius * window.zoom;
		context.stroke();
		
	}
	//context.globalCompositeOperation = "source-over";// To erase instead of draw over with white
	context.restore();
	
	context.globalAlpha = 1; // No IE support
	
}


