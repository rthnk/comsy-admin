<template>
  <div class="MonacoEditor-container">
    <div class="MonacoEditor" :data-language="this.language"></div>
  </div>
</template>

<script>
/* global monaco */

import { mapState } from "vuex";
import enableEmmet from "monaco-emmet";

export default {
  name: "MonacoEditor",
  props: ["language", "value", "reloadEditor"],
  data: () => ({
    isCollapsed: false,
    cursorItems: {},
  }),
  computed: mapState({
  }),
  watch: {
    value(newCode /*, oldCode */) {
      if (this.editor) {
        this.editor.setValue(newCode || '');
        this.$nextTick(() => {
          this.editor.layout();
        });
      }
    },
    reloadEditor() {
      if (this.editor) {
        this.$nextTick(() => {
          this.editor.layout();
        });
      }
    },
  },
  mounted() {
    this.lang = this.language == "javascript" ? "js" : this.language;
    this.container = document.querySelector(
      `.MonacoEditor[data-language="${this.language}"]`
    );
    this.editor = null;
    this.prepareEditor(this.container);
  },
  methods: {
    prepareEvents() {
      this.editor.onKeyUp(_event => {
        const value = this.editor.getValue();
        this.$emit('input', value);
      });
      window.addEventListener("resize", () => this.editor.layout());
    },
    async prepareMonaco() {
      return new Promise((resolve, reject) => {
        window.require.config({
          paths: {
            vs: "//cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.15.6/min/vs"
          },
          onError: error => reject(error)
        });
        window.require(["vs/editor/editor.main"], function() {
          resolve(monaco);
        });
      });
    },
    async prepareEditor(root) {
      const monaco = await this.prepareMonaco();
      // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        extraEditorClassName: "monaco-editor-style"
      });
      this.editor = monaco.editor.create(root, {
        value: this.value,
        language: this.language || "javascript"
      });
      if (this.language == "html") {
        enableEmmet(this.editor);
      }
      this.editor.updateOptions({
        hideCursorInOverviewRuler: true,
        lineDecorationsWidth: 0,
        lineNumbers: true,
        minimap: {
          enabled: false
        },
        scrollbar: {
          // Subtle shadows to the left & top. Defaults to true.
          useShadows: false,
          // Render vertical arrows. Defaults to false.
          verticalHasArrows: false,
          // Render horizontal arrows. Defaults to false.
          horizontalHasArrows: false,
          // Render vertical scrollbar.
          // Accepted values: 'auto', 'visible', 'hidden'.
          // Defaults to 'auto'
          vertical: "hidden",
          // Render horizontal scrollbar.
          // Accepted values: 'auto', 'visible', 'hidden'.
          // Defaults to 'auto'
          horizontal: "hidden",
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          arrowSize: 10
        },
        renderLineHighlight: "none",
        scrollBeyondLastColumn: 0,
        scrollBeyondLastRow: 0
      });
      window.editor = this.editor;
      this.prepareEvents();
    }
  }
};
</script>

<style lang="scss">
.MonacoEditor {
  height: calc(72vh - 3px);
  width: calc(100% - 1px);
  &-container {
    max-height: 250px;
    overflow: hidden;
    margin: 5px 0;
  }

  .monaco-editor .monaco-scrollable-element .scrollbar.horizontal,
  .monaco-editor .decorationsOverviewRuler,
  .monaco-editor
    .monaco-scrollable-element
    .scrollbar.vertical
    .arrow-background {
    background: rgba(230, 230, 230, 255);
  }
  /* Make vertical scrollbar transparent to allow decorations overview ruler to be visible */
  .monaco-editor .monaco-scrollable-element .scrollbar.vertical {
    background: rgba(0, 0, 0, 0);
    width: 10px !important; // God, forgive me for this... :'(
  }
}
</style>
