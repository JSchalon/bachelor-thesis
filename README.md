# Bachelorarbeit Interaktionseditor

Git Repo zur Bachelorarbeit zur Entwicklung eines webbasierten Interaktionseditors

## Installation

- Clone repository
- In main folder:
	- Use **npm install** to install node modules
	- Use **npm run serve** to run the server at localhost:8080

## Versions

### Version 0.4.3
- Started implementing interaction menu, implemented
	- undo/redo
	- deletion of current selected signs
	- multiSelect mode toggle (similar behavior to ctrl + click)
	- selecting/unselecting all for shortcut (ctrl + a) and interaction menu
	- selection inversion for shortcut (ctrl + i) and interaction menu
- Fixed a bug with the xml-conversion of space measurement signs