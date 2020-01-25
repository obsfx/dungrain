![](https://raw.githubusercontent.com/obsfx/dungrain/master/logo.png)

# dungrain

dungrain is a procedural dungeon generation library that was built on binary space partitioning method. It takes some arguments as an object and creates 2D number array that contains types of tiles that placed based on `indexMap` (`Wall`, `Path`, `Room`, `Empty`) values.

## installation

You can directly use `dungrain.js` or `dungrain.min.js` file with script tag. They can be found in build folder at github repo.

```html
<script src="./build/dungrain.min.js"></script>
<script>
    let dungeon = new dungrain({
        iterationCount: 20,
        column: 100,
        row: 40,
        indexMap: {
            Wall: 3,
            Path: 2,
            Room: 1,
            Empty: 0
        }
    });
</script>
```

or you can install with npm.

```
npm install dungrain
```

```javascript
import dungrain from 'dungrain';

let dungeon = new dungrain({
    iterationCount: 20,
    column: 100,
    row: 40,
    indexMap: {
        Wall: 3,
        Path: 2,
        Room: 1,
        Empty: 0
    }
});
```

## usage

##### arguments

All arguments have to be passed into class as an object.

```json
{
    iterationCount: number,
    column: number,
    row: number,
    indexMap: {
        Wall: number,
        Path: number,
        Room: number,
        Empty: number
        
    }
	seed: string (optional) (default: hex of Date.now() value at the moment),
	minimumWHRatio: number (optional) (default: 0.5),
	maximumWHRatio: number (optional) (default: 2.0),
	minimumChunkWidth: number (optional) (default: 8),
	minimumChunkHeight: number (optional) (default: 8)
} 
```

##### methods

```javascript
getMap() // (returns generated dungeon that formed into 2D number array)
getAllFloors() // (returns all available floors included rooms and paths)
getRooms() // (returns all room objects that contains their topleftcorner point and all available floors array)
getPaths() // (returns all path objects that contains their start point, all available floors array data, direction data (0: VERTICAL, 1: HORIZONTAL) and width value (represents the length of the path))
getSeed() // (returns the seed of the generated dungeon)
```



## example

##### code

```html
<canvas class="canvas" width="1000" height="500"></canvas>

<script src="./build/dungrain.min.js"></script>
<script>
	let dungeon = new dungrain({
    	seed: 'example',
        iterationCount: 6,
        column: 100,
        row: 50,
        indexMap: {
        Wall: 3,
        Path: 2,
        Room: 1,
        Empty: 0
        },
        minimumWHRatio: 0.8,
        maximumWHRatio: 1.6,
        minimumChunkWidth: 2,
        minimumChunkHeight: 2
	});

	let map = dungeon.getMap();

	let canvas = document.querySelector('.canvas');
    let ctx = canvas.getContext('2d');

	for (let i = 0; i < map.length; i++) {
    	for (let j = 0; j < map[i].length; j++) {
        	let tile = map[i][j];

			if (tile == dungeon.indexMap.Wall) {
            	ctx.fillStyle = 'black';
           	} else if (tile == dungeon.indexMap.Path) {
            	ctx.fillStyle = 'blue';
            } else if (tile == dungeon.indexMap.Room) { 
            	ctx.fillStyle = 'green';
            } else {
            	ctx.fillStyle = 'white';
            }

			ctx.fillRect(j * 10, i * 10, 10, 10);
        }
    }
</script>
```

##### output

![](https://raw.githubusercontent.com/obsfx/dungrain/master/example.png)



##### see in action @codepen

i made a codepen visualization demo with early version of this. You can play with that here: https://codepen.io/omercanbalandi/pen/JjoeKrQ

![](https://raw.githubusercontent.com/obsfx/dungrain/master/codepen.gif)