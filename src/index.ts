import {LRLanguage, LanguageSupport} from "@codemirror/language"
import {htmlLanguage as originalHtmlLanguage} from "@codemirror/lang-html"
import {javascriptLanguage as originalJavascriptLanguage} from "@codemirror/lang-javascript"
import {styleTags, tags as t} from "@lezer/highlight"
import {parseMixed, SyntaxNodeRef, Input} from "@lezer/common"
import {parser} from "./syntax.grammar"
import {basicSetup} from "codemirror"
import * as autocomplete from "@codemirror/autocomplete";
import * as commands from "@codemirror/commands";
import * as collaboration from "@codemirror/collab";
import * as language from "@codemirror/language";
import * as lint from "@codemirror/lint";
import * as state from "@codemirror/state";
import * as search from "@codemirror/search";
import * as view from "@codemirror/view";
import * as html from "@codemirror/lang-html";
import * as vue from "@codemirror/lang-vue";
import * as javascript from "@codemirror/lang-javascript";
import * as php from "@codemirror/lang-php";
import * as css from "@codemirror/lang-css";
import * as json from "@codemirror/lang-json";
import * as markdown from "@codemirror/lang-markdown";
import * as xml from "@codemirror/lang-xml";
import * as theme from "thememirror";

const htmlLanguage = originalHtmlLanguage;
const javascriptLanguage = originalJavascriptLanguage;


const exprParser = javascriptLanguage.parser.configure({
  top: "SingleExpression"
})

const baseParser = parser.configure({
  props: [
    styleTags({
      Text: t.content,
      Is: t.definitionOperator,
      AttributeName: t.attributeName,
      VueAttributeName: t.keyword,
      Identifier: t.variableName,
      "AttributeValue ScriptAttributeValue": t.attributeValue,
      Entity: t.character,
      "{{ }}": t.brace,
      "@ :": t.punctuation
    })
  ]
})

const exprMixed = {parser: exprParser}

const textParser = baseParser.configure({
  wrap: parseMixed((node, input) => node.name == "InterpolationContent" ? exprMixed : null),
})

const attrParser = baseParser.configure({
  wrap: parseMixed((node, input) => node.name == "AttributeScript" ? exprMixed : null),
  top: "Attribute"
})

const textMixed = {parser: textParser}, attrMixed = {parser: attrParser}

/// A language provider for Vue templates.
const vueLanguage = LRLanguage.define({
  name: "vue",
  parser: htmlLanguage.parser.configure({
    dialect: "selfClosing",
    wrap: parseMixed(mixVue)
  }),
  languageData: {
    closeBrackets: {brackets: ["{", '"']}
  }
})

function mixVue(node: SyntaxNodeRef, input: Input) {
  switch (node.name) {
    case "Attribute":
      return /^(@|:|v-)/.test(input.read(node.from, node.from + 2)) ? attrMixed : null
    case "Text":
      return textMixed
  }
  return null
}

const languageExtensions = {
  javascript: [new LanguageSupport(javascriptLanguage)],
  html: [new LanguageSupport(htmlLanguage)],
  css: [new LanguageSupport(css.cssLanguage)],
  php: [new LanguageSupport(php.phpLanguage)],
  json: [new LanguageSupport(json.jsonLanguage)],
  markdown: [new LanguageSupport(markdown.markdownLanguage)],
  xml: [new LanguageSupport(xml.xmlLanguage)],
  vue: [new LanguageSupport(vueLanguage)]
};

const codemirrortest = {
  autocomplete,
  commands,
  collaboration,
  language,
  languageExtensions,
  lint,
  state,
  search,
  view,
  vueTest: vueLanguage,
  vue,
  html,
  javascript,
  php,
  css,
  json,
  markdown,
  xml,
  theme,
  getBasicExtensions(cm : any) {
    if (!cm.ext) {
      cm.ext = {
        lineNumbers: cm.view.lineNumbers(),
        highlightActiveLineGutter: cm.view.highlightActiveLineGutter(),
        highlightSpecialChars: cm.view.highlightSpecialChars(),
        history: cm.commands.history(),
        foldGutter: cm.language.foldGutter(),
        drawSelection: cm.view.drawSelection(),
        dropCursor: cm.view.dropCursor(),
        allowMultipleSelections: cm.state.EditorState.allowMultipleSelections.of(true),
        indentOnInput: cm.language.indentOnInput(),
        syntaxHighlighting: cm.language.syntaxHighlighting(cm.language.defaultHighlightStyle, {fallback: true}),
        bracketMatching: cm.language.bracketMatching(),
        closeBrackets: cm.autocomplete.closeBrackets(),
        autocompletion: cm.autocomplete.autocompletion(),
        rectangularSelection: cm.view.rectangularSelection(),
        crosshairCursor: cm.view.crosshairCursor(),
        highlightActiveLine: cm.view.highlightActiveLine(),
        highlightSelectionMatches: cm.search.highlightSelectionMatches(),
        keymap: cm.view.keymap.of([
          ...cm.autocomplete.closeBracketsKeymap,
          ...cm.commands.defaultKeymap,
          ...cm.search.searchKeymap,
          ...cm.commands.historyKeymap,
          ...cm.language.foldKeymap,
          ...cm.autocomplete.completionKeymap,
          ...cm.lint.lintKeymap,
          cm.commands.indentWithTab
        ]),
      };
    }
    return cm.ext;
  }
};

export default codemirrortest;