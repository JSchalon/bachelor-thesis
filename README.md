# Bachelorarbeit Interaktionseditor

Git Repo zur Bachelorarbeit zur Entwicklung eines webbasierten Interaktionseditors

## Installation

- Clone repository
- In main folder:
	- Use **npm install** to install node modules
	- Use **npm run serve** to run the server at localhost:8080

## Versions

### Version 0.8.3
- Optimized lasso select calculation
- Added a check if a sign actually changed after a resize/drag move/arrow key event to prevent unneccessary history saving
- Fixed some css color consistency issues
- Fixed sign interaction bounding boxes not getting recalculated on scroll events
- Fixed radio button positioning on reloading of context menu
- Fixed first editor state not being saved to undo history
- Fixed a bug where while placing a resizable sign with a beatHeight != 2 it would not resize to the initial height after leaving the starting position
- Fixed a bug where misc signs where incorrectly sized in the library causing isues after placing
- Fixed a bug where library items in context menus could be used to place signs
- Fixed a bug where canBeLimb was not being set on limb/surface signs on reload