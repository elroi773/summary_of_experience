// Result.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./Result.css";

export default function Result() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // YYYY-MM-DD -> YYYY.MM.DD
  const fmt = (d) => {
    if (!d) return "";
    const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[1]}.${m[2]}.${m[3]}` : d;
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("experiences")
      // scope 컬럼이 있으면 함께 가져오고, 없으면 무시됩니다.
      .select("id, activity_on, title, description, strengths, star_s, star_t, star_a, star_r, scope")
      .order("activity_on", { ascending: false })
      .order("id", { ascending: false });
    if (!error) setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();

    // 실시간 반영(선택): 새 행이 들어오면 상단에 추가
    const ch = supabase
      .channel("experiences-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "experiences" },
        (payload) => setRows((prev) => [payload.new, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const empty = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  return (
    <div className="result-wrap">
      <header className="result-header">
        <h1 className="result-title">내 경험</h1>

        <div className="result-actions">
          <Link to="/" className="btn-ghost">홈</Link>
          <Link to="/addexperience" className="btn-primary">ADD</Link>
        </div>
      </header>

      <div className="result-table-wrap">
        <table className="result-table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>날짜</th>
              <th style={{ width: 160 }}>교외 / 교내</th>
              <th>활동 내역</th>
              <th style={{ width: 240 }}>내 강점</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="td-center">불러오는 중...</td>
              </tr>
            )}

            {empty && (
              <tr>
                <td colSpan={4} className="td-center">저장된 경험이 없습니다.</td>
              </tr>
            )}

            {rows.map((r) => {
              // scope 컬럼이 없다면 표시용으로 대시 처리
              const scope =
                r.scope ??
                // 제목에 키워드가 있으면 간단 추정(없으면 '—')
                (typeof r.title === "string" && /교내/.test(r.title)
                  ? "교내"
                  : typeof r.title === "string" && /교외/.test(r.title)
                  ? "교외"
                  : "—");

              const strengths =
                Array.isArray(r.strengths) ? r.strengths.join(", ") : "";

              return (
                <tr key={r.id}>
                  <td>{fmt(r.activity_on)}</td>
                  <td>{scope}</td>
                  <td>
                    <div className="cell-title">{r.title}</div>
                    {r.description && (
                      <div className="cell-desc">{r.description}</div>
                    )}
                    {/* 필요하면 STAR 자세히 보기 */}
                    {(r.star_s || r.star_t || r.star_a || r.star_r) && (
                      <details className="cell-star">
                        <summary>STAR 보기</summary>
                        <div className="star-item"><b>S</b> {r.star_s || "-"}</div>
                        <div className="star-item"><b>T</b> {r.star_t || "-"}</div>
                        <div className="star-item"><b>A</b> {r.star_a || "-"}</div>
                        <div className="star-item"><b>R</b> {r.star_r || "-"}</div>
                      </details>
                    )}
                  </td>
                  <td>{strengths}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="result-footer">
        <button className="btn-ghost" onClick={load}>새로고침</button>
        <span className="hint">※ SELECT RLS 정책이 필요합니다. (to anon using (true))</span>
      </div>
    </div>
  );
}
