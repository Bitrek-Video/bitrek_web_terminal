"use strict";

class TermManager {
  constructor(
    containerId,
    timeFormat = "<span class='text-muted'>[%H:%M:%S]</span>",
    prompts = {
      user: "&gt; ",
      root: "# ",
      system: "% ",
      answer: "&lt; ",
    },
    welcomeMessage = [
      "<b>Welcome to the <a href='https://bitrek.video' target='_blank'>Bitrek</a> Serial Terminal!</b>\n ",
      "Use the <kbd>↑</kbd> and <kbd>↓</kbd> keys to navigate in history, <kbd>Enter</kbd> to submit and <kbd>TAB</kbd> key to autocomplete commands.",
      "Use command <span class='term-command text-link' data-command='//help'>//help</span> to get a list of available commands.\n",
    ],
    showCopyButton = true
  ) {
    this.term = new XTerminal();
    this.term.mount(document.getElementById(containerId));
    this.terminalWrapper = this.terminalWrapper.bind(this);
    this.term.onInput = (data) => this.terminalWrapper(data);
    this.term.focus();
    this.timeFormat = timeFormat;
    this.prompts = prompts;
    this.welcomeMessage = welcomeMessage;
    this.containerId = containerId;
    this.showCopyButton = showCopyButton;

    this.areConnected = false;

    this._registerLinks();
    this._registerAutoComplete();

    if (this.showCopyButton) {
      this._registerCopyButton();
    }

    this.timeUnderUpdate = false;
    if (this.timeFormat.length > 0) {
      this.timeUnderUpdate = true;
      setInterval(() => this._updateTime(), 500);
    }
  }

  /**
   * Prints the welcome message in the terminal.
   *
   * If the welcome message is an array, it will be iterated and printed
   * line by line. If it is a string, it will be printed as a single line.
   * If it is undefined or null, nothing will be printed.
   */
  showWelcomeMessage() {
    switch (true) {
      case Array.isArray(this.welcomeMessage):
        for (let i = 0; i < this.welcomeMessage.length; i++) {
          this.echo(
            this.prompts.system,
            this.welcomeMessage[i],
            true,
            false,
            true
          );
        }
        break;
      case typeof this.welcomeMessage === "string":
        this.echo(this.prompts.system, this.welcomeMessage, true, false, true);
        break;
      case !this.welcomeMessage:
      default:
        break;
    }
  }

  /**
   * Updates all elements with the class `update-time-auto` with the current
   * time formatted according to the `timeFormat` option.
   *
   * @private
   */
  _updateTime() {
    const selector = document.getElementsByClassName("update-time-auto");
    for (let i = 0; i < selector.length; i++) {
      selector[i].innerHTML = this.formatTime();
    }
  }

  /**
   * Registers an event listener on the terminal container to catch clicks on
   * elements with the class `term-command`. When such an element is clicked,
   * the `data-command` attribute of the element is used to simulate a write
   * to the terminal.
   *
   * @private
   */
  _registerLinks() {
    const terminalObj = document.getElementById(this.containerId);
    terminalObj.addEventListener("click", (event) => {
      const target = event.target;
      if (target.matches(".term-command")) {
        this.simulateWrite(target.dataset.command);
      }
    });
  }

  /**
   * Registers an event listener on the terminal container to catch clicks on
   * elements with the class `copy-button`. When such an element is clicked,
   * the `data-clipboard-text` attribute of the element is used to copy the text
   * to the clipboard, after removing any HTML tags.
   *
   * @private
   */
  _registerCopyButton() {
    const terminalObj = document.getElementById(this.containerId);
    terminalObj.addEventListener("click", (event) => {
      const target = event.target;
      if (target.matches(".copy-button")) {
        const areDisabled = target.getAttribute("data-disabled");
        if (areDisabled) {
          return;
        }
        let toCopy = target.getAttribute("data-clipboard-text");
        toCopy = toCopy.replace(/<[^>]*>/g, "");
        this._copyTextToClipboard(toCopy);
        target.innerText = "✅";
        setTimeout(() => {
          target.innerText = "📋";
        }, 4000);
      }
    });
  }

