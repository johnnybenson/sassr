# sassr

`require('some.scss')` in your modules (also works for css)

---

**sassr** is a [browserify](browserify.org) transform that takes `.css` and `.scss` files that you `require()` in your code and gives you an object that you can use to append or remove those styles from the page.

# install

Using [npm](http://npmjs.org):

```shell
npm install -g sassr
```

# usage

Add the transform to your bundle like this:

```js
var browserify = require('browserify');
var sassr = require('sassr');

var b = browserify()
    .add('./some.js')
    .transform(sassr)
    .bundle().pipe(process.stdout);
```

That allows you to do something like this in `some.js`:

```js
var styles = require('./some.scss');
```

This will add a style tag to the head of your page where your CSS will get injected when you do this:

```js
styles.append();
```

If you change your mind, you can remove the injected styles:

```js
styles.remove();
```

Or if you didn't want to inject them in the first place, but would rather just get the CSS as a string:

```js
var cssText = styles.getCSSText();
```

By the way, `append` and `remove` both return a reference to the injected `<style>` element. If for some reason you just want the element without appending or removing styles, try this:

```js
var styleElement = styles.getStyleElement();
```

# configuring

We just set `outputStyle` to `'compressed'` by defaultyou can specify some of [configuration options](https://github.com/sass/node-sass#options) for the Sass compiler.

```js
var sassConfig = {
    outputStyle: 'nested'
};

var b = browserify()
    .add('./some.js')
    .transform(sassConfig, sassr)
    .bundle().pipe(process.stdout);
```
