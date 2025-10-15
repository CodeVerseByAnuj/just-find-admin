'use client'
import { useEffect, useRef, useState } from 'react'
import { Button, Modal, ModalBody, Textarea } from 'flowbite-react'
import { Icon } from '@iconify/react'
import { compileCode } from '@/app/router/compiler.router'
import { CompilerSchemaType } from "@/lib/schemas/Compliler.schema"
import { useCompilerStore } from '@/app/store/compilerStore'
import { parseCInteractiveInputs, buildStdin, type InputItem, parseInteractiveInputs } from './utils/interactiveInput'

type CompilerProps = CompilerSchemaType

type Judge0Result = {
  stdout?: string | null
  stderr?: string | null
  compile_output?: string | null
  message?: string | null
  time?: string | null
  memory?: number | null
  status?: { id: number; description: string }
}

const fromBase64 = (b64?: string | null) => {
  if (!b64) return ''
  try {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  } catch {
    return '(failed to decode output)'
  }
}

const Compiler = ({ language_id = 50, stdin = '', source_code = '' }: CompilerProps) => {
  const [popupModal, setPopupModal] = useState(false)
  const [code, setCode] = useState(source_code)
  const [isRunning, setIsRunning] = useState(false)

  // Terminal state
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [rtMode, setRtMode] = useState(false)
  const [rtItems, setRtItems] = useState<InputItem[] | null>(null)
  const [rtIndex, setRtIndex] = useState(0)
  const [rtAnswers, setRtAnswers] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState('')

  const abortRef = useRef<AbortController | null>(null)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { addOutput, clearHistory } = useCompilerStore()

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLines])

  // Focus input when in rtMode
  useEffect(() => {
    if (rtMode && !isRunning) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [rtMode, rtIndex, isRunning])

  const addTerminalLine = (text: string) => {
    setTerminalLines(prev => [...prev, text])
  }

  const execute = async (finalStdin: string) => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setIsRunning(true)
    addTerminalLine('> Compiling and running...')
    addTerminalLine('')
    
    try {
      const result: Judge0Result = await compileCode({
        source_code: code,
        language_id,
        stdin: finalStdin,
      })

      const status = result?.status?.description ?? 'Unknown'
      const compileErr = fromBase64(result.compile_output)
      const runErr = fromBase64(result.stderr) || (result.message ?? '')
      const out = fromBase64(result.stdout)

      const meta: string[] = []
      if (result.time) meta.push(`time: ${result.time}s`)
      if (result.memory) meta.push(`mem: ${result.memory} KB`)

      addTerminalLine(`[${status}${meta.length ? ' | ' + meta.join(', ') : ''}]`)
      
      if (compileErr) {
        addTerminalLine('Compilation Error:')
        addTerminalLine(compileErr)
      } else if (runErr) {
        addTerminalLine('Runtime Error:')
        addTerminalLine(runErr)
      } else {
        // Filter out prompts from output if in interactive mode
        let displayOutput = out || '(no output)'
        if (rtItems && rtItems.length > 0) {
          let filtered = displayOutput
          // Remove all prompt strings from output
          rtItems.forEach(item => {
            if (item.prompt) {
              filtered = filtered.replace(item.prompt, '').trim()
            }
          })
          displayOutput = filtered || '(no output)'
        }
        addTerminalLine(displayOutput)
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        addTerminalLine('> Execution cancelled')
        return
      }
      const errMsg = `Error: ${String(err?.message ?? err)}`
      addTerminalLine(errMsg)
      addOutput(errMsg)
    } finally {
      setIsRunning(false)
      setRtMode(false)
      setRtItems(null)
      setRtAnswers([])
      setRtIndex(0)
    }
  }

  const handleInputSubmit = () => {
    if (!currentInput.trim() || isRunning || !rtMode || !rtItems) return

    const group = rtItems[rtIndex]
    const baseIndex = rtItems.slice(0, rtIndex).reduce((a, b) => a + b.fields.length, 0)
    
    // Show what user typed in terminal
    addTerminalLine(`$ ${currentInput}`)
    
    // Split input by spaces for multiple values
    const values = currentInput.trim().split(/\s+/)
    const newAnswers = [...rtAnswers]
    
    values.forEach((val, idx) => {
      if (baseIndex + idx < baseIndex + group.fields.length) {
        newAnswers[baseIndex + idx] = val
      }
    })
    
    setRtAnswers(newAnswers)
    setCurrentInput('')
    
    // Check if current group is complete
    const filled = group.fields.every((_, k) => (newAnswers[baseIndex + k] ?? '').trim().length > 0)
    
    if (filled) {
      if (rtIndex < rtItems.length - 1) {
        // Move to next input group
        const nextIdx = rtIndex + 1
        setRtIndex(nextIdx)
        // Show prompt for next group
        setTimeout(() => {
          const nextGroup = rtItems[nextIdx]
          if (nextGroup?.prompt) {
            addTerminalLine(nextGroup.prompt)
          }
        }, 50)
      } else {
        // All inputs collected, run the program
        addTerminalLine('')
        const finalStdin = buildStdin(rtItems, newAnswers)
        execute(finalStdin)
      }
    }
  }

  const onRun = async () => {
    if (isRunning || !code.trim() || rtMode) return

    // Clear terminal for new run
    setTerminalLines([])
    
    // Try to detect interactive inputs
    const items = parseInteractiveInputs(code, language_id)
    
    if (items.length > 0 && language_id === 50) {
      // Enable interactive mode
      setRtItems(items)
      setRtIndex(0)
      setRtAnswers([])
      setRtMode(true)
      
      addTerminalLine('> Running program...')
      if (items[0]?.prompt) {
        addTerminalLine(items[0].prompt)
      }
      return
    }

    // No interactive inputs detected, run directly
    await execute('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleInputSubmit()
    }
  }

  const clearTerminal = () => {
    setTerminalLines([])
    setCurrentInput('')
    setRtMode(false)
    setRtItems(null)
    setRtAnswers([])
    setRtIndex(0)
    clearHistory()
  }

  const statusPill = (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-3 h-3 rounded-full ${
        isRunning ? 'bg-yellow-400' : 
        rtMode ? 'bg-blue-400' : 
        'bg-green-400'
      }`}></div>
      <span>{isRunning ? 'Running' : rtMode ? 'Waiting for input' : 'Ready'}</span>
    </div>
  )

  return (
    <div>
      <Button onClick={() => setPopupModal(true)}>
        <Icon icon="mdi:code-tags" className="mr-2" height={20} />
        Compiler
      </Button>

      <Modal
        show={popupModal}
        size="8xl"
        onClose={() => setPopupModal(false)}
        popup
        className="backdrop-blur-sm"
      >
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Icon icon="mdi:console-line" height={24} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Interactive Code Compiler</h3>
            </div>
          </div>
          <button
            onClick={() => setPopupModal(false)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <Icon icon="mdi:close" height={20} />
          </button>
        </div>

        <ModalBody className="p-0 bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left: Code Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon icon="mdi:code-braces" className="text-blue-500" height={20} />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Code Editor</h4>
                  </div>
                  {statusPill}
                </div>

                <div className="relative">
                  <Textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    rows={22}
                    className="font-mono text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    placeholder="// Write your code here..."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                    {code.split('\n').length} lines
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={onRun}
                    disabled={isRunning || !code.trim() || rtMode}
                    size="md"
                  >
                    {isRunning ? (
                      <>
                        <Icon icon="mdi:loading" className="animate-spin mr-2" height={20} />
                        Running...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:play" className="mr-2" height={20} />
                        Run Code
                      </>
                    )}
                  </Button>

                  <Button
                    color="gray"
                    size="md"
                    onClick={() => {
                      abortRef.current?.abort()
                      setIsRunning(false)
                      setRtMode(false)
                      addTerminalLine('> Stopped by user')
                    }}
                    disabled={!isRunning && !rtMode}
                  >
                    <Icon icon="mdi:stop" className="mr-2" height={18} />
                    Stop
                  </Button>
                </div>
              </div>

              {/* Right: Terminal */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon icon="mdi:monitor" className="text-green-500" height={20} />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Terminal</h4>
                  </div>
                  <Button
                    onClick={clearTerminal}
                    size="xs"
                    color="gray"
                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                    disabled={isRunning}
                  >
                    <Icon icon="mdi:delete-sweep" className="mr-1" height={16} />
                    Clear
                  </Button>
                </div>

                <div className="relative bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden">
                  {/* Terminal Header */}
                  <div className="h-8 bg-gray-800 flex items-center px-3 space-x-2 border-b border-gray-700">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-400 ml-2">bash</span>
                  </div>

                  {/* Terminal Content */}
                  <div className="h-[500px] overflow-y-auto p-4 font-mono text-sm">
                    {terminalLines.length === 0 && !rtMode && (
                      <div className="text-gray-500">
                        $ Click "Run Code" to execute your program...
                      </div>
                    )}
                    
                    {terminalLines.map((line, idx) => (
                      <div key={idx} className="text-green-400 whitespace-pre-wrap">
                        {line}
                      </div>
                    ))}

                    {/* Interactive Input Line */}
                    {rtMode && !isRunning && (
                      <div className="flex items-center mt-1">
                        <span className="text-green-400 mr-2">$</span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={currentInput}
                          onChange={e => setCurrentInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 !bg-[#ffffff14] !border-none !px-3 !py-1.5 outline-none !text-green-400 font-mono text-sm !caret-green-400"
                          placeholder={rtItems && rtItems[rtIndex] ? 
                            `Enter ${rtItems[rtIndex].fields.map(f => f.type).join(', ')}...` : 
                            'Type input...'
                          }
                          autoFocus
                        />
                      </div>
                    )}

                    <div ref={terminalEndRef} />
                  </div>
                </div>

                <div className="text-xs text-gray-400 text-right">
                  {rtMode ? 'Press Enter to submit input' : 'Terminal output will appear above'}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )
}

export default Compiler