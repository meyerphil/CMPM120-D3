A bowling/minigolf fusion of a game! By Phil Meyer

Play game here: https://meyerphil.github.io/CMPM120-D3/

All graphics created within Phaser3.

# Gameplay/Experience requirements

## The game uses both continuous and discrete inputs from the player

- The game requires the player to click, drag, then drop their mouse from the ball
    to launch it.

## The player’s goal can only be achieved indirectly (by allowing the physics engine to move key objects into position/contact).

- After the player launches the ball, the physics engine takes over and handles
    the collision of the ball and the pins / walls.
- Your goal is to knock down as many pins as possible with as few throws.

## 3+ physics-based gameplay scenes (possibly implemented with a single Phaser Scene subclass).

- There are 4 physics scenes for each level.
- After completion, players can continue to the next one(if available) or restart the level.

## Other scenes are used to separate and contextualize the gameplay scenes
- There is a title screen before beginning the game.
- There is a result screen that is shown after a player completes the gameplay,
    displaying the level completed, how many pins were hit, and how many balls were thrown.