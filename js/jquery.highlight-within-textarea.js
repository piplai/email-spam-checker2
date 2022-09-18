!(function (n) {
  function r(t, e) {
    this.init(t, e);
  }
  let s = "hwt";
  (r.prototype = {
    init: function (t, e) {
      (this.$el = t),
        "function" === this.getType(e) && (e = { highlight: e }),
        "custom" === this.getType(e)
          ? ((this.highlight = e), this.generate())
          : console.error("valid config object not provided");
    },
    getType: function (t) {
      var e = typeof t;
      if (!t) return "falsey";
      if (Array.isArray(t))
        return 2 === t.length &&
          "number" == typeof t[0] &&
          "number" == typeof t[1]
          ? "range"
          : "array";
      if ("object" == e) {
        if (t instanceof RegExp) return "regexp";
        if (t.hasOwnProperty("highlight")) return "custom";
      } else if ("function" == e || "string" == e) return e;
      return "other";
    },
    generate: function () {
      switch (
        (this.$el
          .addClass("hwt-input hwt-content")
          .on("input." + s, this.handleInput.bind(this))
          .on("scroll." + s, this.handleScroll.bind(this)),
        (this.$highlights = n("<div>", {
          class: "hwt-highlights hwt-content",
        })),
        (this.$backdrop = n("<div>", { class: s + "-backdrop" }).append(
          this.$highlights
        )),
        (this.$container = n("<div>", { class: s + "-container" })
          .insertAfter(this.$el)
          .append(this.$backdrop, this.$el)
          .on("scroll", this.blockContainerScroll.bind(this))),
        (this.browser = this.detectBrowser()),
        this.browser)
      ) {
        case "firefox":
          this.fixFirefox();
          break;
        case "ios":
          this.fixIOS();
      }
      (this.isGenerated = !0), this.handleInput();
    },
    detectBrowser: function () {
      let t = window.navigator.userAgent.toLowerCase();
      return -1 !== t.indexOf("firefox")
        ? "firefox"
        : t.match(/msie|trident\/7|edge/)
        ? "ie"
        : t.match(/ipad|iphone|ipod/) && -1 === t.indexOf("windows phone")
        ? "ios"
        : "other";
    },
    fixFirefox: function () {
      var t = this.$highlights.css([
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left",
        ]),
        e = this.$highlights.css([
          "border-top-width",
          "border-right-width",
          "border-bottom-width",
          "border-left-width",
        ]);
      this.$highlights.css({ padding: "0", "border-width": "0" }),
        this.$backdrop
          .css({
            "margin-top": "+=" + t["padding-top"],
            "margin-right": "+=" + t["padding-right"],
            "margin-bottom": "+=" + t["padding-bottom"],
            "margin-left": "+=" + t["padding-left"],
          })
          .css({
            "margin-top": "+=" + e["border-top-width"],
            "margin-right": "+=" + e["border-right-width"],
            "margin-bottom": "+=" + e["border-bottom-width"],
            "margin-left": "+=" + e["border-left-width"],
          });
    },
    fixIOS: function () {
      this.$highlights.css({
        "padding-left": "+=3px",
        "padding-right": "+=3px",
      });
    },
    handleInput: function () {
      var t = this.$el.val(),
        t = this.getRanges(t, this.highlight),
        t = this.removeStaggeredRanges(t),
        t = this.getBoundaries(t);
      this.renderMarks(t);
    },
    getRanges: function (t, e) {
      switch (this.getType(e)) {
        case "array":
          return this.getArrayRanges(t, e);
        case "function":
          return this.getFunctionRanges(t, e);
        case "regexp":
          return this.getRegExpRanges(t, e);
        case "string":
          return this.getStringRanges(t, e);
        case "range":
          return this.getRangeRanges(t, e);
        case "custom":
          return this.getCustomRanges(t, e);
        default:
          if (!e) return [];
          console.error("unrecognized highlight type");
      }
    },
    getArrayRanges: function (t, e) {
      e = e.map(this.getRanges.bind(this, t));
      return Array.prototype.concat.apply([], e);
    },
    getFunctionRanges: function (t, e) {
      return this.getRanges(t, e(t));
    },
    getRegExpRanges: function (t, e) {
      let i = [];
      for (
        var n;
        null !== (n = e.exec(t)) &&
        (i.push([n.index, n.index + n[0].length]), e.global);

      );
      return i;
    },
    getStringRanges: function (t, e) {
      let i = [],
        n = t.toLowerCase();
      var r = e.toLowerCase();
      let s = 0;
      for (; -1 !== (s = n.indexOf(r, s)); )
        i.push([s, s + r.length]), (s += r.length);
      return i;
    },
    getRangeRanges: function (t, e) {
      return [e];
    },
    getCustomRanges: function (t, e) {
      let i = this.getRanges(t, e.highlight);
      return (
        e.className &&
          i.forEach(function (t) {
            t.className
              ? (t.className = e.className + " " + t.className)
              : (t.className = e.className);
          }),
        i
      );
    },
    removeStaggeredRanges: function (t) {
      let i = [];
      return (
        t.forEach(function (e) {
          i.some(function (t) {
            return (e[0] > t[0] && e[0] < t[1]) != (e[1] > t[0] && e[1] < t[1]);
          }) || i.push(e);
        }),
        i
      );
    },
    getBoundaries: function (t) {
      let e = [];
      return (
        t.forEach(function (t) {
          e.push({ type: "start", index: t[0], className: t.className }),
            e.push({ type: "stop", index: t[1] });
        }),
        this.sortBoundaries(e),
        e
      );
    },
    sortBoundaries: function (t) {
      t.sort(function (t, e) {
        return t.index !== e.index
          ? e.index - t.index
          : "stop" === t.type && "start" === e.type
          ? 1
          : "start" === t.type && "stop" === e.type
          ? -1
          : 0;
      });
    },
    renderMarks: function (i) {
      let n = this.$el.val();
      i.forEach(function (t, e) {
        let i;
        (i =
          "start" === t.type
            ? "{{hwt-mark-start|" + e + "}}"
            : "{{hwt-mark-stop}}"),
          (n = n.slice(0, t.index) + i + n.slice(t.index));
      }),
        (n = (n = n.replace(/\n(\{\{hwt-mark-stop\}\})?$/, "\n\n$1"))
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")),
        (n = (n = (n =
          "ie" === this.browser ? n.replace(/ /g, " <wbr>") : n).replace(
          /\{\{hwt-mark-start\|(\d+)\}\}/g,
          function (t, e) {
            e = i[+e].className;
            return e ? '<mark class="' + e + '">' : "<mark>";
          }
        )).replace(/\{\{hwt-mark-stop\}\}/g, "</mark>")),
        this.$highlights.html(n);
    },
    handleScroll: function () {
      var t = this.$el.scrollTop(),
        t = (this.$backdrop.scrollTop(t), this.$el.scrollLeft());
      this.$backdrop.css("transform", 0 < t ? "translateX(" + -t + "px)" : "");
    },
    blockContainerScroll: function () {
      this.$container.scrollLeft(0);
    },
    destroy: function () {
      this.$backdrop.remove(),
        this.$el
          .unwrap()
          .removeClass("hwt-text hwt-input")
          .off(s)
          .removeData(s);
    },
  }),
    (n.fn.highlightWithinTextarea = function (i) {
      return this.each(function () {
        let t = n(this),
          e = t.data(s);
        if ("string" == typeof i)
          if (e)
            switch (i) {
              case "update":
                e.handleInput();
                break;
              case "destroy":
                e.destroy();
                break;
              default:
                console.error("unrecognized method string");
            }
          else console.error("plugin must be instantiated first");
        else e && e.destroy(), (e = new r(t, i)).isGenerated && t.data(s, e);
      });
    });
})(jQuery);
