# jSunPicker
A simplified jQuery date and time picker

## Why another Date picker?
There are numerous date, time pickers out there. However, each of those lack in one way or another. If they are feature-rich, they are bulky. If they are light-weight, they lack features. Some others which looked good are either abandoned or use jQuery UI!  Many lacked semantic declaration (declaring options as element attributes say, `data-` attribute) which is a deal breaker for me as most of my code is dynamically generated. Some good looking ones were so buggy that I wasted more time trying to debug than making use of it. I felt that things could be written simple and still be feature-rich. Thus was born this project.

## Features
jSunPicker has the following features:
* Light-weight - 12kb minified, 4kb gzipped
* Supports datetime, date, time, month and year picker
* Separate date and time formats for display and submit
* Dedicated &hearts; button for current date and time
* Semantic declaration - declare your options as javascript or as `data-` attributes or leave them at defaults
* Supports all output formats and most input formats (to manually enter the date in the input element)
* Date range restrictions - min-date, max-date and disable selected-dates (or ranges)
* Time restrictions - min-time, max-time
* Days restrictions - disable selective days (say, Sat & Sun)
* Standardized date input formats for options 
* Customizable Title strings (multi-language support)
* Customizable Start day (Monday can be your first day of the week)
* Inline calendar or trigger from text field or custom icon
* 9 gorgeous themes

## Dependencies
* [jQuery 1.8+](http://jquery.com/download/) 
* [jQuery.mousewheel](https://github.com/brandonaaron/jquery-mousewheel) for time scroll.

## Usage
Basic usage with default options

     $('selector').jSunPicker();

Specifying options in Javascript

     $('selector').jSunPicker({startDay:1, pickerType:'date', displayFormat:'m/d/Y'});

Semantic declaration (as selector's `data-` attributes)

**HTML:** Declare the options breaking with hiphens at camel-case characters like below. jQuery converts them to camel-case.

    <input id='datepicker' data-start-day = '1' data-picker-type = 'date' />

**JQuery:** Basic markup.  Any undeclared option will be substituted by the default values.

    $('#datepicker').jSunPicker();


For detailed information and demo, visit the Project page below. 

## Project Page
Project documentation and demo can be found here: [jSunPicker @Github](http://sunalive.github.io/jSunPicker/)

## Inspiration
Heavily inspired by [Will_pickdate() by TazSingh](http://tazsingh.github.io/will_pickdate/). Thanks TazSingh [@tazsingh](https://www.github.com/tazsingh/). I have been using that for more than a year but it has some serious bugs with min-max date restrictions. This has not been updated for a while and I also thought that the code could be lot simpler. So I borrowed the visual and navigation design (it was so beautiful) from that project and wrote my plugin from scratch.

## Authors and Contributors
Ravi Iyer [@sunalive](https://www.github.com/sunalive/). Fork or create a pull request if you wish to contribute.  Source code is heavily commented for your understanding.  

## License
[MIT License](https://tldrlegal.com/license/mit-license). Do whatever you wish.

## Support or Contact
Submit a bug if you find any. I will fix them whenever possible, no time commitment. Feel free to create a pull request if you can help fix any. 
