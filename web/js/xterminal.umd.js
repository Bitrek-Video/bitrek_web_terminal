/**
 *  XTerminal - v2.1.9
 *  @author Henry Hale
 *  @license MIT
 *  @url https://github.com/henryhale/xterminal
 */
!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = e())
    : "function" == typeof define && define.amd
    ? define(e)
    : ((t =
        "undefined" != typeof globalThis ? globalThis : t || self).XTerminal =
        e());
})(this, function () {
  "use strict";
  function t(t, e, n) {
    if ("function" == typeof t ? t === e : t.has(e))
      return arguments.length < 3 ? e : n;
    throw new TypeError("Private element is not present on this object");
  }
  function e(t, e, n) {
    return (
      (e = p(e)),
      (function (t, e) {
        if (e && ("object" == typeof e || "function" == typeof e)) return e;
        if (void 0 !== e)
          throw new TypeError(
            "Derived constructors may only return object or undefined"
          );
        return (function (t) {
          if (void 0 === t)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            );
          return t;
        })(t);
      })(
        t,
        i() ? Reflect.construct(e, n || [], p(t).constructor) : e.apply(t, n)
      )
    );
  }
  function n(e, n) {
    return e.get(t(e, n));
  }
  function r(e, n, r) {
    return e.set(t(e, n), r), r;
  }
  function i() {
    try {
      var t = !Boolean.prototype.valueOf.call(
        Reflect.construct(Boolean, [], function () {})
      );
    } catch (t) {}
    return (i = function () {
      return !!t;
    })();
  }
  function o(t) {
    var e = (function (t, e) {
      if ("object" != typeof t || !t) return t;
      var n = t[Symbol.toPrimitive];
      if (void 0 !== n) {
        var r = n.call(t, e || "default");
        if ("object" != typeof r) return r;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === e ? String : Number)(t);
    })(t, "string");
    return "symbol" == typeof e ? e : e + "";
  }
  function u(t) {
    return (
      (u =
        "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
          ? function (t) {
              return typeof t;
            }
          : function (t) {
              return t &&
                "function" == typeof Symbol &&
                t.constructor === Symbol &&
                t !== Symbol.prototype
                ? "symbol"
                : typeof t;
            }),
      u(t)
    );
  }
  function s(t, e) {
    if (!(t instanceof e))
      throw new TypeError("Cannot call a class as a function");
  }
  function a(t, e) {
    for (var n = 0; n < e.length; n++) {
      var r = e[n];
      (r.enumerable = r.enumerable || !1),
        (r.configurable = !0),
        "value" in r && (r.writable = !0),
        Object.defineProperty(t, o(r.key), r);
    }
  }
  function l(t, e, n) {
    return (
      e && a(t.prototype, e),
      n && a(t, n),
      Object.defineProperty(t, "prototype", { writable: !1 }),
      t
    );
  }
  function c(t, e, n) {
    return (
      (e = o(e)) in t
        ? Object.defineProperty(t, e, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (t[e] = n),
      t
    );
  }
  function f(t, e) {
    if ("function" != typeof e && null !== e)
      throw new TypeError("Super expression must either be null or a function");
    (t.prototype = Object.create(e && e.prototype, {
      constructor: { value: t, writable: !0, configurable: !0 },
    })),
      Object.defineProperty(t, "prototype", { writable: !1 }),
      e && v(t, e);
  }
  function p(t) {
    return (
      (p = Object.setPrototypeOf
        ? Object.getPrototypeOf.bind()
        : function (t) {
            return t.__proto__ || Object.getPrototypeOf(t);
          }),
      p(t)
    );
  }
  function v(t, e) {
    return (
      (v = Object.setPrototypeOf
        ? Object.setPrototypeOf.bind()
        : function (t, e) {
            return (t.__proto__ = e), t;
          }),
      v(t, e)
    );
  }
  function h(t) {
    var e = "function" == typeof Map ? new Map() : void 0;
    return (
      (h = function (t) {
        if (
          null === t ||
          !(function (t) {
            try {
              return -1 !== Function.toString.call(t).indexOf("[native code]");
            } catch (e) {
              return "function" == typeof t;
            }
          })(t)
        )
          return t;
        if ("function" != typeof t)
          throw new TypeError(
            "Super expression must either be null or a function"
          );
        if (void 0 !== e) {
          if (e.has(t)) return e.get(t);
          e.set(t, n);
        }
        function n() {
          return (function (t, e, n) {
            if (i()) return Reflect.construct.apply(null, arguments);
            var r = [null];
            r.push.apply(r, e);
            var o = new (t.bind.apply(t, r))();
            return n && v(o, n.prototype), o;
          })(t, arguments, p(this).constructor);
        }
        return (
          (n.prototype = Object.create(t.prototype, {
            constructor: {
              value: n,
              enumerable: !1,
              writable: !0,
              configurable: !0,
            },
          })),
          v(n, t)
        );
      }),
      h(t)
    );
  }
  function d() {
    return (
      (d =
        "undefined" != typeof Reflect && Reflect.get
          ? Reflect.get.bind()
          : function (t, e, n) {
              var r = (function (t, e) {
                for (
                  ;
                  !Object.prototype.hasOwnProperty.call(t, e) &&
                  null !== (t = p(t));

                );
                return t;
              })(t, e);
              if (r) {
                var i = Object.getOwnPropertyDescriptor(r, e);
                return i.get
                  ? i.get.call(arguments.length < 3 ? t : n)
                  : i.value;
              }
            }),
      d.apply(this, arguments)
    );
  }
  function y(t, e) {
    (null == e || e > t.length) && (e = t.length);
    for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
    return r;
  }
  function b(t, e) {
    var n =
      ("undefined" != typeof Symbol && t[Symbol.iterator]) || t["@@iterator"];
    if (!n) {
      if (
        Array.isArray(t) ||
        (n = (function (t, e) {
          if (t) {
            if ("string" == typeof t) return y(t, e);
            var n = Object.prototype.toString.call(t).slice(8, -1);
            return (
              "Object" === n && t.constructor && (n = t.constructor.name),
              "Map" === n || "Set" === n
                ? Array.from(t)
                : "Arguments" === n ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                ? y(t, e)
                : void 0
            );
          }
        })(t)) ||
        (e && t && "number" == typeof t.length)
      ) {
        n && (t = n);
        var r = 0,
          i = function () {};
        return {
          s: i,
          n: function () {
            return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
          },
          e: function (t) {
            throw t;
          },
          f: i,
        };
      }
      throw new TypeError(
        "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    }
    var o,
      u = !0,
      s = !1;
    return {
      s: function () {
        n = n.call(t);
      },
      n: function () {
        var t = n.next();
        return (u = t.done), t;
      },
      e: function (t) {
        (s = !0), (o = t);
      },
      f: function () {
        try {
          u || null == n.return || n.return();
        } finally {
          if (s) throw o;
        }
      },
    };
  }
  function m(t, e, n) {
    !(function (t, e) {
      if (e.has(t))
        throw new TypeError(
          "Cannot initialize the same private elements twice on an object"
        );
    })(t, e),
      e.set(t, n);
  }
  var g = new WeakMap(),
    w = (function () {
      return l(
        function t() {
          s(this, t),
            m(this, g, void 0),
            c(this, "isDisposed", void 0),
            (this.isDisposed = !1),
            r(g, this, []);
        },
        [
          {
            key: "register",
            value: function (t) {
              this.isDisposed ? null == t || t.dispose() : n(g, this).push(t);
            },
          },
          {
            key: "dispose",
            value: function () {
              this.isDisposed ||
                ((this.isDisposed = !0),
                n(g, this).forEach(function (t) {
                  return null == t ? void 0 : t.dispose();
                }));
            },
          },
        ]
      );
    })(),
    k = new WeakMap(),
    O = (function (t) {
      function i() {
        var t;
        return (
          s(this, i),
          m((t = e(this, i)), k, void 0),
          r(k, t, { stack: [], store: new Map() }),
          t.register({
            dispose: function () {
              return n(k, t).store.clear();
            },
          }),
          t
        );
      }
      return (
        f(i, t),
        l(i, [
          {
            key: "on",
            value: function (t, e) {
              var r,
                i = n(k, this).store;
              i.has(t)
                ? null === (r = i.get(t)) || void 0 === r || r.add(e)
                : i.set(t, new Set([e]));
            },
          },
          {
            key: "once",
            value: function (t, e) {
              var r,
                i = this,
                o = function n() {
                  for (
                    var r = arguments.length, o = new Array(r), u = 0;
                    u < r;
                    u++
                  )
                    o[u] = arguments[u];
                  e.call.apply(e, [void 0].concat(o)), i.off(t, n);
                },
                u = n(k, this).store;
              u.has(t)
                ? null === (r = u.get(t)) || void 0 === r || r.add(o)
                : u.set(t, new Set([o]));
            },
          },
          {
            key: "off",
            value: function (t, e) {
              var r = n(k, this).store.get(t);
              if (r) {
                var i,
                  o = b(r);
                try {
                  for (o.s(); !(i = o.n()).done; ) {
                    if (i.value === e) {
                      r.delete(e);
                      break;
                    }
                  }
                } catch (t) {
                  o.e(t);
                } finally {
                  o.f();
                }
              }
            },
          },
          {
            key: "emit",
            value: function (t) {
              if (!this.isDisposed) {
                var e = n(k, this).stack;
                if (!e.includes(t)) {
                  var r = n(k, this).store.get(t);
                  if (r) {
                    e.push(t);
                    for (
                      var i = arguments.length,
                        o = new Array(i > 1 ? i - 1 : 0),
                        u = 1;
                      u < i;
                      u++
                    )
                      o[u - 1] = arguments[u];
                    var s,
                      a = b(r);
                    try {
                      for (a.s(); !(s = a.n()).done; ) {
                        var l = s.value;
                        l.call.apply(l, [void 0].concat(o));
                      }
                    } catch (t) {
                      a.e(t);
                    } finally {
                      a.f();
                    }
                    e.pop();
                  }
                }
              }
            },
          },
        ])
      );
    })(w),
    T = Array.isArray;
  function E(t) {
    return "object" === u(t) && null !== t;
  }
  function j(t) {
    return "function" == typeof t;
  }
  var A = (function () {
      return l(
        function t() {
          var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          s(this, t),
            c(this, "store", void 0),
            c(this, "ptr", void 0),
            (this.store = T(e) ? e : []),
            (this.ptr = -1);
        },
        [
          {
            key: "size",
            get: function () {
              return this.store.length;
            },
          },
          {
            key: "list",
            get: function () {
              return [].slice.call(this.store).reverse();
            },
          },
          {
            key: "add",
            value: function (t) {
              t && t !== this.store[0] && this.store.unshift(t),
                (this.ptr = -1);
            },
          },
          {
            key: "previous",
            get: function () {
              return (
                this.ptr++,
                this.ptr >= this.size && (this.ptr = this.size - 1),
                this.store[this.ptr] || ""
              );
            },
          },
          {
            key: "next",
            get: function () {
              return (
                this.ptr--,
                this.ptr <= -1 && (this.ptr = -1),
                this.store[this.ptr] || ""
              );
            },
          },
          {
            key: "clear",
            value: function () {
              this.store.splice(0);
            },
          },
        ]
      );
    })(),
    M = "&nbsp;",
    x = "xt",
    S = "xt-inactive",
    L = "xt-cursor",
    P = "xt-stdout",
    H = "xt-stdin";
  function C(t) {
    // t &&
    //   t.scrollTop + t.clientHeight >= t.scrollHeight &&
    //   t.scrollTo(0, t.scrollHeight);
  }
  function D(t, e) {
    var n = document.createElement(t);
    return E(e)
      ? (null != e && e.id && (n.id = e.id || ""),
        null != e && e.class && (n.className = e.class || ""),
        null != e &&
          e.content &&
          n.appendChild(document.createTextNode("" + e.content)),
        null != e && e.html && (n.innerHTML = e.html),
        T(null == e ? void 0 : e.children) &&
          e.children.forEach(function (t) {
            return n.append(t);
          }),
        E(null == e ? void 0 : e.props) &&
          Object.entries(e.props).forEach(function (t) {
            return n.setAttribute(t[0], t[1]);
          }),
        n)
      : n;
  }
  function K() {
    return (
      "" + (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "")
    )
      .replace(/(\n)|(\n\r)|(\r\n)/g, "<br/>")
      .replace(/\s{2}/g, M.repeat(2))
      .replace(/\t/g, M.repeat(4));
  }
  var F = (function () {
      return l(
        function t(e) {
          s(this, t),
            c(this, "el", void 0),
            c(this, "console", void 0),
            c(this, "lastOutput", void 0),
            c(this, "onoutput", void 0);
          var n = (function (t) {
              var e = D("span"),
                n = D("div", { class: P, children: [e] });
              return t.appendChild(n), { outputBox: n, consoleBox: e };
            })(e),
            r = n.outputBox,
            i = n.consoleBox;
          (this.el = r), (this.console = i);
        },
        [
          {
            key: "write",
            value: function (t, e) {
              (this.lastOutput = D("span", { html: K(t) })),
                this.console.appendChild(this.lastOutput),
                j(this.onoutput) && this.onoutput(),
                j(e) && e();
            },
          },
          {
            key: "clear",
            value: function () {
              this.console && (this.console.innerHTML = "");
            },
          },
          {
            key: "clearLast",
            value: function () {
              var t;
              this.lastOutput &&
                (null === (t = this.lastOutput.parentNode) ||
                  void 0 === t ||
                  t.removeChild(this.lastOutput));
              this.lastOutput = void 0;
            },
          },
        ]
      );
    })(),
    I = "Enter";
  function _(t, e, n, r) {
    t.addEventListener(e, n, r);
    var i = !1;
    return {
      dispose: function () {
        i || (t.removeEventListener(e, n, r), (i = !0));
      },
    };
  }
  var R,
    B = 0;
  function N(t) {
    for (
      var e = arguments.length, n = new Array(e > 1 ? e - 1 : 0), r = 1;
      r < e;
      r++
    )
      n[r - 1] = arguments[r];
    return setTimeout.apply(void 0, [t, B].concat(n));
  }
  function z(t) {
    var e;
    return function () {
      if (j(t)) {
        clearTimeout(e);
        for (var n = arguments.length, r = new Array(n), i = 0; i < n; i++)
          r[i] = arguments[i];
        e = N.apply(void 0, [t].concat(r));
      }
    };
  }
  function V(t) {
    var e = new Set(),
      n = !1;
    return {
      get value() {
        return !n && j(R) && e.add(R), t;
      },
      set value(r) {
        (t = r),
          n ||
            e.forEach(function (t) {
              return t.call(void 0);
            });
      },
      dispose: function () {
        n || ((n = !0), e.clear());
      },
    };
  }
  function W(t) {
    if (j(t)) {
      R = t;
      try {
        t.call(void 0);
      } finally {
        R = null;
      }
    }
  }
  var q = (function (t) {
    function n(t) {
      var r;
      s(this, n),
        c((r = e(this, n)), "el", void 0),
        c(r, "buffer", void 0),
        c(r, "data", void 0),
        c(r, "ptr", void 0),
        c(r, "isActive", void 0),
        c(r, "showInput", void 0),
        c(r, "isFocused", void 0),
        c(r, "onkeypress", void 0),
        (r.el = (function (t) {
          var e = D("input", {
              props: {
                spellcheck: !1,
                autocapitalize: "off",
                autocomplete: "off",
              },
            }),
            n = D("div", { class: H, children: [e] });
          return t.appendChild(n), e;
        })(t)),
        (r.buffer = ""),
        (r.data = V("")),
        (r.ptr = V(0)),
        (r.isActive = V(!0)),
        (r.showInput = V(!0)),
        (r.isFocused = V(!1)),
        r.register(r.data),
        r.register(r.ptr),
        r.register(r.isActive),
        r.register(r.showInput),
        r.register(r.isFocused);
      var i = function () {
          return (
            (t = r.el),
            (e = r.data),
            (n = r.ptr),
            (o = "selectionStart" in (i = t) ? i.selectionStart : 0),
            (u = e.value.length),
            o > u ? (o = u) : o < 0 && (o = 0),
            void (n.value = o)
          );
          var t, e, n, i, o, u;
        },
        o = z(i),
        u = z(function () {
          r.data.value = r.buffer = r.el.value;
        });
      return (
        W(i),
        r.register(
          _(r.el, "blur", function () {
            return (r.isFocused.value = !1);
          })
        ),
        r.register(
          _(
            r.el,
            "focus",
            function () {
              return (r.isFocused.value = !0);
            },
            !1
          )
        ),
        r.register(
          _(
            r.el,
            "keyup",
            function () {
              return r.isActive.value && o();
            },
            !1
          )
        ),
        r.register(
          _(r.el, "input", function () {
            u(), o();
          })
        ),
        r.register(
          _(r.el, "keydown", function (t) {
            t.stopImmediatePropagation();
            var e = r.data.value;
            t.key === I &&
              (r.el && (r.el.value = ""),
              (r.data.value = ""),
              (r.buffer = ""),
              (r.showInput.value = !0)),
              r.isActive.value &&
                j(r.onkeypress) &&
                (r.onkeypress({
                  key: t.key,
                  altKey: t.altKey,
                  ctrlKey: t.ctrlKey,
                  metaKey: t.metaKey,
                  shiftKey: t.shiftKey,
                  value: e,
                  cancel: function () {
                    t.preventDefault(), t.stopPropagation();
                  },
                }),
                o());
          })
        ),
        r
      );
    }
    return (
      f(n, t),
      l(n, [
        {
          key: "blur",
          value: function () {
            this.el && this.el.blur();
          },
        },
        {
          key: "focus",
          value: function () {
            this.el && this.el.focus();
          },
        },
        {
          key: "pause",
          value: function () {
            this.isActive.value = !1;
          },
        },
        {
          key: "resume",
          value: function () {
            this.isActive.value = !0;
          },
        },
        {
          key: "setValue",
          value: function (t) {
            (t = t || this.buffer),
              this.el && (this.el.value = t),
              (this.data.value = t);
          },
        },
        {
          key: "pipe",
          value: function (t) {
            var e,
              n = this,
              r = D("span"),
              i = D("span", { class: L, html: M }),
              o = D("span");
            null === (e = t.el) || void 0 === e || e.append(r, i, o),
              W(function () {
                var t = n.ptr.value,
                  e = n.data.value;
                if (!n.isActive.value || !n.showInput.value)
                  return (
                    (r.innerHTML = ""),
                    (i.innerHTML = M),
                    void (o.innerHTML = "")
                  );
                (r.innerHTML = e.substring(0, t).replace(/\s{2}/g, " " + M)),
                  (i.innerHTML = e.substring(t, t + 1).trim() || M),
                  (o.innerHTML = e.substring(t + 1).replace(/\s{2}/g, " " + M));
              });
          },
        },
      ])
    );
  })(w);
  function U(t, e) {
    var n,
      r,
      i = D("div", { class: x, props: { tabindex: 0 } }),
      o = new A(),
      u = new F(i),
      s = new q(i),
      a = {
        input: s,
        output: u,
        history: o,
        completer: function (t) {
          return t;
        },
      };
    return (
      s.pipe(u),
      (u.onoutput = function () {
        return C(i);
      }),
      t.register(
        _(i, "keydown", function (t) {
          s.focus(),
            N(function () {
              s.el.dispatchEvent(new KeyboardEvent("keydown", t)),
                s.el.dispatchEvent(new KeyboardEvent("input", t));
            });
        })
      ),
      t.register(
        _(i, "focus", function () {
          return (s.isFocused.value = !0);
        })
      ),
      t.register(
        _(i, "blur", function () {
          return (s.isFocused.value = !1);
        })
      ),
      (n = window || {}),
      (r = navigator || {}),
      ("ontouchstart" in n || r.maxTouchPoints) &&
        /Mobi/.test(r.userAgent) &&
        t.register(_(i, "click", s.focus.bind(s))),
      e.appendChild(i),
      (s.onkeypress = function (e) {
        e.key == I
          ? (e.cancel(),
            o.add(e.value),
            t.writeln(e.value),
            t.emit("data", e.value))
          : "Tab" == e.key
          ? (e.cancel(), j(a.completer) && s.setValue(a.completer(e.value)))
          : "ArrowDown" == e.key
          ? (e.cancel(), s.setValue(o.next))
          : "ArrowUp" == e.key
          ? (e.cancel(), s.setValue(o.previous))
          : t.emit("keypress", e),
          C(i);
      }),
      W(function () {
        s.isFocused.value ? i.classList.remove(S) : i.classList.add(S);
      }),
      a
    );
  }
  var X = (function (t) {
      function n(t) {
        var r;
        return (
          s(this, n),
          ((r = e(this, n, [(t = "[x] " + t)])).name = "XTerminalError"),
          r
        );
      }
      return f(n, t), l(n);
    })(h(Error)),
    $ = new WeakMap();
  return (function (t) {
    function i(t) {
      var n;
      return (
        s(this, i),
        m((n = e(this, i)), $, void 0),
        c(n, "isMounted", void 0),
        (n.isMounted = !1),
        t && null != t && t.target && n.mount(t.target),
        n
      );
    }
    return (
      f(i, t),
      l(
        i,
        [
          {
            key: "focus",
            value: function () {
              n($, this).input.focus();
            },
          },
          {
            key: "blur",
            value: function () {
              n($, this).input.blur();
            },
          },
          {
            key: "pause",
            value: function () {
              n($, this).input.pause(), this.emit("pause");
            },
          },
          {
            key: "resume",
            value: function () {
              n($, this).input.resume(), this.emit("resume");
            },
          },
          {
            key: "write",
            value: function (t, e) {
              n($, this).output.write("" + t, e);
            },
          },
          {
            key: "writeln",
            value: function (t, e) {
              n($, this).output.write(t + "\n", e);
            },
          },
          {
            key: "clear",
            value: function () {
              n($, this).output.clear(), this.emit("clear");
            },
          },
          {
            key: "clearLast",
            value: function () {
              n($, this).output.clearLast();
            },
          },
          {
            key: "history",
            get: function () {
              return n($, this).history.list || [];
            },
            set: function (t) {
              var e = this;
              t.forEach(function (t) {
                return n($, e).history.add(t);
              });
            },
          },
          {
            key: "clearHistory",
            value: function () {
              n($, this).history.clear();
            },
          },
          {
            key: "setCompleter",
            value: function (t) {
              j(t) && (n($, this).completer = t);
            },
          },
          {
            key: "mount",
            value: function (t) {
              if (!this.isMounted) {
                if (
                  (t && "string" == typeof t && (t = document.querySelector(t)),
                  !(t instanceof HTMLElement))
                )
                  throw new X(
                    "mount: A parent HTMLElement (target) is required"
                  );
                !t.isConnected &&
                  console &&
                  console.warn(
                    "'mount' was called on an HTMLElement (target) that is not attached to DOM."
                  ),
                  (t.innerHTML = ""),
                  r($, this, U(this, t)),
                  (this.isMounted = !0);
              }
            },
          },
          {
            key: "dispose",
            value: function () {
              var t;
              d(p(i.prototype), "dispose", this).call(this);
              var e = n($, this);
              e.history.clear(), (e.completer = void 0), e.input.dispose();
              var r = e.output.el.parentNode;
              null == r ||
                null === (t = r.parentNode) ||
                void 0 === t ||
                t.removeChild(r);
            },
          },
        ],
        [
          {
            key: "version",
            get: function () {
              return "2.1.9";
            },
          },
        ]
      )
    );
  })(O);
});
