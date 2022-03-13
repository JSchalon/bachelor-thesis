# Bachelorarbeit Interaktionseditor

Git Repo zur Bachelorarbeit zur Entwicklung eines webbasierten Interaktionseditors

## Installation

- Clone repository
- In main folder:
	- Use **npm install** to install node modules
	- Use **npm run serve** to run the server at localhost:8080

## Versions

### Version 0.3.9
- Now displaying disabled context options with lowered opacity for easier positioning when changing sign type and enabling optional parameters
- Replaced all contex menu slider elements with sign category containers, for better visualisation
- Added hold signs to space measurements, turns, relationship bows
- Added "addressing" option to "address" relationship bows
- Now inverting pins placed in direction signs in the "low" dimension (to avoid black on black)
- Moved the signs object to the vuex state
- Fixed bugs pertainint to
	- the missing recalculation of interact restrictions after a window resize event
	- the placement of signs when the score is scrolled while they are being dragged
	- the placement of signs in the second to last bar after deleting the last bar