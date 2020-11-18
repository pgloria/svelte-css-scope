import { resolve } from 'path';

import cssScoper from '../src';

const filename = resolve(__dirname, 'App.svelte');

test('should update classes in the template class attribute', async () => {
  const template = '<div class="class1 class2" />';
  const processor = cssScoper({});
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toBe('<div class="class1-xyz class2-xyz" />');
});

test('should update class expressions in the template class attribute', async () => {
  const template = `<div class="{23==23 ? 'class1' : 'class2'}" />`;
  const processor = cssScoper({});
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toBe(`<div class="{(23==23 ? 'class1' : 'class2') + '-xyz'}" />`);
});

test('should update class directives with expressions', async () => {
  const template = `<div class:class1={a} />`;
  const processor = cssScoper({});
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toBe(`<div class:class1-xyz={a} />`);
});

test('should update class directives without expressions', async () => {
  const template = `<div class:class2 />`;
  const processor = cssScoper({});
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toBe(`<div class:class2-xyz={class2} />`);
});

/// Style tests
test('should update simple class directives in the style tag', async () => {
  const template = `
  <style>
  .class1 .class2 + .class3 .class4.class5 {
    margin: 0;
  }
  </style>`;
  const processor = cssScoper({});
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toContain('.class1-xyz .class2-xyz + .class3-xyz .class4-xyz.class5-xyz');
});

test('should update simple class inside global directives', async () => {
  const template = `
  <style>
  :global(.class1 .class2 + .class3 .class4.class5) {
    margin: 0;
  }
  </style>`;
  const processor = cssScoper({});
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toContain('.class1-xyz .class2-xyz + .class3-xyz .class4-xyz.class5-xyz');
});


test('should have no influence in any other selector', async () => {
  const template = `
  <style>
  :global(* :after div h1) {
    margin: 0;
  }
  </style>`;
  const processor = cssScoper({});
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toBe(template);
});

test('should have no influence in any other selector', async () => {
  const template = `
  <style>
  :global(* :after div h1) {
    margin: 0;
  }
  </style>`;
  const processor = cssScoper({});
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toBe(template);
});
