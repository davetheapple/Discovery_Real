/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
    }
};

$(document).ready(function() {


	// --- "globals" ---
	
	// set main content panel to the height of the page
	$(".section").height($(document).height());
	
	
	// initialize search form
	var searchForm = $("#search");
	
	// search button, search text, list of results and the 
	// variable for the search data initialized upon completion
	// of the search in processSearch_complete
	var sText = $("#search_query");
	var resultsList = $(".result");
	var artistData, similarData;
	
	// keeps track of the specific track playing
	var trackPlaying = 0;
	
	// callbacks for searching by enter or by mouse click (button press)
	//$('#search').on('click', '.result', viewProfile);
	//sButton.on("click", processSearch);
	sText.on("keydown", processSearch);
	
	// propagate the play button event to the main search level
	/*$('#search').on('click', 'button', function(event) { 

		event.preventDefault();
		var id = $(event.toElement).closest('li').attr('id');
		play(id); 
	});*/
	//$("#loading").width(sText.width()*2);
	
	// variable used to start and stop the loading bar
	var isLoading = false;
	
	// animates the loading bar, nothing else
	function loading() {
		$( "#bar" ).animate({"margin-left": "101%"}, 2000, function(){
			$(this).css("margin-left", "-1%");
			
			if(isLoading) {
				loading();
			}
		});
	}
	
	// main search request processing
	function processSearch(event) {
		
		// handle event only if enter (13) is pressed OR if the 
		// search button is clicked and the query is not empty
		if ( event.which == 13 || event.type === 'click' && sText.val() != "") {
			event.preventDefault();
			clearPrevSearch();
			
			$(this).blur();
			
			// animation
			//sButton.animateRotate(360, 1000);
			//searchForm.animate({"top": "0em"}, 500);
			
			isLoading = true;
			
			// calls the search script on the server and retrieves search results
			$.ajax({
				type: 'POST',
				url: "http://franciscompany.org/discovery/search.php",
				data: { search_query: sText.val() },
				success: processSearch_complete,
				error: function(e) {
					console.log("There was an error in ajax 71.");
					console.debug(e);
					isLoading = false;
				}
			});
			loading();
			
		} else if(sText.val() == "" && event.which == 13 || event.type === 'click') {
			event.preventDefault();
			clearPrevSearch();
			$(".section").append("<p class='msg'>Oh dear, there's nothing there.</p>");
			$(".msg").css({"opacity": 0, "background-color": "#f5ea71"});
			$('.msg').animate({opacity: .85}, 500);
		}
	}
	
	// analyze and intepret the data then present it on the page
	function processSearch_complete(data) {
		
		artistData 	= 	JSON.parse( data.substring(0, data.indexOf("}true")+1) ).response;
		similarData = 	JSON.parse( data.substring(data.indexOf("}true")+5, data.lastIndexOf("}true")+1) ).response;
		console.debug(artistData);
		console.debug(similarData);

		// animate and display search status message
		//$('#opacity_bg').animate({"background-color": "rgba(255, 255, 255, .9)", "padding-top": "7em"}, 500);
		$(".section").append("<p class='msg'>Closest match: "+artistData.artists[0].name+".</p>");
		$(".msg").css("opacity", 0);
		$('.msg').animate({opacity: .85}, 500);
		
		var elem = $("<div class='result'><h2>"+artistData.artists[0].name+"</h2></div>");
		$(".section").append(elem);
		elem.css({opacity: 0, "margin-left": "100%", "background-image": "url("+artistData.artists[0].images[0].url+")"});
		var genText = "";
		var gen = artistData.artists[0].genres;
		var tot = $(gen).length;
		$(gen).each(function(i, v){
			genText += v.name + (tot - 1 != i ? ", " : "");
		});
		elem.append("<p class='genre'>"+genText+"</p>")
		
		$.each(similarData.artists, function(index, obj){
			
			var elem = $("<div class='result'><h2>"+obj.name+"</h2></div>");
			try{
				var imgurl = "";
				for(var i = 0; i < obj.images.length; i++) {
					imgurl = obj.images[i].url;
					
					console.log(imgurl);
					if(imgurl.indexOf("last.fm") < 0) {
						console.log("not last fm url, break");
						break;
					}
				}
				if($("<img/>").attr("src", imgurl).width() > 800) imgurl = "";
				elem.css({opacity: 0, "margin-left": "100%", "background-image": "url(" + imgurl + ")"});
			} catch (e) {
				console.debug(e);
			}

			var genres = obj.genres;
			var gText = "";
			var total = $(genres).length;
			$(genres).each(function(i, v){
				gText += v.name + (total - 1 != i ? ", " : "");
			});
			
			elem.append("<p class='genre'>"+gText+"</p>")

			$(".section").append(elem);

		});

		$('.genre').css("float", "left");
		(function delay(i){
			setTimeout(function() {
			$($(".result")[i]).animate({opacity: .85, "margin-left": "0%"}, 500);
			if(++i < $(".result").size()-1) delay(i);
			}, 200);
		})(0);
		//$('.result').each(function(i, o){ setTimeout(function(){ $(o).animate({opacity: .85, "margin-left": "0%"}, 500); }, 250)});
		
		isLoading = false;
	}
	
	function clearPrevSearch() {
		$(".msg").animate({opacity: 0, "margin-left": "-100%"}, 500, function(){ $(this).remove()});
		(function delay(i){
			setTimeout(function() {
			$($(".result")[i-1]).animate({opacity: 0, "margin-left": "-100%"}, 500, function(){ $(this).remove()});
			
			if(--i) delay(i);
			}, 100);
		})($(".result").size());
		//$(".result, .msg").animate({"margin-left": "-100%", opacity: 0}, 500, function(){ $(this).remove()});
	}

});
