"use strict";
/**
 * Simulates a user clicking the connect button.
 *
 * Reads the values from the #baudRate, #dataBits, #stopBits, #parity, #bufferSize,
 * and #flowControl form elements and passes them to the connectSerial function.
 *
 * @see connectSerial
 */
function connectSerialBtn() {
  const baudEl = document.getElementById("baudRate");
  const dataBitsEl = document.getElementById("dataBits");
  const stopBitsEl = document.getElementById("stopBits");
  const parityEl = document.getElementById("parity");
  const bufferSizeEl = document.getElementById("bufferSize");
  const flowControlEl = document.getElementById("flowControl");

  const baudRate = parseInt(baudEl.value);
  const dataBits = parseInt(dataBitsEl.value);
  const stopBits = parseInt(stopBitsEl.value);
  const parity = parityEl.value;
  const bufferSize = parseInt(bufferSizeEl.value);
  const flowControl = flowControlEl.value;

  bitrekTerm.simulateWrite(
    "//connect " +
      baudRate +
      " " +
      dataBits +
      " " +
      stopBits +
      " " +
      parity +
      " " +
      bufferSize +
      " " +
      flowControl
  );
}

/**
 * Sends "//disconnect" to the terminal.
 */
function disconnectSerialBtn() {
  bitrekTerm.simulateWrite("//disconnect");
}

/**
 * Simulates the user entering the "//export" command with the specified type.
 *
 * @param {string} type - The type of export format ('plain' or 'html').
 */
function exportTerm(type) {
  switch (type) {
    case "html":
      bitrekTerm.simulateWrite("//export html");
      break;
    case "plain":
      bitrekTerm.simulateWrite("//export plain");
      break;
  }
}

/**
 * Enables or disables the buttons on the page depending on whether the serial port is connected.
 *
 * @param {boolean} state If true, the buttons will be disabled and the disconnect button will be shown.
 *                         If false, the buttons will be enabled and the connect button will be shown.
 */
function setButtonsState(state) {
  const baudEl = document.getElementById("baudRate");
  const dataBitsEl = document.getElementById("dataBits");
  const stopBitsEl = document.getElementById("stopBits");
  const parityEl = document.getElementById("parity");
  const bufferSizeEl = document.getElementById("bufferSize");
  const flowControlEl = document.getElementById("flowControl");
  const connectBtn = document.getElementById("connectBtn");
  const disconnectBtn = document.getElementById("disconnectBtn");

  if (state) {
    baudEl.disabled = true;
    dataBitsEl.disabled = true;
    stopBitsEl.disabled = true;
    parityEl.disabled = true;
    bufferSizeEl.disabled = true;
    flowControlEl.disabled = true;

    connectBtn.classList.add("d-none");
    disconnectBtn.classList.remove("d-none");
  } else {
    baudEl.disabled = false;
    dataBitsEl.disabled = false;
    stopBitsEl.disabled = false;
    parityEl.disabled = false;
    bufferSizeEl.disabled = false;
    flowControlEl.disabled = false;
    connectBtn.classList.remove("d-none");
    disconnectBtn.classList.add("d-none");
  }
}
