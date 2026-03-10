const schedule = [
  { day: 'Monday',    hours: '6:00 AM – 10:30 PM', open: true },
  { day: 'Tuesday',   hours: '6:00 AM – 10:30 PM', open: true },
  { day: 'Wednesday', hours: '6:00 AM – 10:30 PM', open: true },
  { day: 'Thursday',  hours: '6:00 AM – 10:30 PM', open: true },
  { day: 'Friday',    hours: '6:00 AM – 10:30 PM', open: true },
  { day: 'Saturday',  hours: '6:00 AM – 10:30 PM', open: true },
  { day: 'Sunday',    hours: 'Closed',              open: false },
]

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
)

const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4400" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function Timings() {
  return (
    <section id="timings" className="section section-surface">
      <div className="container">
        <div className="timings-grid">
          <div className="reveal-left">
            <div className="about-section-label">
              <div className="line" />
              <span>Operating Hours</span>
            </div>
            <h2 className="timings-h2">Gym<br /><span className="accent">Timings</span></h2>
            <p className="timings-p">
              We're open 6 days a week with extended hours to accommodate all schedules — early morning risers and late-night lifters alike.
            </p>
            <div className="quick-time">
              <div className="qt-card">
                <div className="qt-icon"><ClockIcon /></div>
                <div>
                  <span className="qt-label">Opening</span>
                  <div className="qt-val">6:00 AM</div>
                </div>
              </div>
              <div className="qt-card">
                <div className="qt-icon"><ClockIcon /></div>
                <div>
                  <span className="qt-label">Closing</span>
                  <div className="qt-val">10:30 PM</div>
                </div>
              </div>
            </div>
          </div>
          <div className="reveal-right">
            <div className="schedule-table">
              <div className="schedule-header">
                <CalIcon />
                <span>Weekly Schedule</span>
              </div>
              {schedule.map((item) => {
                const isToday = item.day === todayName
                return (
                  <div key={item.day} className={`schedule-row${isToday ? ' today' : ''}`}>
                    <div className="day-name">
                      {isToday && <div className="today-dot" />}
                      {item.day}
                      {isToday && <span className="today-badge">Today</span>}
                    </div>
                    <span className={`day-hours${!item.open ? ' closed' : ''}`}>{item.hours}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
