## Scribe RPG character sheet generator

Scribe generates character sheets for paper-and-pencil roll playing game
(RPG) characters.  Using basic values (abilities, class, name, etc.) entered
in a form window, the program applies the rules contained in the RPG source
books and displays formatted information about the character in a separate
window.  Character information can be saved for later retrieval and editing.

The scribe-core package bundles core modules required for basic program
functionality and modules that support the v3.5 System Reference Document.
Additional plugins, available separately, extend the program to cover other
RPG games and campaign settings.

### Requirements

Scribe is written in JavaScript and may be run using most popular browsers.
Javascript and pop-up windows must be enabled.  Scribe has been successfully
tested using these browser versions:

* Google Chrome 42.0.2311.135

* Firefox 37.0.2

* Internet Explorer 11.0.9600.17207 (pull-down menus broken)

* Opera (TODO)

* Safari (TODO)

### Installation

Unbundling the release package is the only step required to install Scribe.

JavaScript security restrictions require that any saved character files
reside in the same directory as the program or in a subdirectory.  An attempt
to open a file stored elsewhere will result in a security exception.

### Usage

To run Scribe, simply use your browser to open scribe.html.
