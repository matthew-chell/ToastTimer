var Toast = {

Timer: function(green, yellow, red, timeChange, colourChange){
	this.green = green;
	this.yellow = yellow;
	this.red = red;
	this.timeChange = timeChange;
	this.colourChange = colourChange;
	this.ticking = false;
},

initTimerFunction: function(){
	this.Timer.prototype.start = function(){
		this.startTime = (new Date).getTime();
		this.time = 0;
		this.timeChange(this.time);
		this.mode = Toast.consts.INITIAL;
		var t = this;
		this.interval = setInterval(function() { t.tick(t)}, Toast.consts.TICK_TIME);
		this.ticking = true;
	},

	this.Timer.prototype.tick = function(t){
		var time = parseInt(t.getTime());
		if(t.time < time){
			t.timeChange(time);
			switch(t.mode){
			case Toast.consts.INITIAL:
				if(t.green <= time){
					t.mode = Toast.consts.GREEN;
					t.colourChange(t.mode);
				}
				break;
			case Toast.consts.GREEN:
				if(t.yellow <= time){
					t.mode = Toast.consts.YELLOW;
					t.colourChange(t.mode);
				}
				break;
			case Toast.consts.YELLOW:
				if(t.red <= time){
					t.mode = Toast.consts.RED;
					t.colourChange(t.mode);
				}
				break;
			}
		}
		t.time = time;
	},

	this.Timer.prototype.isTicking = function(){
		return this.ticking;
	},

	this.Timer.prototype.stop = function(){
		this.ticking = false;
		clearTimeout(this.interval);
		return this.getTime();
	},

	this.Timer.prototype.getTime = function(){
		return ((new Date).getTime() - this.startTime) / 1000;
	}
},

save: function(){
	var data = [];
	$('#sidebar tbody tr').each(function(){
		var row = {};
		$(this).children().each(function(index){
			switch(index){
				case 1:
					row.name = $(this).children().val();
					break;
				case 2:
					row.role = $(this).children().val();
					break;
				case 3:
					row.green = $(this).children().val();
					break;
				case 4:
					row.yellow = $(this).children().val();
					break;
				case 5:
					row.red = $(this).children().val();
					break;
				case 6:
					row.time = $(this).html();
					break;
			}
		});
		data.push(row);
	});
	if(this.consts.COOKIE_SAVE){
		this.saveCookie(this.consts.COOKIE_NAME, JSON.stringify(data), new Date(10000000000000) /*reasonable large date*/);
	} else {
		window.location = '?' + this.consts.PARAMETER + '=' + encodeURI(JSON.stringify(data));
	}
},

load: function() {
	try{
		var raw = "";
		if(this.consts.COOKIE_SAVE){
			raw = this.loadCookie(this.consts.COOKIE_NAME);
		} else {
			
			raw = this.getParameterByName(this.consts.PARAMETER);
		}
		var data = JSON.parse(raw);
		var tbody = $('#sidebar tbody');
		for(var i = 0; i < data.length; i ++){
			tbody.append(
				"<tr>" +
					"<td><input type='radio' name='group'></td>" +
					"<td><input type='text' value='" + data[i].name + "'></td>" +
					"<td><input type='text' value='" + data[i].role + "'></td>" +
					"<td><input type='text' value='" + data[i].green + "'></td>" +
					"<td><input type='text' value='" + data[i].yellow + "'></td>" +
					"<td><input type='text' value='" + data[i].red + "'></td>" +
					"<td>" + data[i].time + "</td>" +
				"</tr>"
			);
		}
	} catch (e) {
		if (e instanceof SyntaxError){
			console.log("Parse error:" + raw);
		} else {
			throw e;
		}
	}
},

getParameterByName: function(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href);
    if (!results){
		return null;
	}
    if (!results[2]){
		return '';
	}
    return decodeURIComponent(results[2].replace(/\+/g, " "));
},

saveCookie: function(name, value, expire) {
	document.cookie = name + "=" + value + "; expires=" + expire.toGMTString() + "; path=/";
},

