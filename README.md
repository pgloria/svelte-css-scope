# Svelte CSS Scoper

A [Svelte](https://svelte.dev) preprocessor that allows to add a suffix to every class 
The svelte scoped class mechanism works great to prevent our component classes to mess with other css on the page.
Adding a random suffix to the classes prevent the contrary case, when css on the page interferes with your components css.

My use case was the creation of a widget with a modal popup on non svelte websites, classes names like button or modal were already being used on some of those websites and clashed with my own

The library is a preprocessor that for now takes a simple parameter, it's the value to append to every css class

if you use any kind of preprocessing you will need to use [svelte-sequential-preprocessor](https://github.com/pchynoweth/svelte-sequential-preprocessor)

## Installation

Using npm:
```bash
$ npm i -D svelte-sequential-preprocessor
```

## Usage

### With `rollup-plugin-svelte` and `svelte-sequential-preprocessor` 
```js
import sveltePreprocess from 'svelte-preprocess';
import seqPreprocessor from 'svelte-sequential-preprocessor';
import cssScoper from 'svelte-css-scoper';

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: `public/app.js`
	},
	plugins: [
		svelte({
			preprocess: seqPreprocessor([sveltePreprocess(), cssScoper({ staticSuffix: '-QWERTY'})])
    })]
}
```



