import { notDeepEqual } from 'assert';
import MagicString from 'magic-string';
import { start } from 'repl';
import { walk, parse, Node } from 'svelte/compiler';
import { PreprocessorGroup } from 'svelte/types/compiler/preprocess';

export interface ScoperOptions {
  staticSuffix?: string;
}



export default (options: ScoperOptions | null): Pick<PreprocessorGroup, 'markup' | 'style'> => {
  const {
    staticSuffix = '-xyz'
  } = options;

  const replacedClass: { [key: string]: string } = {};

  function getName(oldName: string): string {
    return oldName + staticSuffix;
  }
  function replaceName(s: MagicString, str: string, startPos: number, replacementStr: string = null): void {
    let expression = str;
    const names = expression.match(/([\w-_]+)/g);

    if(replacementStr) {
      s.overwrite(startPos, startPos + str.length, replacementStr);
    } else {
      for (const name of names) {
        const substrStart = expression.indexOf(name);
        const
          start = startPos + substrStart,
          end = start + name.length;

        const newName = replacedClass[name] || getName(name);
        replacedClass[name] = newName;
        s.overwrite(start, end, newName);
      }
    }
  }

  return {

    markup({ content, filename }) {
      const parsed = parse(content);
      const magicContent = new MagicString(content);
      let inClassAttribute = false;

      walk(parsed.html, {

        enter: (node) => {
          // class property class="class1 class2 {something ? 'class3' : 'class4'}"
          if (node.type === 'Attribute' && node.name === 'class') inClassAttribute = true;

          if (inClassAttribute) {
            console.log(node);
            if (node.type === 'Text') {
              replaceName(magicContent, node.raw as string, node.start);
            } else if (node.type == 'MustacheTag') {
              const 
                expressStart = node.start + 1, 
                expressEnd = node.end - 1;
              const expressionText = content.substr(expressStart, expressEnd - expressStart);
              replaceName(magicContent, expressionText, expressStart, `(${expressionText}) + '${staticSuffix}'`)
            }
          }

          // class directive class:class1={expression} class:class4
          if (node.type === 'Class') {
            replaceName(magicContent, node.name, node.start + 'class:'.length);

            // shortcut expression class:classVar
            const shortcutExprEnd = node.start + 'class:'.length + node.name.length;
            if (node.end === shortcutExprEnd) {
              const varName = node.expression.name;
              magicContent.appendRight(shortcutExprEnd, `={${varName}}`);
            }
          }

        },

        leave: (node) => {
          if (node.type === 'Attribute' && node.name === 'class') inClassAttribute = false;
        },
      });

      walk(parsed.css, {

        enter: (node) => {

          if (node.type === 'ClassSelector') {
            replaceName(magicContent, node.name, node.start + 1);
          } else if(node.type === 'PseudoClassSelector' && node.name === 'global' ) {
            (node.children as Node[]).forEach( (n) => {
              const matches = n.value.match(/\.([\w-_]+)/g) || [];
              for(const c of matches) {
                const cIdx = n.value.indexOf(c);
                replaceName(magicContent, c, n.start + cIdx);
              }
            });
          }
        },
      });


      return {
        code: magicContent.toString(),
        map: magicContent.generateMap({ source: filename }).toString(),
      };
    },

  }
};
