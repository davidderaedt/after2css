#AfterEffects CSS Animation Exporter

This After Effects script exports compositions to CSS keyframe animations.

##Usage and suggested workflows

Choose *File > Scripts > Run Script File*, select this JSX file, and save the resulting CSS file. **Note that you may need to enable scripts to write files in AE's *Preferences > General* panel if you never did**.

This script exports CSS keyframe animation data, assuming that layer names correspond to element IDs. No HTML or image files will be generated, so you'll have to do it separately.

The easiest workflow is to design your animation assets using Illustrator or Photoshop, generate the corresponding image assets and HTML page, and import the AI or PSD file in AfterEffects.

###Using Illustrator (recommended)

1. Design your animation assets in Illustrator and carefully place your elements across properly named layers.
2. Use the (free and open source) [Layer Exporter](https://creative.adobe.com/addons/products/1287#.VG4WOpPF8Q4) add-on to export layers as image files and the corresponding HTML and CSS files by checking the corresponding checkboxes in the *output* tab.
3. Import the .ai file in After Effects choosing *Import as: Composition - retain layer sizes*, and create your animation.
4. Choose *file > script > run script* and select this JSX file. You may need to enable scripts to write files in AE's *Preferences > General* panel.
5. Overwrite the default *styles.css* file with this one, or add it to the HTML page as a new CSS file.


###Using Photoshop

1. Design your animation assets in Photoshop and carefully place your elements across properly named layers.
2. Use *File > Extract Assets* to generate your image files.
3. Create an HTML page and place the generated image files as you see fit.
4. Select each layer and choose *Copy CSS*
5. Import the .ai file in After Effects choosing *Import as: Composition - retain layer sizes*, and create your animation.
6. Choose *file > script > run script* and select this JSX file. You may need to enable scripts to write files in AE's *Preferences > General* panel.
7. Overwrite the default *styles.css* file with this one, or add it to the HTML page as a new CSS file.


##Limits & known issues

* Nested compositions are not supported.

* Expressions are not supported and should be converted to keyframes before exports.

* Only position, scale, opacity and rotation transform animations are supported.

* Anchor points are converted to *transform-origin* but cannot be animated.

* Linear easings are converted to linear, other easings are converted to default *ease*. Cubic bezier curves are not supported at this point. *Hold* keyframes are simulated and should work as expected.

* Position animation use *top/left* properties where tranlations would provide better performance.

