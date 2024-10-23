"use strict";

// Initiate XTerminal and bind callbacks
const bitrekTerm = new TermManager("terminal");

bitrekTerm.showWelcomeMessage();

bitrekTerm.term.on("data", bitrekTerm.terminalWrapper);
bitrekTerm.pause();

// Initialize WebSerial and bind callbacks
const bitrekSerial = new WebSerial();

bitrekTerm.resume();
bitrekTerm.ask();

bitrekSerial.onData((data) => {
  bitrekTerm.terminalWriteOutput(data);
});

bitrekSerial.onError((error) => {
  bitrekTerm.terminalWriteError(error);
});

bitrekSerial.onLog((data) => {
  bitrekTerm.terminalWriteLog(data);
});

/**
 * Establishes a serial port connection and sets up the input and output streams.
 *
 * @param {number} [baudRate=115200] The baud rate to use for the serial port.
 * @param {number} [dataBits=8] The number of data bits to use for the serial port.
 * @param {number} [stopBits=1] The number of stop bits to use for the serial port.
 * @param {string} [parity="none"] The parity bit to use for the serial port.
 * @param {number} [globalBuffer=1024] The size of the global buffer.
 * @param {string} [flowControl="none"] The flow control to use for the serial port.
 *
 * @returns {Promise<void>}
 */
async function connectSerial(
  baudRate = 115200,
  dataBits = 8,
  stopBits = 1,
  parity = "none",
  globalBuffer = 1024,
  flowControl = "none"
) {
  await bitrekSerial.connect(
    baudRate,
    dataBits,
    stopBits,
    parity,
    globalBuffer,
    flowControl
  );
}

/**
 * Sends data to the serial port.
 *
 * @param {string} data - The data to send.
 *
 * @returns {Promise<void>}
 */
async function sendData(data) {
  await bitrekSerial.send(data);
}

/**
 * Disconnects from the serial port.
 *
 * @returns {Promise<void>}
 */
async function disconnectSerial() {
  await bitrekSerial.disconnect();
}
