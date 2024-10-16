"use strict";

// Initiate XTerminal and register callbacks
const bitrekTerm = new TermManager("terminal");

bitrekTerm.showWelcomeMessage();

bitrekTerm.term.on("data", bitrekTerm.terminalWrapper);
bitrekTerm.ask();

// Initialize WebSerial and register callbacks
const bitrekSerial = new WebSerial();

bitrekSerial.onData((data) => {
  bitrekTerm.terminalWriteOutput(data);
});

bitrekSerial.onError((error) => {
  bitrekTerm.terminalWriteError(error);
});

bitrekSerial.onLog((data) => {
  bitrekTerm.terminalWriteLog(data);
});

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
