# Bachelorarbeit Interaktionseditor

Git Repo zur Bachelorarbeit zur Entwicklung eines webbasierten Interaktionseditors

## Installation

- Clone repository
- In main folder:
	- Use **npm install** to install node modules
	- Use **npm run serve** to run the server at localhost:8080

## Versions

### Version 0.3.8
- Added repositioning of context menus when extending beyond the window on the right and bottom edge
- Restricted dragging of body part signs to the column definitions
- Fixed bugs pertaining to
	- the dragging of path signs into the inner score by incorrect if-else-sequencing
	- resizing un-resizable signs by moving them into the starting position via the arrow keys
	- the placement of body part signs when dragging into starting position
	- the calculation of the beat/bar when placing a new sign
