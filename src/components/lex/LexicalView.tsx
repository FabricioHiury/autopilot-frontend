/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './style.css';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ParagraphNode, TextNode } from 'lexical';

import ExampleTheme from './Theme';
import ToolbarPlugin from './Toolbar';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ChangeEventHandler, useEffect, useState } from 'react';

const placeholder = 'Enter some rich text...';

const editorConfig = {
  namespace: 'React.js Demo',
  nodes: [ParagraphNode, TextNode],
  onError(error: Error) {
    throw error;
  },
  editable: false,
  theme: ExampleTheme,
};

export default function LexicalView({
  editorState,
  setText,
}: {
  editorState: string;
  setText: (text: string) => void;
}) {
  function Init() {
    const [editor] = useLexicalComposerContext();
    editor.registerTextContentListener((t) => {
      setText(t);
    });
    useLexicalComposerContext();
    useEffect(() => {
      editor.setEditorState(editor.parseEditorState(editorState));
    }, []);
    return null;
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container w-full flex-grow  ">
        <div className="w-full h-full bg-transparent scroll-padrao">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className=" w-full h-full bg-none"
                aria-placeholder={placeholder}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <Init />
        </div>
      </div>
    </LexicalComposer>
  );
}
