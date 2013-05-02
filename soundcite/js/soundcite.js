$(document).ready(function () {
    // global vars
    var start;
    var end;
    var clips = [];

    // initialize SoundCloud SDK
    SC.initialize({
        client_id: "5ba7fd66044a60db41a97cb9d924996a",
    });

    // borrowing underscore.js bind function
    var bind = function(func, context) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function() {
          return func.apply(context, args.concat(slice.call(arguments)));
        };
    };

    // create clip constructor
    function Clip(el) {
        this.el = el;
        this.id = el.attributes['data-id'].value;
        this.start = el.attributes['data-start'].value;
        this.end = el.attributes['data-end'].value;
        this.playing = false;
        this.times_played = 0;
        SC.stream(this.id,bind(function(sound) {
            this.sound = sound;
            sound.load({
                onload: bind(this.sound_loaded, this)
            });
        }, this));
    };

    //clip methods
    Clip.prototype.sound_loaded = function() {
        $(this.el).addClass('soundcite-loaded');
        $(this.el).click(bind(this.click_handler, this));
        $(this.el).prepend('<i class="icon-play"></i> ');
    }

    Clip.prototype.click_handler = function() {
        //check for other playing clips and stop them
        for (i=0; i<clips.length; i++) {
            if (this.el !== clips[i].el) {
                clips[i].sound.stop();
                clips[i].playing = false;
                clips[i].sound.setPosition(clips[i].start);
                $(clips[i].el).find('i').removeClass('icon-pause');
                $(clips[i].el).find('i').addClass('icon-play');
            }
        }

        if (!this.playing) {
            this.play_clip();
        }
        else {
            this.pause_clip();
        }
    }

    Clip.prototype.play_clip = function() {
        if (this.times_played == 0 || this.sound.position > this.end) {
            this.sound.setPosition(this.start);
        }
        if (this.times_played > 0) {
            this.sound.setPosition(this.sound.position);
        }

        $(this.el).find('i').removeClass('icon-play');
        $(this.el).find('i').addClass('icon-pause');

        this.sound.play({
            whileplaying: bind(function() {
                this.track_progress();

                if (this.sound.position > this.end) {
                    $(this.el).find('i').removeClass('icon-pause');
                    $(this.el).find('i').addClass('icon-play');
                    this.sound.stop();
                    this.playing = false;
                }
            }, this),
        });
        this.playing = true;
        this.times_played++;
    }

    Clip.prototype.pause_clip = function() {
        $(this.el).find('i').removeClass('icon-pause');
        $(this.el).find('i').addClass('icon-play');
        this.playing = false;
        this.sound.pause();
    }

    Clip.prototype.track_progress = function() {
        var totalTime = this.end - this.start;
        var position = this.sound.position;
        var relative_position = position - this.start;
        var percentage = (relative_position / totalTime) * 100

        // change the css to customize your player

        $(this.el).css({
            'background' : '-webkit-linear-gradient(left, white, #ccc ' + percentage + '%, white)'
        });
    }

    // set up clips array
    var soundcite_array = $('.soundcite');
    for (i = 0; i < soundcite_array.length; i++) {
        clips.push(new Clip(soundcite_array[i]));
    }
    window.Clip = Clip;
    window.clips = clips;
});