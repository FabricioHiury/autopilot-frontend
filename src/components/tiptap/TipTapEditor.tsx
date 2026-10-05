// src/Tiptap.tsx
import { EditorProvider, FloatingMenu, BubbleMenu, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './TipTap.css';
import SelectRedMin from '../inputs/select/SelectRedMin';
type Level = 1 | 2 | 3 | 4 | 5 | 6;
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

import { Label } from '../commons/label';
import { cn } from '@/lib/class-name.utils';
import { useEffect, useRef, useState } from 'react';
import api, { apiAdmin } from '@/utils/classes/api';

// define your extension array
const extensions = [
  StarterKit,
  Image,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
];

function Tiptap({
  content,
  onChange = () => {},
  viewOnly = false,
}: {
  content: string;
  onChange?: (v: string) => void;
  viewOnly?: boolean;
}) {
  function updateContent(e: any) {
    onChange(e.editor.getHTML());
  }

  return (
    <div className={cn(viewOnly ? '' : 'pt-10', 'relative')}>
      <EditorProvider
        extensions={extensions}
        editable={!viewOnly}
        content={content}
        onUpdate={updateContent}
      >
        {!viewOnly && (
          <div className="absolute top-0">
            <MenuTop />
          </div>
        )}
      </EditorProvider>
    </div>
  );
}

const MenuTop = () => {
  const { editor } = useCurrentEditor();
  const refImage = useRef<HTMLInputElement>(null);

  const inserirImagem = async (event: any) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;
    const url = await sendFile(file);
    if (!url) return;
    if (!editor) return;

    editor.commands.setImage({
      src: url,
      alt: file.name,
      title: file.name,
    });
    input.value = '';
  };

  const sendFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const [r, e] = await apiAdmin.formData('/faq/image', formData, 'POST');
    if (e) {
      console.error(e);
      return null;
    }
    console.log(r);
    return r.data.url;
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex  items-center gap-2">
      <div className="flex items-center gap-2 w-full py-1">
        <div className="grid">
          <SelectRedMin
            options={[
              {
                label: 'Titulo 1',
                value: '1',
              },
              {
                label: 'Titulo 2',
                value: '2',
              },
              {
                label: 'Titulo 3',
                value: '3',
              },
            ]}
            onChange={(v) => {
              console.log('change');
              editor
                .chain()
                .focus()
                .toggleHeading({ level: parseInt(v.value) as Level })
                .run();
            }}
          />
        </div>
        <BordaBonitinha />
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') ? '' : '', 'shrink-0  flex p-0')}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            className="shrink-0"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.66602 5.5C4.66602 4.32149 4.66602 3.73223 5.03213 3.36612C5.39825 3 5.98751 3 7.16602 3H10.9818C13.0165 3 14.666 4.67893 14.666 6.75C14.666 8.82107 13.0165 10.5 10.9818 10.5H4.66602V5.5Z"
              stroke="#24292E"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.8565 10.5H11.8883C13.8826 10.5 15.4993 12.1789 15.4993 14.25C15.4993 16.3211 13.8826 18 11.8883 18H7.16602C5.98751 18 5.39825 18 5.03213 17.6339C4.66602 17.2677 4.66602 16.6785 4.66602 15.5V10.5"
              stroke="#24292E"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5 3.83301H16.3333"
              stroke="#24292E"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M7.16602 17.1663L13.8327 3.83301"
              stroke="#24292E"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M4.66602 17.167H10.4993"
              stroke="#24292E"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.commands.setTextAlign('left')}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={21}
            height={21}
            fill="none"
            className="scale-x-[-1]"
          >
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.3}
              d="M3 3h15M11.334 8h6.667"
            />
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.25}
              d="M3 13h15M11.334 18h6.667"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.commands.setTextAlign('center')}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3H18"
              stroke="#24292E"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.16797 8H13.8346"
              stroke="#24292E"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 13H18"
              stroke="#24292E"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.16797 18H13.8346"
              stroke="#24292E"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.commands.setTextAlign('right')}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={21} height={21} fill="none">
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.3}
              d="M3 3h15M11.334 8h6.667"
            />
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.25}
              d="M3 13h15M11.334 18h6.667"
            />
          </svg>
        </button>
        <BordaBonitinha />
        <button
          onClick={() => {
            editor.chain().focus().toggleOrderedList().run();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={21} height={21}>
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeWidth={1.3}
              d="M9.668 5.5h8.333M9.668 10.5h8.333"
            />
            <path stroke="#24292E" strokeLinecap="round" strokeWidth={1.25} d="M9.668 15.5h8.333" />
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.25}
              d="M3 13h1.25c.232 0 .348 0 .445.02a1 1 0 0 1 .786.785c.019.097.019.213.019.445s0 .348-.02.445a1 1 0 0 1-.785.786c-.097.019-.213.019-.445.019s-.348 0-.445.02a1 1 0 0 0-.786.785C3 16.4 3 16.518 3 16.75v.75c0 .236 0 .354.073.427.073.073.191.073.427.073h2M3 3h1a.25.25 0 0 1 .25.25V8m0 0H3m1.25 0H5.5"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            editor.chain().focus().toggleBulletList().run();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={21} height={21} fill="none">
            <path stroke="#24292E" strokeLinecap="round" strokeWidth={1.3} d="M7.168 4.667h10" />
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.3}
              d="M3.834 4.667h.007"
            />
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.667}
              d="M3.834 10.5h.007M3.834 16.333h.007"
            />
            <path
              stroke="#24292E"
              strokeLinecap="round"
              strokeWidth={1.25}
              d="M7.168 10.5h10M7.168 16.333h10"
            />
          </svg>
        </button>
        <BordaBonitinha />
        <button
          onClick={() => {
            if (!refImage.current) return;
            refImage.current.click();
          }}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.58203 10.4997C2.58203 6.76772 2.58203 4.90175 3.7414 3.74237C4.90077 2.58301 6.76675 2.58301 10.4987 2.58301C14.2306 2.58301 16.0966 2.58301 17.256 3.74237C18.4154 4.90175 18.4154 6.76772 18.4154 10.4997C18.4154 14.2316 18.4154 16.0976 17.256 17.257C16.0966 18.4163 14.2306 18.4163 10.4987 18.4163C6.76675 18.4163 4.90077 18.4163 3.7414 17.257C2.58203 16.0976 2.58203 14.2316 2.58203 10.4997Z"
              stroke="#24292E"
              strokeWidth="1.3"
            />
            <path
              d="M14.25 8C14.9404 8 15.5 7.44036 15.5 6.75C15.5 6.05964 14.9404 5.5 14.25 5.5C13.5596 5.5 13 6.05964 13 6.75C13 7.44036 13.5596 8 14.25 8Z"
              stroke="#24292E"
              strokeWidth="1.3"
            />
            <path
              d="M13.8333 18.8336C13.3171 16.9794 12.1121 15.3187 10.3971 14.1121C8.54801 12.8111 6.22636 12.1225 3.84641 12.1692C3.56382 12.1686 3.28147 12.1776 3 12.1962"
              stroke="#24292E"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <path
              d="M11.332 15.4996C12.7499 14.3941 14.2774 13.827 15.8205 13.8331C16.6955 13.8321 17.5664 14.0176 18.4154 14.3844"
              stroke="#24292E"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.87111 15.5505L13.8852 8.83648C14.7274 8.03038 14.7274 6.72344 13.8852 5.91734C13.0431 5.11124 11.6777 5.11124 10.8356 5.91734L3.87233 12.5827C2.27228 14.1143 2.27228 16.5975 3.87233 18.1291C5.47237 19.6607 8.06655 19.6607 9.66659 18.1291L16.7315 11.3664C19.0895 9.10933 19.0895 5.44988 16.7315 3.19281C14.3736 0.935731 10.5506 0.935731 8.19261 3.19281L2.5 8.64187"
              stroke="#24292E"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <input type="file" className="hidden" ref={refImage} onChange={inserirImagem} />
    </div>
  );
};

const BordaBonitinha = () => {
  return (
    <svg width="3" height="13" viewBox="0 0 3 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.858 12.9V0.789999H2.412V12.9H0.858Z" fill="#D7E0EA" />
    </svg>
  );
};

export default Tiptap;