loadCookie: function(name){
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2){ 
		return parts.pop().split(";").shift();
	}
	return "";
},

click: function(){
	if(null == this.select){
		$('*:not(.show) > #toggle').click();
		return;
	}
	if(null != this.timer && this.timer.isTicking()){
		$(this.select.children()[6]).html(this.timeToString(this.timer.stop()));
		this.displayColour(this.consts.INITIAL);
	} else {
		$('.show > #toggle').click();
		var elem = $(this.select.children()[3]);
		var green = parseFloat(elem.children().val()) * 60;
		elem = elem.next();
		var yellow = parseFloat(elem.children().val()) * 60;
		elem = elem.next();
		var red = parseFloat(elem.children().val()) * 60;
		this.timer = new this.Timer(green, yellow, red, this.displayTime, this.displayColour);
		this.timer.start();
	}
},

displayTime: function(time){
	$('#time').html(Toast.timeToString(time));
},

displayColour: function(colour){
	var c = "black";
	switch(colour){
	case Toast.consts.INITIAL:
		c = Toast.consts.INITIAL_COLOUR;
		break;
	case Toast.consts.GREEN:
		c = Toast.consts.GREEN_COLOUR;
		break;
	case Toast.consts.YELLOW:
		c = Toast.consts.YELLOW_COLOUR;
		break;
	case Toast.consts.RED:
		c = Toast.consts.RED_COLOUR;
		break;
	}
	$('#time').css('background-color', c);
	
},

timeToString: function(time){
	return (parseInt(time / 60) < 10 ? "0" : "") + parseInt(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + parseInt(time % 60);
},

events: function(){
	$('#add').click(function(){
		$(this).siblings('table').find('tbody').append(
			"<tr>" +
				"<td><input type='radio' name='group'></td>" +
				"<td><input type='text'></td>" +
				"<td><input type='text'></td>" +
				"<td><input type='text'></td>" +
				"<td><input type='text'></td>" +
				"<td><input type='text'></td>" +
				"<td></td>" +
			"</tr>"
		);
	});
	$('#save').click(function(){
		Toast.save();
	});
	$('#toggle').click(function(){
		$(this).parent().toggleClass('show');
	});
	$('#sidebar table').on('click','input[type=radio]', function(){
		Toast.select = $(this).parent().parent(); //row
		var elem = Toast.select.children().next(); //name
		var sum = elem.children().val();
		elem = elem.next().next(); //green;
		sum += '<br />' + elem.children().val();
		elem = elem.next(); //yellow
		sum += '<br />' + elem.children().val();
		elem = elem.next(); //red
		sum += '<br />' + elem.children().val();
		$("#summary").html(sum);
	});
	$('#time').click(function(){
		Toast.click();
	});
	$( "body" ).keypress(function( event ) {
		console.log(event.which);
		switch(event.which){
		case 13: //enter
			Toast.click();
			break;
		case 39: //double quote
			Toast.click();
			break;
		case 44: //commas
			$("#time").css('font-size', parseInt($("#time").css("font-size")) * 1.01);
			break;
		case 46: //period
			$("#time").css('font-size', parseInt($("#time").css("font-size")) * 0.99);
			break;
		case 91: //left brackt
			$("#time").css('padding-top', parseInt($("#time").css("padding-top")) + 1);
			break;
		case 93: //right brackt
			$("#time").css('padding-top', parseInt($("#time").css("padding-top")) - 1);
			break;
		case 49: //1
			Toast.displayColour(Toast.consts.INITIAL);
			break;
		case 50: //2
			Toast.displayColour(Toast.consts.GREEN);
			break;
		case 51: //3
			Toast.displayColour(Toast.consts.YELLOW);
			break;
		case 52: //4
			Toast.displayColour(Toast.consts.RED);
			break;
		case 53: //5
			$('#time').toggleClass('hide');
			break;
		}
	});
	
},

select: null,
timer: null,

init: function(consts){
	this.consts = consts;
	this.initTimerFunction();
	this.events();
	this.load();
	$("#time").css('font-size', 450);
}


}