  /**
   * Registers an autocomplete completer on the terminal. The completer will
   * complete any of the following commands with the shortest matching prefix
   * when the TAB key is pressed:
   *
   * - //help
   * - //connect
   * - //disconnect
   * - //clear
   *
   * @private
   */
  _registerAutoComplete() {
    this.term.setCompleter((data) => {
      const options = ["//help", "//connect", "//disconnect", "//clear"];
      return options.filter((s) => s.startsWith(data))[0] || "";
    });
    document
      .getElementById(this.containerId)
      .addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault(); // do not focust next window element
        }
      });
  }

  /**
   * Copies the given text to the clipboard. This is a fallback for browsers
   * that do not support the modern `navigator.clipboard` API.
   *
   * This function creates a temporary `textarea` element, sets its value to
   * the given text, and then uses the `execCommand("copy")` command to copy
   * the text to the clipboard. It then removes the temporary `textarea`
   * element from the page.
   *
   * @param {string} text The text to copy to the clipboard.
   *
   * @private
   */
  _fallbackCopyTextToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      let successful = document.execCommand("copy");
      let msg = successful ? "successful" : "unsuccessful";
      console.log("Fallback: Copying text command was " + msg);
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
  }

  /**
   * Copies the given text to the clipboard using the modern
   * `navigator.clipboard` API. If the API is not supported, it falls back to
   * the `_fallbackCopyTextToClipboard` function.
   *
   * @param {string} text The text to copy to the clipboard.
   *
   * @private
   */
  _copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this._fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  }

  /**
   * Returns a string representing the current time, formatted according to the
   * TermManager's `timeFormat` property.
   *
   * The time format string may contain any of the following placeholders:
   * - `%H`: hours in 24-hour format (00-23)
   * - `%I`: hours in 12-hour format (01-12)
   * - `%p`: AM/PM
   * - `%M`: minutes (00-59)
   * - `%S`: seconds (00-59)
   * - `%d`: day of the month (01-31)
   * - `%m`: month (01-12)
   * - `%Y`: year (four digits)
   * - `%mmm`: milliseconds (000-999)
   * - `%mm`: tens of milliseconds (00-99)
   *
   * If `timeFormat` is not set, this function will return an empty string.
   *
   * @returns {string} The formatted time string.
   */
  formatTime() {
    const format = this.timeFormat;
    if (!format) {
      return "";
    }

    const date = new Date();
    const pad = (num) => String(num).padStart(2, "0");
    const pad3 = (num) => String(num).padStart(3, "0");
    const hours24 = pad(date.getHours());
    const hours12 = pad(date.getHours() % 12 || 12);
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const year = date.getFullYear();
    const ampm = date.getHours() < 12 ? "AM" : "PM";
    const miliseconds = pad3(date.getMilliseconds());
    const tensOfMilliseconds = pad(date.getMilliseconds() % 100);

    const formattedTime = format
      .replace("%H", hours24)
      .replace("%I", hours12)
      .replace("%p", ampm)
      .replace("%M", minutes)
      .replace("%S", seconds)
      .replace("%d", day)
      .replace("%Y", year)
      .replace("%mmm", miliseconds)
      .replace("%mm", tensOfMilliseconds)
      .replace("%m", month);

    return formattedTime + " ";
  }

  /**
   * Writes the provided data to the terminal, optionally appending the current time.
   *
   * @param {string} prompter - The prompt to display before the data (like %, >, #, <).
   * @param {string} data - The data to be displayed in the terminal.
   * @param {boolean} [line=true] - A flag indicating whether to write the data on a new line (default) or not.
   * @param {boolean} [ignoreTime=false] - A flag indicating whether to ignore the current time (default) or not.
   * @param {boolean} [hideCopyButton=false] - A flag indicating whether to hide the copy button (default) or not.
   * @param {boolean} [autoUpdateTime=false] - A flag indicating whether to automatically update the time (default) or not.
   */
  echo(
    prompter,
    data,
    line = true,
    ignoreTime = false,
    hideCopyButton = false,
    autoUpdateTime = false
  ) {
    const originalData = data;
    data = prompter + data;
    if (!ignoreTime) {
      if (autoUpdateTime) {
        data =
          "<span class='update-time-auto'>" +
          this.formatTime() +
          "</span>" +
          data;
      } else {
        data = this.formatTime() + data;
      }
    }
    let needShowCopyButton = this.showCopyButton;
    if (needShowCopyButton) {
      const copyButton = document.createElement("span");
      copyButton.classList.add("copy-button");
      if (hideCopyButton) {
        copyButton.setAttribute("data-disabled", "true");
        copyButton.classList.add("full-transparent");
      }
      copyButton.textContent = "📋";
      copyButton.setAttribute("data-clipboard-text", originalData);
      data = copyButton.outerHTML + data;
    }
    if (line) {
      this.term.writeln(data);
    } else {
      this.term.write(data);
    }
  }

  /**
   * Prints the specified number of empty lines to the terminal.
   *
   * @param {number} [count=1] - The number of empty lines to print.
   */
  emptyLine(count = 1) {
    while (count-- > 0) {
      this.term.writeln("");
    }
  }

  /**
   * Clears the terminal and prompts the user for input.
   */
  terminalClear() {
    this.term.clear();
    this.ask();
  }

  /**
   * Writes help information to the terminal.
   *
   * @private
   */
  terminalHelp() {
    this.emptyLine();
    this.echo(
      this.prompts.system,
      "<i>All raw input is sent to the serial port. Below is a list of available <b>terminal</b> commands:</i>",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//clear'>//clear</span> - Clear the terminal",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//help'>//help</span> - Display this message",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//disconnect'>//disconnect</span> - Disconnect from the serial port",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//connect 115200 8 1 none 1024 none'>//connect</span> [baud_rate=115200] [data_bits=8] [stop_bits=1] [parity=none] [buf_size=1024] [flow_control=none] - Connect to the serial port",
      true,
      false,
      true
    );
    this.emptyLine();
    this.ask();
  }

  /**
   * Writes normal output to the terminal.
   * @param {string} data - The output message to display.
   */
  terminalWriteOutput(data) {
    this.term.clearLast();
    this.echo(
      this.prompts.answer,
      "<span class='text-success'>" + data + "</span>"
    );
    this.ask();
  }

  /**
   * Writes log messages to the terminal in cyan.
   * @param {string} data - The log message to display.
   * @param {boolean} [doAsk=true] - Whether to ask the user for input after writing the log message.
   */
  terminalWriteLog(data, doAsk = true) {
    this.echo(
      this.prompts.system,
      "<i class='text-info'>" + data + "</i>",
      true,
      false,
      true
    );
    if (doAsk) {
      this.ask();
    }
  }

  /**
   * Writes error messages to the terminal in red.
   * @param {string} data - The error message to display.
   */
  terminalWriteError(data) {
    this.echo(
      this.prompts.system,
      "<b class='text-danger'>" + data + "</b>",
      true,
      false,
      true
    );
    this.ask();
  }

  /**
   * Asks the user for input.
   * This function is called after we process incoming data and write
   * it to the terminal. It is also called when the user clears the
   * terminal.
   */
  ask() {
    this.echo(this.prompts.user, "", false, false, true, true);
  }

  /**
   * Simulates user input by writing the given data to the terminal and
   * calling the terminalWrapper function as if the user had entered it.
   * @param {string} data - The data to simulate as user input.
   */
  simulateWrite(data) {
    this.term.writeln(data);
    this.terminalWrapper(data);
  }

  /**
   * Wrapper function to handle incoming data and route it accordingly.
   * @param {string} data - The data to process.
   */
  terminalWrapper(data) {
    if (this.timeUnderUpdate) {
      const selector = document.getElementsByClassName("update-time-auto");
      for (let i = 0; i < selector.length; i++) {
        selector[i].classList.remove("update-time-auto");
      }
    }
    switch (data) {
      case "//clear":
        this.terminalClear();
        break;
      case "//help":
        this.terminalHelp();
        break;
      case "//disconnect":
        disconnectSerial();
        if (typeof setButtonsState === "function") {
          setButtonsState(false);
        }
        this.areConnected = false;
        break;
      default:
        if (data.startsWith("//connect")) {
          let baudRate,
            dataBits = 8,
            stopBits = 1,
            parity = "none",
            bufferSize = 1024,
            flowControl = "none";

          const params = data.split(" ");

          if (params.length >= 2) {
            baudRate = parseInt(params[1], 10);
          } else {
            this.terminalWriteLog(
              "No baud rate specified! Using 115200 by default.",
              false
            );
            baudRate = 115200;
          }

          if (params.length >= 3) {
            dataBits = params[2];
          }
          if (params.length >= 4) {
            stopBits = params[3];
          }
          if (params.length >= 5) {
            parity = params[4];
          }
          if (params.length >= 6) {
            bufferSize = params[5];
          }
          if (params.length >= 7) {
            flowControl = params[6];
          }

          connectSerial(
            baudRate,
            dataBits,
            stopBits,
            parity,
            bufferSize,
            flowControl
          );

          this.terminalWriteLog(
            "Please choose a serial port from the browser prompt to establish a connection.",
            false
          );
          if (typeof setButtonsState === "function") {
            setButtonsState(true);
          }
          this.areConnected = true;
        } else {
          if (this.areConnected) {
            if (data.length > 0) {
              sendData(data + "\r\n");
              this.ask();
            } else {
              sendData("\r\n");
              this.ask();
            }
          } else {
            this.terminalWriteLog(
              "Please connect to the serial port before sending data. Type <span class='term-command text-link' data-command='//help'>//help</span> for more information.",
              true
            );
          }
        }
        break;
    }
  }
}
