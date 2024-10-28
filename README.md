# Bitrek Web Serial Terminal

> The Bitrek Web Terminal is a web application designed for UART communications.
>
> It provides a user-friendly interface to interact with UART devices through a web browser.
>
> This project allows you to send and receive data seamlessly.

## Table of Contents

- [Bitrek Web Serial Terminal](#bitrek-web-serial-terminal)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Test Instance](#test-instance)
  - [Contributing](#contributing)
  - [Contacts](#contacts)
  - [License](#license)

## Installation

To set up the Bitrek Web Terminal, clone this repository:

```bash
git clone https://github.com/Bitrek-Video/bitrek_web_terminal
cd bitrek_web_terminal
```

To launch it, you must install a web server (such as Apache or Nginx) and configure it to use HTTPS, for example, with Let's Encrypt. This requirement is outlined in the Chrome Serial API standard.

## Usage

> Latest Chrome [recommended](https://developer.chrome.com/docs/capabilities/serial#browser-support). Chrome version 89 is minimum with bugs and limitations.
>
> HTTPS required for web server because Chrome does not allow to connect to serial port without SSL.

Copy `web` folder to your web server such as Apache or Nginx.

## Test Instance

You can play with the Bitrek Web Terminal [here](https://bitrek.video/terminal) without any instalation.

Development version avaiable [here](https://prod.bitrek.video/serial_test/).

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any improvements or fixes.

## Contacts

[Official Website](https://bitrek.video/)

## License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for details.
