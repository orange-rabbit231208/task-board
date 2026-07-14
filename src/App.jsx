import { useEffect, useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'task-board.tasks'
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function todayString() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10)
}

function weekdayOf(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return WEEKDAYS[new Date(y, m - 1, d).getDay()]
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y}/${m}/${d}(${weekdayOf(dateStr)})`
}

function formatTimeRange(task) {
  if (!task.startTime && !task.endTime) return ''
  return `${task.startTime} 〜 ${task.endTime}`
}

function taskMetaLabel(task) {
  const dateLabel = task.date ? formatDate(task.date) : '毎日'
  const time = formatTimeRange(task)
  return time ? `${dateLabel} ${time}` : dateLabel
}

function byStartTime(a, b) {
  if (!a.startTime && !b.startTime) return 0
  if (!a.startTime) return 1
  if (!b.startTime) return -1
  return a.startTime.localeCompare(b.startTime)
}

function compareTasks(a, b) {
  if (a.done !== b.done) return a.done ? 1 : -1
  const aRoutine = !a.date
  const bRoutine = !b.date
  if (aRoutine !== bRoutine) return aRoutine ? -1 : 1
  return byStartTime(a, b)
}

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [text, setText] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isRoutine, setIsRoutine] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const followingTodayRef = useRef(true)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    const id = setInterval(() => {
      if (!followingTodayRef.current) return
      const current = todayString()
      setSelectedDate((prev) => (prev === current ? prev : current))
    }, 60000)
    return () => clearInterval(id)
  }, [])

  function handleDateChange(e) {
    followingTodayRef.current = false
    setSelectedDate(e.target.value)
  }

  function addTask(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTasks([
      ...tasks,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        memo: '',
        done: false,
        important: false,
        date: isRoutine ? '' : selectedDate,
        startTime,
        endTime,
      },
    ])
    setText('')
    setStartTime('')
    setEndTime('')
    setIsRoutine(false)
  }

  function toggleTask(id) {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    ))
  }

  function toggleImportant(id) {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, important: !task.important } : task
    ))
  }

  function updateMemo(id, memo) {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, memo } : task
    ))
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditDraft(null)
    }
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditDraft({
      text: task.text,
      startTime: task.startTime,
      endTime: task.endTime,
      routine: !task.date,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft(null)
  }

  function saveEdit(e, id) {
    e.preventDefault()
    const trimmed = editDraft.text.trim()
    if (!trimmed) return
    setTasks(tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            text: trimmed,
            startTime: editDraft.startTime,
            endTime: editDraft.endTime,
            date: editDraft.routine ? '' : (task.date || selectedDate),
          }
        : task
    ))
    setEditingId(null)
    setEditDraft(null)
  }

  const visibleTasks = tasks
    .filter((task) => !task.date || task.date === selectedDate)
    .sort(compareTasks)

  return (
    <div className="board">
      <h1>タスクボード</h1>
      <div className="date-row">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          aria-label="日付"
        />
        <span className="weekday">{selectedDate && `${weekdayOf(selectedDate)}曜日`}</span>
      </div>
      <form className="add-form" onSubmit={addTask}>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          aria-label="開始時間"
        />
        <span className="time-separator">〜</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          aria-label="終了時間"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="新しいタスクを入力"
          aria-label="新しいタスク"
        />
        <label className="routine-toggle">
          <input
            type="checkbox"
            checked={isRoutine}
            onChange={(e) => setIsRoutine(e.target.checked)}
          />
          毎日
        </label>
        <button type="submit">追加</button>
      </form>
      {visibleTasks.length === 0 ? (
        <p className="empty">タスクはまだありません</p>
      ) : (
        <ul className="task-list">
          {visibleTasks.map((task) => {
            const rowClass = task.done ? 'task done' : task.important ? 'task important' : 'task'
            const className = task.date ? rowClass : `${rowClass} pinned`

            return (
              <li key={task.id} className={className}>
                {editingId === task.id ? (
                  <form className="edit-form" onSubmit={(e) => saveEdit(e, task.id)}>
                    <input
                      type="time"
                      value={editDraft.startTime}
                      onChange={(e) => setEditDraft({ ...editDraft, startTime: e.target.value })}
                      aria-label="開始時間"
                    />
                    <span className="time-separator">〜</span>
                    <input
                      type="time"
                      value={editDraft.endTime}
                      onChange={(e) => setEditDraft({ ...editDraft, endTime: e.target.value })}
                      aria-label="終了時間"
                    />
                    <input
                      type="text"
                      value={editDraft.text}
                      onChange={(e) => setEditDraft({ ...editDraft, text: e.target.value })}
                      aria-label="タスク名"
                    />
                    <label className="routine-toggle">
                      <input
                        type="checkbox"
                        checked={editDraft.routine}
                        onChange={(e) => setEditDraft({ ...editDraft, routine: e.target.checked })}
                      />
                      毎日
                    </label>
                    <button type="submit">保存</button>
                    <button type="button" onClick={cancelEdit}>
                      キャンセル
                    </button>
                  </form>
                ) : (
                  <div className="task-main">
                    <label className="task-label">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span className="task-body">
                        <span className="task-meta">{taskMetaLabel(task)}</span>
                        <span className="task-title">{task.text}</span>
                      </span>
                    </label>
                    {task.date && (
                      <label className="important-toggle">
                        <input
                          type="checkbox"
                          checked={task.important}
                          onChange={() => toggleImportant(task.id)}
                          aria-label="重要"
                        />
                        重要
                      </label>
                    )}
                    <button
                      type="button"
                      className="edit-button"
                      aria-label="編集"
                      onClick={() => startEdit(task)}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      aria-label="削除"
                      onClick={() => deleteTask(task.id)}
                    >
                      🗑️
                    </button>
                  </div>
                )}
                <textarea
                  className="task-memo-input"
                  value={task.memo}
                  onChange={(e) => updateMemo(task.id, e.target.value)}
                  placeholder="メモ"
                  aria-label="メモ"
                  maxLength={500}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default App
