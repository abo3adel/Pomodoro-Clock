/* Helber functions */

/* add 0 to number if it less than 10 */
function pretty_time_string(num) {
	return ( num < 10 ? "0" : "" ) + num;
}

/* convert string into integer */
function getInt(str){
	var num = parseInt(str);
	return num > 0 ? num * 60 : 0;
}

/* timer countdown */
function get_elapsed_time_string(total_seconds) {

		  // get hours by dividing total_seconds on 3600
		  var hours = Math.floor(total_seconds / 3600);
		  total_seconds = total_seconds % 3600;

		  // get minutes by divideing total_seconds on 60
		  var minutes = Math.floor(total_seconds / 60);
		  total_seconds = total_seconds % 60;

		  // the rest of total_seconds is real seconds
		  var seconds = Math.floor(total_seconds);

		  // Pad the minutes and seconds with leading zeros, if required
		  hours = hours ? pretty_time_string(hours) + ":" : '';
		  minutes = pretty_time_string(minutes);
		  seconds = pretty_time_string(seconds);

		  // Compose the string for display
		  var currentTimeString = hours + minutes + ":" + seconds;

		  document.getElementById('countdown').innerHTML = currentTimeString;
		}

		/* run/stop/pause countdown fun */
		function Timer(callback, delay) {
			var timerId, start, remaining = delay;
			var state = 1; // 0=stoped, 1= resumed, 2= paused

			this.cancel = function(){
				window.clearInterval(timerId);
				// clear count down clock
				//document.getElementById('countdown').innerHTML = "00:00";
				state = 0;
			};

			this.pause = function() {
				this.cancel();
				remaining -= new Date() - start;
				state = 2;
			};

			this.resume = function() {
				// don`t resume if timer was stopped
				if(state){
					start = new Date();
					this.cancel();
					timerId = window.setInterval(callback, delay);
					state = 1;
				}
			};

			this.resume();
		}


		// jquery init
		$(document).ready(function(){
			var session_time = getInt($('input.session').val()), // get session length
				break_time = getInt($('input.break').val()), // get break length
				staticSes = session_time, // static session length to used in getting progress percentage
				start = 0,
				busy = 0,
				breaked = false,
				sound = new Audio("http://oringz.com/oringz-uploads/sounds-917-communication-channel.mp3"); // alert sound (use fcc example sound link)

			// create timer instance
			var timer = new Timer(function() {
				busy = true;

				// get progress percentage
				start = start + (100 / staticSes);

				// new instance === new value
				var xstart = Math.floor(start);

				// substract 1 from session_time
				session_time = session_time - 1;

				// check if no time left
				if(session_time <= 0){
					// if break length is done stop timer
					if(breaked){
						timer.cancel();
						busy = session_time = 0;
					}

					// start timer from the begging with break length
					session_time = break_time;
					staticSes = break_time;
					start = 0;
					breaked = true;
					$(".progress-bar").addClass("progress-bar-danger");
					$('.state').text('Break');
					sound.play(); // play alert sound
				}
				
				$(".progress-bar").css('height', xstart+"%");
				get_elapsed_time_string(session_time);
			}, 1000);

			// add changed class to input if it`s value changed
			$('input, .plus, .minus').on('change click', function(){
				$('input').addClass('changed');
			});

			// bind + btn click
			$(".plus").on('click touchstart', function(){
				if(busy){
					return false;
				}
				// get clicked btn id
				var id = $(this).attr('id');
				// get input whose class is that id
				var input = $("input." + id);
				
				// increment input val by 1
				input.val( parseInt(input.val()) + 1 );
			});

			// bind - btn click
			$(".minus").on('click touchstart', function(){
				if(busy){
					return false;
				}
				// get clicked btn id
				var id = $(this).attr('id');
				// get input whose class is that id
				var input = $("input." + id);
				
				// if input val less than or equal to 1 return 1
				// else substract 1 from input val
				val = parseInt(input.val()) > 1 ? parseInt(input.val()) - 1 : 1;

				input.val( val );
			});

			$(".trigger").on('click touchstart', function(e){
				e.preventDefault();

				// if timer was running  pause it
				if($(this).hasClass('resumed')){
					timer.pause();
					busy = 0;
				}
				else{
					if($('input').hasClass('changed')){ // if user changed (session/ break) length
						// reset every thing
						session_time = staticSes = getInt($('input.session').val()); // update session length
						break_time = getInt($('input.break').val()); // update break length
						start = breaked = 0;
						$('input').removeClass('changed');
						$('.progress-bar').removeClass('progress-bar-danger');
						$('.state').text('Session');// update state text to session
					}
					timer.resume();
				}
				$(this).toggleClass('resumed');
			});
		});