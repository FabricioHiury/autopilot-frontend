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
import {
  LexicalComposerContext,
  useLexicalComposerContext,
} from '@lexical/react/LexicalComposerContext';
import { ChangeEventHandler, useEffect, useState } from 'react';

const placeholder = 'Digite o conteúdo...';

const editorConfig = {
  namespace: 'React.js Demo',
  nodes: [ParagraphNode, TextNode],
  editable: true,
  onError(error: Error) {
    throw error;
  },
  theme: ExampleTheme,
};

export default function LexicalMod({
  initialState,
  setEditorState,
  setText,
}: {
  initialState: any;
  setEditorState: (value: string) => void;
  setText: (v: string) => void;
}) {
  function onChange(state: any) {
    const editorStateJSON = state.toJSON();
    setEditorState(JSON.stringify(editorStateJSON)); //Envia esse json maluco pro backend..
  }
  function onChangeText(text: string) {
    setText(text);
  }

  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: initialState,
      }}
    >
      <div className="editor-container w-full flex-grow  ">
        <ToolbarPlugin />
        <div className="editor-inner w-full h-[300px] overflow-y-auto scroll-padrao">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input w-full h-full  "
                aria-placeholder={placeholder}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />

          <AutoFocusPlugin />
          <MyOnChangePlugin onChangeText={onChangeText} onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}

function MyOnChangePlugin({
  onChange,
  onChangeText,
}: {
  onChange: Function;
  onChangeText: Function;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Listen for text content changes
    const unregisterTextListener = editor.registerTextContentListener((text) => {
      onChangeText(text);
    });

    return () => {
      unregisterTextListener();
    };
  }, [editor, onChangeText]); // Add dependencies

  useEffect(() => {
    // Listen for editor state changes
    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState);
    });

    return () => {
      unregisterUpdateListener();
    };
  }, [editor, onChange]); // Add dependencies

  return null;
}
