'use client'

import { Editor } from '@tinymce/tinymce-react'
import React, { useRef } from 'react'
import api from '@/lib/axios'

interface MyEditorProps {
  id: string
  value: string,
  placeholder: string,
  onChange: (content: string) => void
  readOnly?: boolean
}

const MyEditor: React.FC<MyEditorProps> = ({ id, value, placeholder, onChange, readOnly = false }) => {
  const editorRef = useRef<any>(null)
  // Convert \n to <br /> for readOnly mode
  const displayValue = readOnly ? value.replace(/\n/g, '<br>') : value;

  return (
    <Editor
      id={id}
      tinymceScriptSrc="/tinymce/js/tinymce/tinymce.min.js"
      onInit={(evt: any, editor: Editor) => (editorRef.current = editor)}
      value={displayValue}
      outputFormat="html"
      init={{
        height: 150,
        menubar: readOnly ? false : true,
        placeholder: placeholder, // ✅ correct place for placeholder
        readonly: readOnly,
        statusbar: !readOnly,
        branding: false,
        editable_root: !readOnly,
        toolbar_mode: readOnly ? 'wrap' : 'floating',
        plugins: readOnly ? [
          'preview',
          'wordcount',
        ] : [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'searchreplace',
          'wordcount',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'code',
          'help',
        ],
        toolbar: readOnly ? '' :
          'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'image | removeformat | help',
        content_style:
          'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        automatic_uploads: !readOnly,
        images_upload_url: readOnly ? undefined : '/api/upload-image',
        file_picker_types: readOnly ? undefined : 'image',
        file_picker_callback: readOnly ? undefined : function (
          callback: (url: string, meta?: { title?: string }) => void,
          value: string,
          meta: { filetype: string }
        ) {
          if (meta.filetype === 'image') {
            const input = document.createElement('input')
            input.setAttribute('type', 'file')
            input.setAttribute('accept', 'image/*')
            input.onchange = function () {
              const file = (this as HTMLInputElement).files![0]
              const formData = new FormData()
              formData.append('file', file)

              // fetch('https://gradesmithapis.infutrix.com/file-upload', {
              //   method: 'POST',
              //   body: formData,
              // })
              api.post('/file-upload', formData)
                .then((res) => res.data)
                .then((data) => {
                  callback(data.data)
                })
                .catch((err) => console.error('Image upload failed:', err))
            }
            input.click()
          }
        },
      }}
      onEditorChange={onChange}
    />
  )
}

export default MyEditor
