// AddExperience.jsx
import { useState, useMemo } from "react";
import "./AddExperience.css";
import { supabase } from "./supabaseClient"; // ✅ Supabase 클라이언트

export default function AddExperience() {
  // 폼 상태
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [star, setStar] = useState({ s: "", t: "", a: "", r: "" });

  // UI 상태
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStrengths, setSelectedStrengths] = useState([]);
  const [saving, setSaving] = useState(false);

  // 강점 옵션
  const strengthOptions = useMemo(
    () => [
      "내적동기",
      "감성",
      "창의적 사고",
      "의사소통",
      "자기관리",
      "복합적 문제해결",
      "글로벌 마인드",
      "자기효능",
      "지식정보효능",
      "리더쉽",
      "윤리의식",
      "비판적 사고",
      "협업",
      "프레젠테이션",
      "자원 관리 능력",
    ],
    []
  );

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

  // 'YYYY.MM.DD' -> 'YYYY-MM-DD'
  const normalizeDate = (s) => {
    if (!s) return null;
    const m = s.replace(/\s/g, "").match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
  };

  // 저장 (로그인 불필요)
  const doSubmit = async () => {
    if (saving) return;

    if (!title.trim()) {
      alert("경험 활동을 입력해주세요.");
      return;
    }
    if (!date.trim()) {
      alert("날짜를 입력해주세요.");
      return;
    }

    const activity_on = normalizeDate(date);
    if (!activity_on) {
      alert("날짜 형식은 YYYY.MM.DD 입니다.");
      return;
    }
    if (selectedStrengths.length > 3) {
      alert("강점은 최대 3개까지 선택 가능합니다.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        // ✅ 로그인 없이 저장: user_id 제거
        title,
        activity_on,              // DATE 타입 권장
        description: desc,
        strengths: selectedStrengths, // text[] 또는 jsonb
        star_s: star.s,
        star_t: star.t,
        star_a: star.a,
        star_r: star.r,
      };

      const { error } = await supabase.from("experiences").insert(payload);
      if (error) {
        console.error(error);
        alert("저장 실패: " + error.message);
        return;
      }

      alert("저장되었습니다!");
      navigate("/result");
      // reset
      setTitle("");
      setDate("");
      setDesc("");
      setSelectedStrengths([]);
      setStar({ s: "", t: "", a: "", r: "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="addexp-wrap">
      <header className="addexp-header">
        <h1 className="addexp-title">경험 추가</h1>
        <button
          className="addexp-add"
          onClick={doSubmit}
          type="button"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? "SAVING..." : "ADD"}
        </button>
      </header>

      <form
        className="addexp-form"
        onSubmit={(e) => {
          e.preventDefault();
          doSubmit();
        }}
      >
        <div className="row-top">
          <div className="field-pill">
            <input
              type="text"
              placeholder="경험 활동"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-pill"
              aria-label="경험 활동"
              maxLength={100}
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
              maxLength={10}
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
            aria-label="활동 내역"
          />
        </div>

        <div className="row-bottom">
          <div className="col-left">
            {/* 강점 드롭다운 */}
            <div className="dropdown">
              <button
                type="button"
                className={`dropdown-trigger ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-controls="strength-menu"
              >
                <span>사용한 강점</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="chev"
                  aria-hidden="true"
                >
                  <path
                    d="M7 10l5 5 5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div id="strength-menu" className="dropdown-menu" role="menu">
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
                        role="menuitemcheckbox"
                        aria-checked={active}
                        aria-disabled={disabled}
                        title={
                          disabled
                            ? "최대 3개까지 선택 가능합니다."
                            : undefined
                        }
                      >
                        {opt}
                        {active && <span className="check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 선택된 강점 칩 */}
            {selectedStrengths.length > 0 && (
              <div className="chips">
                {selectedStrengths.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className="chip"
                    onClick={() => removeStrength(s)}
                    title="클릭하여 제거"
                    aria-label={`${s} 제거`}
                  >
                    {s}
                    <span className="chip-x" aria-hidden="true">
                      ×
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="col-right">
            <StarRow
              letter="S"
              placeholder="상황을 적어주세요"
              value={star.s}
              onChange={(v) => setStar((p) => ({ ...p, s: v }))}
            />
            <StarRow
              letter="T"
              placeholder="과제를 적어주세요"
              value={star.t}
              onChange={(v) => setStar((p) => ({ ...p, t: v }))}
            />
            <StarRow
              letter="A"
              placeholder="실행을 적어주세요"
              value={star.a}
              onChange={(v) => setStar((p) => ({ ...p, a: v }))}
            />
            <StarRow
              letter="R"
              placeholder="결과를 적어주세요"
              value={star.r}
              onChange={(v) => setStar((p) => ({ ...p, r: v }))}
            />
          </div>
        </div>

        <div className="submit-area">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "저장중..." : "저장하기"}
          </button>
        </div>
      </form>
    </div>
  );
}

function StarRow({ letter, value, onChange, placeholder }) {
  return (
    <div className="star-row">
      <span className="star-badge" aria-hidden="true">
        {letter}
      </span>
      <input
        type="text"
        className="star-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`STAR ${letter}`}
      />
    </div>
  );
}
