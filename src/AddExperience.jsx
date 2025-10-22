// AddExperience.jsx
import { useState, useMemo } from "react";
import "./AddExperience.css";

export default function AddExperience() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [star, setStar] = useState({ s: "", t: "", a: "", r: "" });

  const strengthOptions = useMemo(
    () => ["내적동기","감성","창의적 사고","의사소통","자기관리","복합적 문제해결","글로벌 마인드","자기효능","지식정보효능","리더쉽","윤리의식","비판적 사고","협업","프레젠테이션","자원 관리 능력"],
    []
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStrengths, setSelectedStrengths] = useState([]);

  const toggleStrength = (name) => {
    setSelectedStrengths((prev) => {
      if (prev.includes(name)) return prev.filter((v) => v !== name);
      if (prev.length >= 3) return prev;
      return [...prev, name];
    });
  };

  const removeStrength = (name) => {
    setSelectedStrengths((prev) => prev.filter((v) => v !== name));
  };

  const doSubmit = () => {
    if (!title.trim()) { alert("경험 활동을 입력해주세요."); return; }
    if (!date.trim()) { alert("날짜를 입력해주세요."); return; }
    const payload = { title, date, desc, strengths: selectedStrengths, star };
    console.log("submit:", payload);
    alert("경험이 추가되었습니다! 콘솔을 확인하세요.");
  };

  return (
    <div className="addexp-wrap">
      <header className="addexp-header">
        <h1 className="addexp-title">경험 추가</h1>
        <button className="addexp-add" onClick={doSubmit} type="button">ADD</button>
      </header>

      <form className="addexp-form" onSubmit={(e) => { e.preventDefault(); doSubmit(); }}>
        <div className="row-top">
          <div className="field-pill">
            <input
              type="text"
              placeholder="경험 활동"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-pill"
            />
          </div>

          <div className="date-group">
            <span className="date-chip">날짜</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="YYYY.MM.DD"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-pill date-input"
              aria-label="날짜"
            />
          </div>
        </div>

        <div className="row-desc">
          <textarea
            placeholder="활동 내역"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className="textarea-neon"
          />
        </div>

        <div className="row-bottom">
          <div className="col-left">
            <div className="dropdown">
              <button
                type="button"
                className={`dropdown-trigger ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
              >
                <span>사용한 강점</span>
                <svg width="18" height="18" viewBox="0 0 24 24" className="chev">
                  <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  {strengthOptions.map((opt) => {
                    const active = selectedStrengths.includes(opt);
                    const disabled = !active && selectedStrengths.length >= 3;
                    return (
                      <button
                        type="button"
                        key={opt}
                        className={`dropdown-item ${active ? "active" : ""}`}
                        onClick={() => toggleStrength(opt)}
                        disabled={disabled}
                      >
                        {opt}
                        {active && <span className="check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="col-right">
            <StarRow letter="S" placeholder="상황을 적어주세요"
              value={star.s} onChange={(v) => setStar((p) => ({ ...p, s: v }))} />
            <StarRow letter="T" placeholder="과제를 적어주세요"
              value={star.t} onChange={(v) => setStar((p) => ({ ...p, t: v }))} />
            <StarRow letter="A" placeholder="실행을 적어주세요"
              value={star.a} onChange={(v) => setStar((p) => ({ ...p, a: v }))} />
            <StarRow letter="R" placeholder="결과를 적어주세요"
              value={star.r} onChange={(v) => setStar((p) => ({ ...p, r: v }))} />
          </div>
        </div>

        <div className="submit-area">
          <button type="submit" className="btn-primary">저장하기</button>
        </div>
      </form>
    </div>
  );
}

function StarRow({ letter, value, onChange, placeholder }) {
  return (
    <div className="star-row">
      <span className="star-badge">{letter}</span>
      <input
        type="text"
        className="star-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
