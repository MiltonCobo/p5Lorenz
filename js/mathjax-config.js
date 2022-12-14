window.MathJax = {
  // loader: { load: ['[tex]/textmacros'] },
  // tex: { packages: { '[+]': ['textmacros'] } },
  skipStartupTypeset: true,
  'fast-preview': { disabled: true },
  messageStyle: 'none',
  jax: ['input/TeX', 'output/CommonHTML'],
  extensions: ['tex2jax.js', 'Safe.js'],
  // styles: {  // styles are set in variables.scss
  //   '.mjx-chtml ': {
  //     // 'text-align': 'center !important;',
  //     // color: 'var(--myGreen)',
  //     //   padding: '0.1em 0.1em;',
  //     // margin: '1em 0em',
  //   },
  //   // '.MJXc-diplay': { 'text-align': 'center' },
  // },
  // displayAlign: 'center',

  TeX: {
    equationNumbers: { autoNumber: 'AMS' },
    extensions: ['AMSmath.js', 'AMSsymbols.js', 'AMScd.js', 'autobold.js'],
    Macros: {
      e: '{\\textrm{e}}',
      R: '{\\mathbb{R}}',
      Z: '{\\mathbb Z}',
      N: '{\\mathbb N}',
      KK: '{\\mathbb{K}}',
    },
  },
  tex2jax: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: false,
  },
  CommonHTML: {
    scale: 100,
    linebreaks: { automatic: true },
    preferredFont: 'Asana Math',
  },

  showProcessingMessages: false,
  menuSettings: { zoom: 'Double-Click', mpContext: true, mpMouse: true },
};
(function () {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.id = 'MathJax-script';
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@2/MathJax.js';
  //'https://cdn.jsdelivr.net/npm/mathjax@2.7.8/MathJax.js
  //?config=TeX-AMS-MML_SVG'

  script.async = true;
  document.head.appendChild(script);
})();
