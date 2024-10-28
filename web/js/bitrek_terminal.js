"use strict";

// TODO: add time format; showCopyButton; showWelcomeMessage to settings;
class TermManager {
  /**
   * Constructor for the TermManager class.
   *
   * @param {string} containerId The id of the container element to render the terminal in.
   * @param {string} [timeFormat="<span class='text-muted'>[%H:%M:%S]</span>"] The format string for the timestamp.
   * @param {object} [prompts] An object with the following properties:
   * - user: The prompt string for user commands.
   * - root: The prompt string for root commands.
   * - system: The prompt string for system commands.
   * - answer: The prompt string for answer commands.
   * @param {string[]} [welcomeMessage] An array of welcome messages to display to the user.
   * @param {boolean} [showCopyButton=true] Whether to show the copy button.
   *
   * @throws {Error} If the container element is not found.
   */
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
    this.settings = {
      cursor_blink: true,
      tx_end_of_line: "lf",
      autosave_uart_settings: true,
    };
    this.uartSettings = {
      baud_rate: "115200",
      data_bits: "8",
      stop_bits: "1",
      parity: "none",
      buffer_size: "1024",
      flow_control: "none",
    };
    this.settings = this.loadTerminalSettingsLocalStorage();
    this.uartSettings = this.loadUARTSettingsLocalStorage();
    this.txEOL = "\n";
    this.term = new XTerminal();
    this.containerId = containerId;
    this.containerEl = document.getElementById(containerId);
    this.term.mount(this.containerEl);
    this.terminalWrapper = this.terminalWrapper.bind(this);
    this.term.onInput = (data) => this.terminalWrapper(data);
    this.term.focus();
    this.timeFormat = timeFormat;
    this.prompts = prompts;
    this.welcomeMessage = welcomeMessage;

    this.showCopyButton = showCopyButton;

    this.areConnected = false;
    this.arePaused = false;

    this.scrollEl = this.containerEl.querySelector(".xt");

    this.scrolledToEnd = true;

    this.lastConnectOptions = {};

    this._registerLinks();
    this._registerAutoComplete();

    this._setSettingsModalValues();
    this._registerUARTchangeSettings();

    if (this.showCopyButton) {
      this._registerCopyButton();
    }

    this.timeUnderUpdate = false;
    if (this.timeFormat.length > 0) {
      this.timeUnderUpdate = true;
      setInterval(() => this._updateTime(), 1000);
    }

