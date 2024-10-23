"use strict";
class WebSerial {
  /**
   * Initializes a new instance of the WebSerial class.
   * @param {number} [baudRate=9600] The baud rate to use for the serial port.
   * @param {number} [dataBits=8] The number of data bits to use for the serial port.
   * @param {number} [stopBits=1] The number of stop bits to use for the serial port.
   * @param {string} [parity="none"] The parity bit to use for the serial port.
   * @param {number} [globalBuffer=1024] The size of the global buffer.
   * @param {string} [flowControl="none"] The flow control to use for the serial port.
   * @param {number} [lineBufferSize=1024] The size of the line buffer.
   */
  constructor(
    baudRate = 9600,
    dataBits = 8,
    stopBits = 1,
    parity = "none",
    globalBuffer = 1024,
    flowControl = "none",
    lineBufferSize = 1024
  ) {
    this.port = null;
    this.reader = null;
    this.inputDone = null;
    this.outputStream = null;
    this.outputDone = null;
    this.baudRate = baudRate;
    this.onDataReceived = () => {};
    this.buffer = "";

    this.lineBufferSize = lineBufferSize;
    this.globalBuffer = globalBuffer;
    this.dataBits = dataBits;
    this.stopBits = stopBits;
    this.parity = parity;
    this.flowControl = flowControl;
  }

  /**
   * Opens a serial port connection and sets up the input and output streams.
   * @param {number} [baudRate] The baud rate to use for the serial port.
   * @param {number} [dataBits] The number of data bits to use for the serial port.
   * @param {number} [stopBits] The number of stop bits to use for the serial port.
   * @param {string} [parity] The parity bit to use for the serial port.
   * @param {number} [globalBuffer] The size of the global buffer.
   * @param {string} [flowControl] The flow control to use for the serial port.
   * @throws {Error} If the serial port cannot be opened.
   */
  async connect(
    baudRate = this.baudRate,
    dataBits = this.dataBits,
    stopBits = this.stopBits,
    parity = this.parity,
    globalBuffer = this.globalBuffer,
    flowControl = this.flowControl
  ) {
    try {
      this.baudRate = baudRate;
      this.dataBits = dataBits;
      this.stopBits = stopBits;
      this.parity = parity;
      this.globalBuffer = globalBuffer;
      this.flowControl = flowControl;

      this.port = await navigator.serial.requestPort();
      await this.port.open({
        baudRate: this.baudRate,
        dataBits: this.dataBits,
        stopBits: this.stopBits,
        parity: this.parity,
        flowControl: this.flowControl,
        bufferSize: this.globalBuffer,
      });

      const textDecoder = new TextDecoderStream();
      this.inputDone = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();
      const textEncoder = new TextEncoderStream();
      this.outputDone = textEncoder.readable.pipeTo(this.port.writable);
      this.outputStream = textEncoder.writable;

      this.onLog(
        `Connected to serial port: br=${this.baudRate}, db=${this.dataBits}, sb=${this.stopBits}, p=${this.parity}, fc=${this.flowControl}, b=${this.globalBuffer}`
      );

      this._readLoop();
    } catch (error) {
      console.error("Failed to connect to serial port:" + error);
      this.onError("Failed to connect to serial port:" + error);
    }
  }

  /**
   * Sends data to the serial port.
   *
   * @param {string} data Data to send to the serial port.
   *
   * @returns {Promise<void>}
   */
  async send(data) {
    if (!this.outputStream) {
      this.onError("Output stream is not available.");
      return;
    }

    const writer = this.outputStream.getWriter();
    try {
      await writer.write(data + "\n");
    } catch (error) {
      this.onError("Error sending data:", error);
    } finally {
      writer.releaseLock();
    }
  }

  /**
   * Disconnects from the serial port.
   *
   * If the reader is open, it is canceled and the inputDone promise is
   * awaited. If the output stream is open, it is closed and the outputDone
   * promise is awaited. If the serial port is open, it is closed. If an error
   * occurs while disconnecting, it is logged to the console.
   *
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.reader) {
        await this.reader.cancel();
        await this.inputDone.catch(() => {});
        this.reader = null;
      }
      if (this.outputStream) {
        await this.outputStream.close();
        await this.outputDone.catch(() => {});
        this.outputStream = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      this.onLog("Serial port disconnected.");
    } catch (error) {
      this.onError("Error during disconnection: " + error);
    }
  }

  /**
   * Changes the baud rate used by the serial port.
   *
   * Disconnects from the serial port, then connects again with the new baud
   * rate.
   *
   * @param {number} newBaudRate The new baud rate to use.
   *
   * @returns {Promise<void>}
   */
  async changeBaudRate(newBaudRate) {
    this.onLog(`Changing baud rate from ${this.baudRate} to ${newBaudRate}.`);
    await this.disconnect();
    await this.connect(newBaudRate);
  }

  /**
   * Registers a callback that is called when data is received from the serial port.
   *
   * @param {onDataReceived} callback The callback to register.
   */
  onData(callback) {
    /**
     * A callback that is called when data is received from the serial port.
     *
     * @callback onDataReceived
     * @param {string} data The data received from the serial port.
     */
    this.onDataReceived = (data) => {
      callback(data);
    };
  }

  /**
   * Registers a callback that is called when an error occurs while reading from the serial port.
   *
   * @param {onError} callback The callback to register.
   */
  onError(callback) {
    /**
     * A callback that is called when an error occurs while reading from the serial port.
     *
     * @callback onError
     * @param {Error} error The error that occurred while reading from the serial port.
     */
    this.onError = (error) => {
      console.error(error);
      callback(error);
    };
  }

  /**
   * Registers a callback that is called when log messages are available.
   *
   * @param {onLog} callback The callback to register.
   */
  onLog(callback) {
    this.onLog = (data) => {
      console.log(data);
      callback(data);
    };
  }

  /**
   * Reads data from the serial port and splits it into individual messages
   * (delimited by newlines). Any messages that are longer than the buffer size
   * are trimmed to the buffer size. If the buffer is longer than the buffer size,
   * it is trimmed to the buffer size. If an error occurs while reading from the
   * serial port, any data that has been read is processed and then the buffer is
   * cleared.
   *
   * @private
   *
   * @returns {Promise<void>}
   */
  async _readLoop() {
    try {
      while (this.reader) {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }
        this.buffer += value;
        if (this.buffer.length > this.lineBufferSize) {
          console.warn("Buffer limit exceeded. Trimming data.");
          this.buffer = this.buffer.slice(-this.lineBufferSize);
        }
        const messages = this.buffer.split("\n");
        this.buffer = messages.pop();
        messages.forEach((msg) => {
          if (msg.trim()) {
            this.onDataReceived(msg);
          }
        });
      }
    } catch (error) {
      this.onError(
        "Error reading from serial port: " +
          (error || error.messages) +
          " Try " +
          "<span class='term-command text-link' data-command='//reconnect'>//reconnect</span>"
      );
      if (this.buffer.trim()) {
        this.onDataReceived(this.buffer);
        this.buffer = "";
      }
    }
  }
}
