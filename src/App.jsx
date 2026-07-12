import { useEffect, useState } from 'react'
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

function byStartTime(a, b) {
  if (!a.startTime && !b.startTime) return 0
  if (!a.startTime) return 1
  if (!b.startTime) return -1
  return a.startTime.localeCompare(b.startTime)
}

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [text, setText] = useState('')
  const [date, setDate] = useState(todayString())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  function addTask(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTasks([
      ...tasks,
      { id: crypto.randomUUID(), text: trimmed, done: false, important: false, date, startTime, endTime },
    ])
    setText('')
    setStartTime('')
    setEndTime('')
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

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const sortedTasks = [...tasks].sort(byStartTime)

  return (
    <div className="board">
      <h1>タスクボード</h1>
      <div className="date-row">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="日付"
        />
        <span className="weekday">{date && `${weekdayOf(date)}曜日`}</span>
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
        <button type="submit">追加</button>
      </form>
      {tasks.length === 0 ? (
        <p className="empty">タスクはまだありません</p>
      ) : (
        <ul className="task-list">
          {sortedTasks.map((task) => {
            const rowClass = task.done ? 'task done' : task.important ? 'task important' : 'task'
            return (
              <li key={task.id} className={rowClass}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className="task-body">
                    <span className="task-meta">
                      {formatDate(task.date)}
                      {formatTimeRange(task) && ` ${formatTimeRange(task)}`}
                    </span>
                    <span className="task-title">{task.text}</span>
                  </span>
                </label>
                <label className="important-toggle">
                  <input
                    type="checkbox"
                    checked={task.important}
                    onChange={() => toggleImportant(task.id)}
                    aria-label="重要"
                  />
                  重要
                </label>
                <button
                  type="button"
                  className="delete-button"
                  aria-label="削除"
                  onClick={() => deleteTask(task.id)}
                >
                  削除
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default App
