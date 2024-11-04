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
 * Simulates sending the "//cleansettings terminal" command to the terminal,
 * which is intended to clear all terminal settings.
 */
function cleanBothSettings() {
  if (sureToProceed("Are you sure you want to clear all terminal settings?")) {
    bitrekTerm.simulateWrite("//cleansettings terminal");
  }

  const modal = document.getElementById("settingsModal");
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
  }
}

/**
 * Simulates sending the "//cleansettings uart" command to the terminal,
 * which is intended to clear all UART settings.
 */
function cleanUARTSettings() {
  if (sureToProceed("Are you sure you want to clear UART settings?")) {
    bitrekTerm.simulateWrite("//cleansettings uart");
  }

  const modal = document.getElementById("settingsModal");
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
  }
}

/**
 * Simulates sending the "//cleansettings terminal" command to the terminal,
 * which is intended to clear all terminal settings.
 */
function cleanTerminalSettings() {
  if (sureToProceed("Are you sure you want to clear terminal settings?")) {
    bitrekTerm.simulateWrite("//cleansettings terminal");
  }

  const modal = document.getElementById("settingsModal");
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
  }
}

/**
 * Simulates the user entering the "//clear" command in the terminal, which
 * clears the terminal's output.
 */
function clearTerminal() {
  if (
    sureToProceed(
      "Are you sure you want to clear the terminal? \nHistory will be lost!"
    )
  ) {
    bitrekTerm.simulateWrite("//clear");
  }
}

/**
 * Prompts the user with a confirmation dialog displaying the specified message.
 *
 * @param {string} message - The message to display in the confirmation dialog.
 * @returns {boolean} True if the user confirms, otherwise false.
 */
function sureToProceed(message) {
  return confirm(message);
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

/**
 * Saves all the terminal settings to the local storage.
 *
 * This function first reads the current values of all elements with class
 * "terminal_settings". It then constructs a "//set" command with all the
 * values and sends it to the terminal.
 */
function saveSettings() {
  // 1. Get values
  const settingsUpdates = [];
  document.querySelectorAll(".terminal_settings").forEach((el) => {
    const key = el.getAttribute("data-key");
    let value;

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      value = el.value;
    } else if (el.tagName === "SELECT") {
      value = el.value;
    }
    if (key && value !== undefined) {
      settingsUpdates.push(`${key}=${value}`);
    }
  });

  // 2. Save values
  const command = `//set ${settingsUpdates.join(";")};`;
  bitrekTerm.simulateWrite(command);

  // 3. Close bootstrap modal
  const modal = document.getElementById("settingsModal");
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
  }
}
