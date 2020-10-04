(function ($) {
  $.fn.jSunPicker = function (opts) {
    return this.each(function (index) {
      new jSunPicker(this, index, opts);
    });
  };

  function jSunPicker(element, index, opts) {
    this.element = $(element);
    var dataoptions = this.element.data();
    this.picker = $("<div class='sunpicker jsunpicker' />");

    // Setting default this.options
    this.options = $.extend(
      {
        language: "en-US",

        daysTitle: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        monthsTitle: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        dayShort: 2, // number of characters
        monthShort: 3, // number of characters
        showIcon: null, // path/to/calendar/icon, trigger picker on clicking the icon
        inline: null, // '#element-id',   | jQuery selector for the inline container - be sure to give a unique one
        startDay: 1, // Sunday = 1, Saturday = 7
        pickerType: "date", //  Available types: datetime (date+month+year+time), date, month, year, time - set the appropriate formats below
        displayFormat: "W, T d, Y H:N:S A", // translates to: Sunday, February 1, 1903 23:09:59  | default format: Y/m/d h:m:s  //
        outputFormat: "U", // translates to: 9-2-1975    |  default format: U
        // The following denotes the date and time notations for this script. Mix with the separators for your desired format
        // y - two digit year, Y - four digit year, m - month number without leading zero, M - month number with leading zero
        // t - month short text, T - month long text, d - date number without leading zero, D - date number with leading zero
        // h - hours without leading zero, H - hours with leading zero, a - meridian (am/pm), A - meridian (AM?PM)
        // n - minutes without leading zero, N - minutes with leading zero, s - seconds without leading zero,U - unix time
        // S - seconds with leading zero, w - day of the week short (dayShort), W - day of the week long, X - military time
        minDate: null, //  '2016/03/03', | '[date-string]'  in any text format except date first (not like d-m-y or d/mmm/yyyy)
        maxDate: null, //  '2016/03/23', | same as minDate
        minTime: null, //  '4:23:45 AM', | '[time-string]' in text format (like 4:23:45 PM)
        maxTime: null, //  '4:23:45 PM', | same as minTime
        disabledDays: null, //  '1,7' | Sun = 1, Sat = 7
        disabledDates: null, //  individual dates or date ranges separated by commas '2016/03/05,2016/03/10-2016/03/15'
        initialDate: null, //  '2016/3/14 12:21:23 PM',

        // and some event hooks:
        onShow: $.noop, // triggered when jsunpicker pops up
        onClose: $.noop, // triggered after jsunpicker is closed (destroyed)
        onSelect: $.noop, // triggered when a date is selected
      },
      opts,
      dataoptions
    );

    // Add events and triggers

    this.pickerElement = this.pickerElement();
    this.pickerInit = this.pickerElement.initElement;
    this.clone = this.pickerElement.clone;

    if (this.options.initialDate !== null && this.options.initialDate !== "") {
      this.initialDate = this.options.initialDate;
      this.select(this.initialDate);
    }

    if (this.options.inline) {
      this.render(this.options.pickerType, this.initialDate);
      this.picker.css({
        display: "inline-block",
        position: "relative",
        "z-index": "100",
      });
      $(this.options.inline).append(this.picker);
    } else {
      this.element.after(this.picker);
      this.picker.css(this.pickerPosition(this.pickerInit));
    }

    this.pickerInit.click(
      $.proxy(function () {
        this.options.inline == null ? this.picker.toggle() : "";
        this.render(
          this.options.pickerType,
          this.element.attr("data-selected-value")
        );
      }, this)
    );

    this.clone.change(
      $.proxy(function () {
        var selectedValue = this.formatDate(this.clone.val(), "Y/M/D H:N:S");
        this.select(selectedValue);
        this.render(this.options.pickerType, selectedValue);
      }, this)
    );

    this.picker.on(
      "click",
      ".prevButton, .titleButton, .nextButton",
      $.proxy(function (t) {
        var e = $(t.currentTarget);
        e.data("view") && e.data("nav")
          ? this.render(e.data("view"), e.data("nav"))
          : "";
      }, this)
    );

    this.picker.on(
      "click",
      ".year, .month",
      $.proxy(function (t) {
        var e = $(t.currentTarget);
        if (
          this.options.pickerType == "datetime" ||
          this.options.pickerType == "date"
        ) {
          e.data("view") && e.data("nav")
            ? this.render(e.data("view"), e.data("nav"))
            : "";
        } else {
          if (!e.hasClass("disabled")) {
            e.addClass("selected").siblings().removeClass("selected");
            var selectedValue = e.data("nav");
            this.select(selectedValue);
            this.picker.hide();
          }
        }
      }, this)
    );

    this.picker.on(
      "click",
      ".day, .otherday, .fav",
      $.proxy(function (t) {
        var e = $(t.currentTarget);
        if (!e.hasClass("disabled")) {
          e.addClass("selected").siblings().removeClass("selected");
          var selectedValue = e.data("nav");
          this.select(selectedValue);
          this.options.pickerType == "datetime"
            ? this.render("time", selectedValue)
            : this.options.inline == null
            ? this.picker.hide()
            : this.render(this.options.pickerType, selectedValue);
        }
      }, this)
    );

    this.picker.on(
      "change",
      ".time",
      $.proxy(function (t) {
        var e = $(t.currentTarget),
          x = e.find(".error"),
          b = e.find(".timeButton");
        var selectedValue =
          e.find(".hour").val() +
          ":" +
          e.find(".min").val() +
          ":" +
          e.find(".sec").val() +
          " " +
          (e.find(".ampm").is(":checked") ? "PM" : "AM");
        this.minMax(
          b.data("date") + selectedValue,
          b.data("date") + this.options.minTime,
          b.data("date") + this.options.maxTime
        )
          ? x.html("Invalid Time")
          : x.html("");
        b.data("nav", b.data("date") + selectedValue)
          .val(selectedValue)
          .text(selectedValue);
      }, this)
    );

    this.picker.on(
      "click",
      ".timeButton",
      $.proxy(function (t) {
        var e = $(t.currentTarget);
        t.preventDefault();
        var checktime = this.minMax(
          e.data("nav"),
          e.data("date") + this.options.minTime,
          e.data("date") + this.options.maxTime
        );
        if (
          ["datetime", "time"].indexOf(this.options.pickerType) != -1 &&
          !checktime
        ) {
          this.element.val(
            this.formatDate(e.data("nav"), this.options.outputFormat)
          );
          this.clone.val(
            this.formatDate(e.data("nav"), this.options.displayFormat)
          );
          this.options.inline == null
            ? this.picker.hide()
            : this.options.pickerType == "datetime"
            ? this.render("date", e.data("nav"))
            : "";
        }
      }, this)
    );
  }

  jSunPicker.prototype = {
    // Synthesize date components
    dateComponents: function (date) {
      var selectedDate = !!date
        ? Date.parse(date.replace(/-/g, "/"))
          ? new Date(Date.parse(date.replace(/-/g, "/")))
          : new Date()
        : new Date();

      var s = {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
        date: selectedDate.getDate(),
        day: selectedDate.getDay(),
        hours: selectedDate.getHours(),
        minutes: selectedDate.getMinutes(),
        seconds: selectedDate.getSeconds(),
      };
      return s;
    },
    // Determine date ranges
    dateRange: function (dates) {
      var range = [],
        members = dates.split(",");
      for (i = 0; i < members.length; i++) {
        if (members[i].search("-") >= 0) {
          var intervals = members[i].split("-");
          var startDate = new Date(intervals[0]);
          var endDate = new Date(intervals[1]);
          while (startDate <= endDate) {
            range.push(startDate.valueOf());
            startDate = new Date(startDate.setDate(startDate.getDate() + 1));
          }
        } else {
          range.push(new Date(members[i]).valueOf());
        }
      }
      return range;
    },
    // Determine min, max limits
    minMax: function (curVal, minVal, maxVal) {
      var disabled = false;
      if (curVal && minVal !== null) {
        new Date(curVal) - new Date(minVal) < 0
          ? (disabled = true)
          : (disabled = false);
      }

      if (curVal && maxVal !== null && !disabled)
        new Date(curVal) - new Date(maxVal) > 0
          ? (disabled = true)
          : (disabled = false);
      return disabled;
    },
    select: function (selectedValue) {
      this.element
        .attr("data-selected-Value", selectedValue)
        .val(this.formatDate(selectedValue, this.options.outputFormat));
      this.clone.val(
        this.formatDate(selectedValue, this.options.displayFormat)
      );
      if ($.isFunction(this.options.onSelect))
        this.options.onSelect(selectedValue);
    },
    destroy: function () {
      if (!this.picker) return;
      this.picker.remove();
      this.picker = null;
      if ($.isFunction(this.options.onClose)) this.options.onClose();
    },
    render: function (sView, sValue) {
      this.picker.html(this.renderCalendar(sView, sValue));
      if ($.isFunction(this.options.onShow)) this.options.onShow();
    },
    pickerElement: function () {
      this.clone = this.element
        .clone()
        .removeAttr("name")
        .attr("autocomplete", "off")
        .attr("id", this.element.attr("id") + "_clone");
      this.element.after(this.clone);
      if (this.options.showIcon != null)
        this.clone.after(
          (this.initElement = $(
            "<span class='calendarButton'><img src='" +
              this.options.showIcon +
              "' /></span>"
          ))
        );
      else this.initElement = this.clone;
      this.element.hide();
      return (pickerElement = {
        initElement: this.initElement,
        clone: this.clone,
        original: this.element,
      });
    },
    // Calculate position for picker. Returns object for use with css.
    pickerPosition: function () {
      var pickerInit = this.clone,
        pickerMargin, //	(this.options.showIcon) ? $('.calendarButton') : this.element;
        position = {
          left: pickerInit.offset().left,
          top: pickerInit.offset().top,
        },
        pickerHeight = this.picker.outerHeight(),
        lowerDifference = Math.abs(
          $(window).height() - position.top + pickerInit.outerHeight()
        );
      lowerDifference > pickerHeight
        ? (pickerMargin = { "margin-top": pickerInit.height })
        : (pickerMargin = { "margin-top": -1 * pickerHeight - 4 });
      return pickerMargin;
    },
    // Add leading zeroes
    leadZero: function (v) {
      return v < 10 ? "0" + v : v;
    },
    // Format date
    formatDate: function (date, format) {
      var fdate = this.dateComponents(date),
        formattedDate,
        mapVar = {
          d: fdate.date,
          D: this.leadZero(fdate.date), //	(fdate.date < 10) ? '0' + fdate.date : fdate.date,
          m: fdate.month + 1,
          M: this.leadZero(fdate.month + 1), //	((fdate.month+1) < 10) ? '0' + (fdate.month+1) : (fdate.month+1),
          t: this.options.monthsTitle[fdate.month].substring(
            0,
            this.options.monthShort
          ),
          T: this.options.monthsTitle[fdate.month],
          y: fdate.year.toString().substring(2, 2),
          Y: fdate.year,
          w: this.options.daysTitle[fdate.day].substring(
            0,
            this.options.dayShort
          ),
          W: this.options.daysTitle[fdate.day],
          h: format.match(/a/gi)
            ? fdate.hours % 12
              ? fdate.hours % 12
              : 12
            : fdate.hours, //	(format.match(/a/gi) && fdate.hours > 12) ? (fdate.hours-12) : fdate.hours,
          H: format.match(/a/gi)
            ? this.leadZero(fdate.hours % 12 ? fdate.hours % 12 : 12)
            : this.leadZero(fdate.hours), //	(format.match(/a/gi) && fdate.hours > 12) ? ((fdate.hours-12) < 10) ? '0' + (fdate.hours-12) : (fdate.hours-12) : (fdate.hours < 10) ? '0' +fdate.hours : fdate.hours,
          n: fdate.minutes,
          N: this.leadZero(fdate.minutes), //	(fdate.minutes < 10) ? '0' + fdate.minutes : fdate.minutes,
          s: fdate.seconds,
          S: this.leadZero(fdate.seconds), //	(fdate.seconds < 10) ? '0' + fdate.seconds : fdate.seconds,
          a: fdate.hours > 11 ? "pm" : "am",
          A: fdate.hours > 11 ? "PM" : "AM",
        },
        matchVar = new RegExp(Object.keys(mapVar).join("|"), "g");
      switch (format) {
        case "U":
          formattedDate = Date.UTC(
            fdate.year,
            fdate.month,
            fdate.date,
            fdate.hours,
            fdate.minutes,
            fdate.seconds
          );
          break;
        case "X":
          formattedDate = "HN".replace(matchVar, function (matched) {
            return mapVar[matched];
          });
          break;
        default:
          formattedDate = format.replace(matchVar, function (matched) {
            return mapVar[matched];
          });
          break;
      }
      return formattedDate;
    },
    // Build Title Button
    renderTitle: function (title, curView) {
      var curNav = "";
      ["datetime", "date"].indexOf(this.options.pickerType) == -1
        ? (curView = this.options.pickerType)
        : (curNav = this.selectedDate || this.currentYear + "/01/01");
      var button =
        "<div class='title titleButton' data-nav = '" +
        curNav +
        "' data-view = '" +
        curView +
        "'> " +
        title +
        " </div>" +
        "<div class='fav favButton' data-nav = '" +
        this.defaultValue +
        "' data-view = '" +
        curView +
        "'> &hearts; </div>";
      return button;
    },
    // Build Previous Button
    renderPrevious: function (prevVal, curView) {
      var button =
        "<div class='title prevButton' data-nav = '" +
        prevVal +
        "' data-view = '" +
        curView +
        "'>&lt;</div>";
      return button;
    },
    // Build Next Button
    renderNext: function (nextVal, curView) {
      var button =
        "<div class='title nextButton' data-nav = '" +
        nextVal +
        "' data-view = '" +
        curView +
        "'>&gt;</div>";
      return button;
    },
    // Build Date View
    renderMonth: function () {
      var firstDate = new Date(this.currentYear, this.currentMonth, 1),
        lastDate = new Date(this.currentYear, this.currentMonth + 1, 0),
        prevMonthLastDate = new Date(
          this.currentYear,
          this.currentMonth,
          0
        ).getDate(),
        firstDay = firstDate.getDay(),
        disabledDays,
        disabledDates,
        lastDay = lastDate.getDay(),
        prevVal,
        nextVal,
        curTitle =
          this.options.monthsTitle[this.currentMonth] + " " + this.currentYear;
      this.options.disabledDates !== null
        ? (disabledDates = this.dateRange(this.options.disabledDates))
        : (disabledDates = []);
      this.options.disabledDays !== null
        ? (disabledDays = this.options.disabledDays.split(","))
        : (disabledDays = []);

      switch (this.currentMonth) {
        case 0:
          prevVal = this.currentYear - 1 + "/12/1";
          nextVal = this.currentYear + "/" + (this.currentMonth + 2) + "/1";
          break;
        case 11:
          prevVal = this.currentYear + "/" + this.currentMonth + "/1";
          nextVal = this.currentYear + 1 + "/1/1";
          break;
        default:
          prevVal = this.currentYear + "/" + this.currentMonth + "/1";
          nextVal = this.currentYear + "/" + (this.currentMonth + 2) + "/1";
          break;
      }
      var arrDays =
        this.renderPrevious(prevVal, this.currentView) +
        this.renderTitle(curTitle, "month") +
        this.renderNext(nextVal, this.currentView);
      for (i = this.options.startDay - 1; i < this.options.startDay + 6; i++) {
        arrDays +=
          "<div class='title'>" +
          this.options.daysTitle[i % 7].substring(0, this.options.dayShort) +
          "</div>";
      }

      // Previous Month
      if (firstDay - (this.options.startDay - 1) !== 0) {
        for (k = (firstDay - this.options.startDay + 7) % 7; k >= 0; k--) {
          var fillDate = prevMonthLastDate - k,
            cls = Math.abs((k - firstDay) % 7);
          (curVal = !this.currentMonth
            ? this.currentYear - 1 + "/12/" + fillDate
            : this.currentYear + "/" + this.currentMonth + "/" + fillDate),
            (disabled = this.minMax(
              curVal,
              this.options.minDate,
              this.options.maxDate
            )
              ? "disabled"
              : $.inArray(new Date(curVal).valueOf(), disabledDates) > -1 ||
                $.inArray(cls + "", disabledDays) > -1
              ? "disabled"
              : "");
          arrDays +=
            "<div class='otherday day" +
            cls +
            " " +
            disabled +
            "' data-nav = '" +
            curVal +
            "'>" +
            fillDate +
            "</div>";
        }
      }

      // Current Month
      for (j = 1; j <= lastDate.getDate(); j++) {
        var selectedClass = "",
          cls = Math.abs((j + firstDay) % 7) || "7";
        curVal = this.currentYear + "/" + (this.currentMonth + 1) + "/" + j;
        var disabled = this.minMax(
          curVal,
          this.options.minDate,
          this.options.maxDate
        )
          ? "disabled"
          : $.inArray(new Date(curVal).valueOf(), disabledDates) > -1 ||
            $.inArray(cls + "", disabledDays) > -1
          ? "disabled"
          : "";
        j == this.currentDate
          ? (selectedClass = "selected")
          : (selectedClass = "");
        arrDays +=
          "<div class='day day" +
          cls +
          " " +
          selectedClass +
          " " +
          disabled +
          "' data-nav = '" +
          curVal +
          "'>" +
          j +
          "</div>";
      }

      // Next Month
      for (
        m = 1;
        m <=
        42 -
          lastDate.getDate() -
          ((firstDay - this.options.startDay + 1 + 7) % 7);
        m++
      ) {
        var cls = Math.abs((m + lastDay + 1 + 7) % 7) || "7",
          curVal =
            this.currentMonth == "11"
              ? this.currentYear + 1 + "/1/" + m
              : this.currentYear + "/" + (this.currentMonth + 2) + "/" + m,
          disabled =
            this.minMax(curVal, this.options.minDate, this.options.maxDate) ||
            $.inArray(new Date(curVal).valueOf(), disabledDates) >= 0 ||
            $.inArray(cls + "", disabledDays) > -1
              ? "disabled"
              : "";
        arrDays +=
          "<div class='otherday day" +
          cls +
          " " +
          disabled +
          "' data-nav = '" +
          curVal +
          "'>" +
          m +
          "</div>";
      }
      var selectedValue =
        this.currentDate +
        " " +
        this.options.monthsTitle[this.currentMonth].substring(
          0,
          this.options.monthShort
        ) +
        " " +
        this.currentYear;
      return arrDays;
    },
    // Build Year View
    renderYear: function () {
      var prevVal = this.currentYear - 1 + "/01/01",
        nextVal = this.currentYear + 1 + "/01/01",
        selectedClass,
        arrMonths =
          this.renderPrevious(prevVal, this.currentView) +
          this.renderTitle(this.currentYear, "year") +
          this.renderNext(nextVal, this.currentView);
      for (i = 0; i < 12; i++) {
        var curVal = this.currentYear + "/" + (i + 1) + "/1";
        i == this.currentMonth
          ? (selectedClass = "selected")
          : (selectedClass = "");
        arrMonths +=
          "<div class='month " +
          selectedClass +
          "' data-view = 'date' data-nav = '" +
          curVal +
          "'>" +
          this.options.monthsTitle[i].substring(0, this.options.monthShort) +
          "</div>";
      }
      return arrMonths;
    },
    // Build Decade View
    renderDecade: function () {
      var startDecade = this.currentYear - (this.currentYear % 20),
        selectedClass,
        prevVal = startDecade - 20 + "/01/01",
        nextVal = startDecade + 20 + "/01/01",
        curTitle = startDecade + " - " + (startDecade + 19),
        arrYears =
          this.renderPrevious(prevVal, this.currentView) +
          this.renderTitle(curTitle, "decade") +
          this.renderNext(nextVal, this.currentView);
      for (i = 0; i < 20; i++) {
        var curVal = startDecade + i + "/1/1";
        startDecade + i == this.currentYear
          ? (selectedClass = "selected")
          : (selectedClass = "");
        arrYears +=
          "<div class='year " +
          selectedClass +
          "' data-view = 'month' data-nav = '" +
          curVal +
          "'>" +
          (startDecade + i) +
          "</div>";
      }
      return arrYears;
    },
    // Build Time View
    renderTime: function () {
      var curTitle =
          this.options.monthsTitle[this.currentMonth] +
          " " +
          this.currentDate +
          ", " +
          this.currentYear,
        arrTime =
          this.renderPrevious("", this.currentView) +
          this.renderTitle(curTitle, "date") +
          this.renderNext("", this.currentView),
        pm = "",
        curVal = new Date(),
        d = new Date(this.selectedDate || curVal),
        h =
          curVal.getHours() > 12
            ? (curVal.getHours() - 12 < 10 ? "0" : "") +
              (curVal.getHours() - 12)
            : (curVal.getHours() < 10 && curVal.getHours() > 0 ? "0" : "") +
              (curVal.getHours() || 12),
        m = (curVal.getMinutes() < 10 ? "0" : "") + curVal.getMinutes(),
        s = (curVal.getSeconds() < 10 ? "0" : "") + curVal.getSeconds(),
        p = curVal.getHours() < 12 ? "AM " : "PM",
        curDate =
          d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " ",
        curTime = h + ":" + m + ":" + s + " " + p;
      curVal.getHours() > 12 ? (pm = "checked") : "";
      var terror = this.minMax(
        curDate + curTime,
        curDate + this.options.minTime,
        curDate + this.options.maxTime
      )
        ? "Invalid Time"
        : "";
      arrTime +=
        "<div class='time'><span class='error'>" +
        terror +
        "</span>" +
        "<div><input type='number' min='1' max='12' step='1' class='hour' value='" +
        h +
        "' /><label>:</label>" +
        "<input type='number' min='0' max='59'  step='1' class='min' value='" +
        m +
        "' /><label>:</label>" +
        "<input type='number' min='0' max='59' step='1' class='sec' value='" +
        s +
        "' /></div>" +
        "<p><input type='checkbox' class='ampm' value='pm' " +
        pm +
        ">PM</input></p>";
      arrTime +=
        "<p><button class='timeButton' data-view = 'time' data-date = '" +
        curDate +
        " ' data-nav = '" +
        curDate +
        curTime +
        "'>" +
        curTime +
        "</button></p></div>";
      return arrTime;
    },
    renderCalendar: function (curView, date) {
      this.selectedDate = date;
      var dateParts = this.dateComponents(date),
        disabledDays;
      this.options.disabledDays
        ? (disabledDays = this.options.disabledDays.split(","))
        : (disabledDays = []); //.map(Number);
      (this.defaultDate = new Date()),
        (this.defaultValue =
          this.defaultDate.getFullYear() +
          "/" +
          (this.defaultDate.getMonth() + 1) +
          "/" +
          this.defaultDate.getDate()),
        (this.currentDate = dateParts.date),
        (this.currentView = curView);
      (this.currentYear = dateParts.year),
        (this.currentMonth = dateParts.month);

      var pickerContent = $.proxy(function () {
        switch (this.currentView) {
          default:
          case "datetime":
            return this.renderMonth();
            break;
          case "date":
            return this.renderMonth();
            break;
          case "month":
            return this.renderYear();
            break;
          case "year":
            return this.renderDecade();
            break;
          case "time":
            return this.renderTime();
            break;
        }
      }, this);
      return pickerContent;
    },
  };
})(jQuery);