    this.doPerformSettings();
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
    if (!this.checkConnectAbility()) {
      this.terminalWriteError(
        "Your browser does not support WebSerial. 😿",
        false
      );
    }
  }

  /**
   * Checks if the browser supports WebSerial.
   *
   * @return {boolean} Whether the browser supports WebSerial.
   */
  checkConnectAbility() {
    return "serial" in navigator;
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
    autoUpdateTime = false,
    originalData = false
  ) {
    if (this.arePaused) {
      return;
    }
    this.scrolledToEnd = this._checkScrolledToBottom();

    if (originalData === false) {
      originalData = data;
    }
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
      copyButton.classList.add("bi", "text-secondary", "bi-clipboard2");
      copyButton.setAttribute("data-clipboard-text", originalData);
      data = copyButton.outerHTML + data;
    }
    if (line) {
      this.term.writeln(data);
    } else {
      this.term.write(data);
    }
    if (this.scrolledToEnd) {
      this._scrollBottom();
    } else {
      this._blinkBorder();
    }
  }

  /**
   * Prints the specified number of empty lines to the terminal.
   *
   * @param {number} [count=1] - The number of empty lines to print.
   */
  emptyLine(count = 1) {
    if (this.arePaused) {
      return;
    }
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
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//reconnect'>//reconnect</span> - Reconnect to the serial port",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//export plain'>//export</span> [plain|html] [filename] - Export the terminal history",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//fullscreen no'>//fullscreen</span> [toggleWindow=no] - Toggle full screen mode. If toggleWindow is set to \"yes\", the browser window also will be toggled",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//cleansettings'>//cleansettings</span> [both|uart|terminal] - Remove UART and/or terminal settings from the localStorage",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//set blink_cursor=true'>//set blink_cursor=false</span> Set settings param to value. In this case will set blink_cursor to false. Mulltiple settings can be set at the same time using a space as separator",
      true,
      false,
      true
    );
    this.echo(
      this.prompts.system,
      "<span class='term-command text-link' data-command='//get'>//get</span> [paramname1];[paramname2] Get settings param. In this case will get blink_cursor setting. Multiple settings can be retrieved at the same time using a  a space as separator. Empty param will get all settings",
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
      "<span class='text-success'>" + data + "</span>",
      true,
      false,
      false,
      false,
      data
    );
    this.ask();
  }

  /**
   * Writes log messages to the terminal in cyan.
   * @param {string} data - The log message to display.
   * @param {boolean} [needAsk=true] - Whether to ask the user for input after writing the log message.
   */
  terminalWriteLog(data, needAsk = true, hideCopyButton = true) {
    this.echo(
      this.prompts.system,
      "<i class='text-info'>" + data + "</i>",
      true,
      false,
      hideCopyButton,
      false,
      data
    );
    if (needAsk) {
      this.ask();
    }
  }

  /**
   * Writes warning messages to the terminal in bold yellow.
   *
   * @param {string} data - The warning message to display.
   * @param {boolean} [needAsk=true] - Whether to ask the user for input after writing the warning message.
   */
  terminalWriteWarn(data, needAsk = true) {
    this.emptyLine();
    this.echo(
      this.prompts.system,
      "<b class='text-warning'>" + data + "</b>",
      true,
      false,
      false,
      false,
      data
    );
    if (needAsk) {
      this.ask();
    }
  }

  /**
   * Writes error messages to the terminal in red.
   * @param {string} data - The error message to display.
   * @param {boolean} [needAsk=true] - Whether to ask the user for input after writing the error message.
   */
  terminalWriteError(data, needAsk = true) {
    this.emptyLine();
    this.echo(
      this.prompts.system,
      "<b class='text-danger'>" + data + "</b>",
      true,
      false,
      false,
      false,
      data
    );
    if (needAsk) {
      this.ask();
    }
  }

  /**
   * Asks the user for input.
   * This function is called after we process incoming data and write
   * it to the terminal. It is also called when the user clears the
   * terminal.
   */
  ask() {
    if (this.arePaused) {
      return;
    } else {
      this.echo(this.prompts.user, "", false, false, true, true);
    }
  }

  /**
   * Toggle the terminal to full screen mode.
   * @param {boolean} toggleBrowserWindow - Whether to toggle the entire browser window to full screen mode.
   */
  toggleFullscreen(toggleBrowserWindow = "no") {
    const terminal = this.containerEl;

    terminal.classList.toggle("fullscreen");

    if (toggleBrowserWindow === "yes") {
      const isFullscreen = terminal.classList.contains("fullscreen");

      if (isFullscreen) {
        if (terminal.requestFullscreen) {
          terminal.requestFullscreen();
        } else if (terminal.mozRequestFullScreen) {
          // Firefox
          terminal.mozRequestFullScreen();
        } else if (terminal.webkitRequestFullscreen) {
          // Chrome, Safari and Opera
          terminal.webkitRequestFullscreen();
        } else if (terminal.msRequestFullscreen) {
          // IE/Edge
          terminal.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          // Firefox
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          // Chrome, Safari and Opera
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          // IE/Edge
          document.msExitFullscreen();
        }
      }
    }
    this.ask();
  }

  /**
   * Simulates a write to the terminal as if the user had typed
   * the given data and pressed Enter.
   *
   * @param {string} data - The data to simulate typing.
   * @param {boolean} [saveHistory=true] - Whether to save the data to the
   * terminal's history.
   */
  simulateWrite(data, saveHistory = true) {
    this._scrollBottom();
    this.term.writeln(data);
    this.terminalWrapper(data);
    if (saveHistory) {
      this.addToHistory(data);
    }
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
    this._scrollBottom(); // It's right way to scroll to the bottom when commands are sended (not only by user input);
    switch (data) {
      case "//clear":
        this.terminalClear();
        break;
      case "//help":
        this.terminalHelp();
        break;
      case "//disconnect":
        if (typeof disconnectSerial === "function") {
          disconnectSerial();
        }
        if (typeof setButtonsState === "function") {
          setButtonsState(false);
        }
        this.areConnected = false;
        break;
      case "//reconnect":
        if (!this.lastConnectOptions) {
          this.terminalWriteError(
            "No previous connection options found. Please connect first.",
            false
          );
          break;
        }
        if (typeof disconnectSerial === "function") {
          disconnectSerial();
        }
        if (typeof setButtonsState === "function") {
          setButtonsState(false);
        }
        this.areConnected = false;
        if (typeof connectSerial !== "function") {
          setTimeout(() => {
            connectSerial(
              this.lastConnectOptions.baudRate,
              this.lastConnectOptions.dataBits,
              this.lastConnectOptions.stopBits,
              this.lastConnectOptions.parity,
              this.lastConnectOptions.bufferSize,
              this.lastConnectOptions.flowControl
            );
            this.areConnected = true;
            if (typeof setButtonsState === "function") {
              setButtonsState(true);
            }
          }, 200);
        }
        break;
      default: // Parameterized commands
        const params = data.split(" ");
        switch (true) {
          case data.startsWith("//export"):
            let type = "plain";
            let filename = "";
            if (params.length >= 2) {
              type = params[1];
            }
            if (params.length >= 3) {
              filename = params[2];
            }
            this.exportFile(type, filename);
            break;
          case data.startsWith("//connect"):
            let baudRate,
              dataBits = 8,
              stopBits = 1,
              parity = "none",
              bufferSize = 1024,
              flowControl = "none";

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

            if (typeof connectSerial === "function") {
              connectSerial(
                baudRate,
                dataBits,
                stopBits,
                parity,
                bufferSize,
                flowControl
              );

              this.lastConnectOptions = {
                baudRate,
                dataBits,
                stopBits,
                parity,
                bufferSize,
                flowControl,
              };

              this.terminalWriteLog(
                "Please choose a serial port from the browser prompt to establish a connection.",
                false
              );
              if (typeof setButtonsState === "function") {
                setButtonsState(true);
              }
              this.areConnected = true;
            } else {
              this.terminalWriteLog(
                "Could not connect to the serial port. Are you sure it is installed and enabled?",
                true
              );
            }
            break;
          case data.startsWith("//fullscreen"):
            if (params.length >= 2) {
              this.toggleFullscreen(params[1]);
            } else {
              this.toggleFullscreen();
            }
            break;
          case data.startsWith("//cleansettings"):
            if (params.length == 2) {
              switch (params[1]) {
                case "terminal":
                  this.cleanTerminalLocalStorage();
                  this.terminalWriteLog("Cleared terminal settings.", true);
                  break;
                case "uart":
                  this.cleanUARTSettingsLocalStorage();
                  this.terminalWriteLog("Cleared UART settings.", true);
                  break;
                case "both":
                  this.cleanTerminalLocalStorage();
                  this.cleanUARTSettingsLocalStorage();
                  this.terminalWriteLog(
                    "Cleared terminal and UART settings.",
                    true
                  );
                  break;
                default:
                  this.terminalWriteWarn(
                    "Wrong argument for //cleansettings command. Please use 'both', 'terminal' or 'uart'.",
                    true
                  );
              }
            } else {
              this.terminalWriteWarn(
                "This command requires an argument: [both|terminal|uart]",
                true
              );
            }
            break;
          case data.startsWith("//get"):
            if (params.length == 1) {
              const readable = JSON.stringify(this.settings, null, 2);
              const lines = readable.split("\n");
              const linesCount = lines.length;

              lines.forEach((line, index) => {
                const hideCopyButton = index > 0 && index < linesCount - 1;
                this.terminalWriteLog(line, false, !hideCopyButton);
              });

              this.ask();
            } else {
              // 1. Filter settings
              const settingsSubset = {};
              params.forEach((param) => {
                const key = param.trim();
                if (key && this.settings.hasOwnProperty(key)) {
                  settingsSubset[key] = this.settings[key];
                }
              });

              // 2. Remove empty keys
              Object.keys(settingsSubset).forEach((key) => {
                if (settingsSubset[key] === "") {
                  delete settingsSubset[key];
                }
              });

              // 3. Print the filtered settings
              const readableSubset = JSON.stringify(settingsSubset, null, 2);
              const lines = readableSubset.split("\n");
              const linesCount = lines.length;

              lines.forEach((line, index) => {
                const hideCopyButton = index > 0 && index < linesCount - 1;
                this.terminalWriteLog(line, false, !hideCopyButton);
              });

              this.ask();
            }
            break;
          case data.startsWith("//set"):
            // TODO: for all cases check avaiable values
            if (params.length === 1) {
              this.terminalWriteLog(
                "No parameters provided. Use format: //set param1=value1; param2=value2;",
                false
              );
              this.ask();
            } else {
              // 1. Process each parameter in the format x=y;z=v;
              const settingsUpdates = {};
              params.forEach((param) => {
                const pairs = param.split(";");
                pairs.forEach((pair) => {
                  const [key, value] = pair.split("=").map((p) => p.trim());

                  if (key && value !== undefined) {
                    settingsUpdates[key] = value;
                  }
                });
              });

              // 2. Update this.settings with the new values
              Object.keys(settingsUpdates).forEach((key) => {
                if (this.settings.hasOwnProperty(key)) {
                  if (settingsUpdates[key] === "true") {
                    settingsUpdates[key] = true;
                  } else if (settingsUpdates[key] === "false") {
                    settingsUpdates[key] = false;
                  }
                  this.settings[key] = settingsUpdates[key];
                }
              });

              // 3. Log the updated settings
              const readableUpdated = JSON.stringify(this.settings, null, 2);
              const lines = readableUpdated.split("\n");
              const linesCount = lines.length;

              lines.forEach((line, index) => {
                const hideCopyButton = index > 0 && index < linesCount - 1;
                this.terminalWriteLog(line, false, !hideCopyButton);
              });

              this.ask();

              // 4. Save and Perform settings
              this.saveTerminalSettingsLocalStorage(this.settings);
              this.doPerformSettings();
            }
            break;

          default: // Plain text or passthrough commands
            if (this.areConnected) {
              if (data.length > 0) {
                sendData(data + this.txEOL);
                this.ask();
              } else {
                sendData(this.txEOL);
                this.ask();
              }
            } else {
              this.terminalWriteLog(
                "Please connect to the serial port before sending data. Type <span class='term-command text-link' data-command='//help'>//help</span> for more information.",
                true
              );
            }
        }
    }
  }

  /**
   * Adds a given history point to the terminal's history.
   *
   * @param {string} historyPoint - The command or text to be added to the terminal's history.
   */
  addToHistory(historyPoint) {
    const previousHistory = this.term.history;
    previousHistory.push(historyPoint);
    this.term.history = previousHistory;
  }

  /**
   * Pauses the terminal.
   * It adds the "paused" class to the container element, sets the timeUnderUpdate flag to false,
   * blurs the terminal and pauses it.
   *
   */
  pause() {
    this.arePaused = true;
    this.containerEl.classList.add("paused");
    this.timeUnderUpdate = false;
    this.term.blur();
    this.term.pause();
  }

  /**
   * Resumes the terminal.
   * It removes the "paused" class from the container element, sets the timeUnderUpdate flag to true,
   * focuses the terminal and resumes it.
   *
   */
  resume() {
    this.arePaused = false;
    this.containerEl.classList.remove("paused");
    this.timeUnderUpdate = true;
    this.term.focus();
    this.term.resume();
  }

  /**
   * Exports the history data in the specified format.
   *
   * @param {string} type - The type of export format ('plain' or 'html').
   * @param {string} filename - The name of the file to save the exported data.
   */
  exportFile(type = "plain", filename = "") {
    if (filename === "") {
      const d = new Date();
      filename =
        "serial_export_" +
        d.getMinutes() +
        "_" +
        d.getSeconds() +
        "_" +
        d.getMilliseconds();
    }
    switch (type) {
      case "plain":
        filename += ".txt";
        this.terminalWriteLog("Exporting history as plain text...");
        break;
      case "html":
        filename += ".html";
        this.terminalWriteLog("Exporting history as HTML...");
        break;
    }
    this.pause();
    let pageData;
    switch (type) {
      case "plain":
        pageData = this._exportAsPlain();
        break;
      case "html":
        pageData = this._exportAsHTML();
        break;
    }
    this._downloadFile(filename, pageData);
    this.resume();
  }

  /**
   * Saves the given settings object to the user's local storage.
   *
   * @param {object} settings The settings object to save.
   */
  saveTerminalSettingsLocalStorage(settings) {
    localStorage.setItem("bitrek_terminal_settings", JSON.stringify(settings));
  }

  /**
   * Loads the terminal settings object from the user's local storage. If the settings object
   * exists in local storage, it will be loaded into the `settings` property of
   * the TermManager object. If the settings object does not exist, the `settings`
   * property will be left unchanged.
   *
   * @returns {object} The loaded settings object.
   */
  loadTerminalSettingsLocalStorage() {
    const settings = JSON.parse(
      localStorage.getItem("bitrek_terminal_settings")
    );
    if (settings) {
      return settings;
    } else {
      return this.settings;
    }
  }

  /**
   * Removes the terminal settings object from the user's local storage.
   * Resets all terminal settings UI elements to their default values.
   */
  cleanTerminalLocalStorage() {
    localStorage.removeItem("bitrek_terminal_settings");
    document.querySelectorAll(".uart_settings").forEach((el) => {
      this._resetElementToDefault(el, false);
    });
    document.querySelectorAll(".terminal_settings").forEach((el) => {
      this._resetElementToDefault(el, false);
    });
    this.doPerformSettings();
  }

  /**
   * Saves the given UART settings object to the user's local storage.
   *
   * @param {object} settings The UART settings object to save.
   */
  saveUARTSettingsLocalStorage(settings) {
    localStorage.setItem("bitrek_uart_settings", JSON.stringify(settings));
  }

  /**
   * Loads the UART settings object from the user's local storage. If the settings object
   * exists in local storage, it will be loaded into the `uartSettings` property of
   * the TermManager object. If the settings object does not exist, the `uartSettings`
   * property will be left unchanged.
   */
  loadUARTSettingsLocalStorage() {
    const settings = JSON.parse(localStorage.getItem("bitrek_uart_settings"));
    if (settings) {
      return settings;
    } else {
      return this.uartSettings;
    }
  }

  /**
   * Removes the UART settings object from the user's local storage.
   */
  cleanUARTSettingsLocalStorage() {
    localStorage.removeItem("bitrek_uart_settings");
    document.querySelectorAll(".uart_settings").forEach((el) => {
      this._resetElementToDefault(el, false);
    });
  }

  /**
   * Creates a HTML document from the terminal content, with the terminal
   * content cloned and styles applied directly to the elements.
   *
   * @private
   *
   * @returns {string} The HTML document content.
   */
  _exportAsHTML() {
    const clonedElement = this.containerEl.cloneNode(true);

    clonedElement
      .querySelectorAll(".xt-cursor, .xt-stdin, .copy-button")
      .forEach((el) => el.remove());

    clonedElement.querySelectorAll("*").forEach((el) => {
      const style = window.getComputedStyle(el);
      const cssText = Array.from(style)
        .map((property) => `${property}:${style.getPropertyValue(property)}`)
        .join(";");
      el.style.cssText = cssText;
    });

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bitrek Serial Web Terminal Export</title>
          <style>
            body {
              padding: 5px;
              margin: 0;
              background-color: black;
              color: white;
            }
          </style>
        </head>
        <body>
          ${clonedElement.innerHTML}
        </body>
      </html>
    `;
  }

  /**
   * Exports the content of the terminal container as plain text.
   *
   * This function retrieves the inner text of the terminal container,
   * removes any HTML tags, trims leading and trailing whitespace, and
   * removes any copy or confirmation icons.
   *
   * @returns {string} The plain text content of the terminal container.
   */
  _exportAsPlain() {
    const clonedElement = this.containerEl.cloneNode(true);

    clonedElement
      .querySelectorAll(".xt-cursor, .xt-stdin, .copy-button")
      .forEach((el) => el.remove());

    let toExport = clonedElement.innerHTML;
    toExport = toExport.replace(/<br>/g, "\n");
    toExport = toExport.replace(/<[^>]*>/g, "");
    toExport = toExport.trim();
    toExport = toExport.replace(/<span class="copy-button">.*<\/span>/g, "");
    toExport = toExport.replace(/&gt;/g, ">");
    toExport = toExport.replace(/&lt;/g, "<");

    // normalize newlines
    toExport = toExport.replace(/\r\n/g, "\n");
    toExport = toExport.replace(/\r/g, "\n");

    // remove double newlines
    toExport = toExport.replace(/\n\n/g, "\n");

    return toExport.trim();
  }

  /**
   * Downloads a file with the given filename and content.
   * @param {string} filename The filename to use for the download.
   * @param {string} content The content to write to the file.
   * @private
   */
  _downloadFile(filename, content) {
    const mimeType = filename.endsWith(".html")
      ? "text/html;charset=utf-8"
      : "text/plain;charset=utf-8";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Scrolls the terminal to the bottom of the output.
   *
   * @private
   */
  _scrollBottom() {
    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
  }

  /**
   * Temporarily adds a CSS class to the terminal's scroll element to make the
   * border blink. This is used to indicate that the user should scroll up to
   * see more output.
   *
   * @private
   */
  _blinkBorder() {
    this.scrollEl.classList.add("blink-border");
    setTimeout(() => this.scrollEl.classList.remove("blink-border"), 300);
  }

  /**
   * Checks if the terminal's scroll position is at or near the bottom.
   *
   * visible height of the scrollable element is greater than or equal to
   * the total scrollable height minus a safe gap. This is used to determine
   * if the terminal should automatically scroll to the bottom when new data
   * is added.
   *
   * @private
   * @returns {boolean} True if the terminal is scrolled to the bottom or near it, false otherwise.
   */
  _checkScrolledToBottom() {
    const safeGap = 20;
    return (
      this.scrollEl.scrollTop + this.scrollEl.clientHeight >=
      this.scrollEl.scrollHeight - safeGap
    );
  }

  /**
   * Updates all elements with the class `update-time-auto` with the current
   * time formatted according to the `timeFormat` option.
   *
   * @private
   */
  _updateTime() {
    try {
      if (!this.timeUnderUpdate) {
        return;
      }
      const selector = document.getElementsByClassName("update-time-auto");
      selector[selector.length - 1].innerHTML = this.formatTime();
    } catch (e) {}
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
    this.containerEl.addEventListener("click", (event) => {
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
    this.containerEl.addEventListener("click", (event) => {
      const target = event.target;
      if (target.matches(".copy-button")) {
        const areDisabled = target.getAttribute("data-disabled");
        if (areDisabled) {
          return;
        }
        let toCopy = target.getAttribute("data-clipboard-text");
        toCopy = toCopy.replace(/<[^>]*>/g, "");
        this._copyTextToClipboard(toCopy);
        target.classList.remove("bi-clipboard2", "text-seconary");
        target.classList.add("bi-clipboard2-check", "text-success");
        setTimeout(() => {
          target.classList.add("bi-clipboard2", "text-seconary");
          target.classList.remove("text-success", "bi-clipboard2-check");
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
   * ... and any other command
   *
   * @private
   */
  _registerAutoComplete() {
    this.term.setCompleter((data) => {
      const options = [
        "//help",
        "//connect",
        "//disconnect",
        "//recconnect",
        "//clear",
        "//fullscreen",
        "//export",
        "//cleansettings",
        "//set",
        "//get",
      ];
      return options.filter((s) => s.startsWith(data))[0] || "";
    });
    this.containerEl.addEventListener("keydown", (e) => {
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
   * Performs the actual configuration changes to the terminal, based on the
   * values in `this.settings`.
   *
   * @private
   */
  doPerformSettings() {
    // Blink
    if (this.settings.cursor_blink) {
      document.querySelector(".xt-cursor").classList.add("xt-blink");
    } else {
      document.querySelector(".xt-cursor").classList.remove("xt-blink");
    }

    // TX EOL
    if (this.settings.tx_end_of_line === "none") {
      this.txEOL = "";
    } else if (this.settings.tx_end_of_line === "lf") {
      this.txEOL = "\n";
    } else if (this.settings.tx_end_of_line === "cr") {
      this.txEOL = "\r";
    } else if (this.settings.tx_end_of_line === "crlf") {
      this.txEOL = "\r\n";
    }
  }

  /**
   * Resets the given element to its default value.
   *
   * @param {Element} el The element to reset.
   * @param {boolean} [doTrigger=false] Whether to trigger a change event on the element.
   *
   * @private
   */
  _resetElementToDefault(el, doTrigger = false) {
    if (!el) {
      return;
    }
    const defaultValue = el.getAttribute("data-default");
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.value = defaultValue;
    } else if (el.tagName === "SELECT") {
      const matchingOption = Array.from(el.options).find((option) =>
        option.hasAttribute("data-default")
      );
      if (matchingOption) {
        el.value = matchingOption.value;
      } else {
        el.value = defaultValue;
      }
    } else {
      el.textContent = defaultValue;
    }
    if (doTrigger) {
      el.dispatchEvent(new Event("change"));
    }
  }

  /**
   * Registers event listeners for the UART settings form elements to update the
   * this.uartSettings object and save it to local storage if the user has
   * chosen to autosave the settings.
   *
   * @private
   */
  _registerUARTchangeSettings() {
    document.querySelectorAll(".uart_settings").forEach((el) => {
      const key = el.getAttribute("data-key");
      const value = this.uartSettings[key];

      if (el.tagName === "SELECT" && value !== undefined) {
        for (let option of el.options) {
          option.selected = option.value === value;
        }
      } else {
        if (el.value !== undefined) {
          el.value = value;
        }
      }
      el.addEventListener("change", () => {
        if (this.settings.autosave_uart_settings) {
          this.uartSettings[key] = el.value;
          console.log(this.uartSettings);

          localStorage.setItem(
            "bitrek_uart_settings",
            JSON.stringify(this.uartSettings)
          );
        }
      });
    });
  }
  /**
   * Sets the values of all form elements with class "terminal_settings" to
   * their corresponding values in this.settings.
   *
   * @private
   */
  _setSettingsModalValues() {
    const settings = this.settings;
    document.querySelectorAll(".terminal_settings").forEach((el) => {
      const key = el.getAttribute("data-key");
      let value = settings[key];
      if (value === true) {
        value = "true";
      } else if (value === false) {
        value = "false";
      }
      console.log(key, value);

      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = value;
      } else if (el.tagName === "SELECT") {
        for (let option of el.options) {
          option.selected = option.value === value;
        }
      } else {
        el.textContent = value;
      }
    });
  }
}
