'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '@/lib/upload'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, AlignLeft, AlignCenter, AlignRight,
  Highlighter, Undo, Redo, Upload
} from 'lucide-react'
import './editor.css'

const lowlight = createLowlight(common)

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

const Editor = ({ value, onChange }: EditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleImageUpload(file)
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile()
              if (file) {
                event.preventDefault()
                handleImageUpload(file)
                return true
              }
            }
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const url = await uploadImage(file)
    setUploading(false)

    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    } else {
      alert('이미지 업로드에 실패했습니다.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const addLink = () => {
    const url = window.prompt('URL을 입력하세요')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }

  if (!editor) {
    return <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  }

  const ToolbarButton = ({ onClick, active, children, title }: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        active ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white'
      }`}
      type="button"
      title={title}
    >
      {children}
    </button>
  )

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <div className="border-b bg-gray-50 p-3 sticky top-0 z-10">
        <div className="flex flex-wrap gap-1">
          {/* Undo/Redo */}
          <div className="flex gap-1 pr-2 border-r">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="실행 취소">
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="다시 실행">
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Text Formatting */}
          <div className="flex gap-1 pr-2 border-r">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="굵게"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="기울임"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="밑줄"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="취소선"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              active={editor.isActive('highlight')}
              title="형광펜"
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex gap-1 pr-2 border-r">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="제목 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="제목 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="제목 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 pr-2 border-r">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              title="왼쪽 정렬"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              title="가운데 정렬"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              title="오른쪽 정렬"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex gap-1 pr-2 border-r">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="글머리 기호"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="번호 매기기"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Insert */}
          <div className="flex gap-1 pr-2 border-r">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              title="코드 블록"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="인용구"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={addLink}
              active={editor.isActive('link')}
              title="링크"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={addTable}
              active={editor.isActive('table')}
              title="표 삽입"
            >
              <TableIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Image Upload */}
          <div className="flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              title="이미지 업로드"
            >
              {uploading ? (
                <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </ToolbarButton>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          💡 이미지를 드래그&드롭하거나 붙여넣기 할 수 있습니다
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

export default Editor
