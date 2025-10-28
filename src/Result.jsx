// Result.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
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

  // strengths가 text[] / jsonb / string 어떤 형태여도 안전하게 문자열로
  const strengthsToText = (v) => {
    if (!v) return "";
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "string") return v;         // 이미 join된 문자열
    if (typeof v === "object") {
      try {
        // jsonb가 {0:"...", 1:"..."} 형태인 경우 등
        const arr = Array.isArray(v) ? v : Object.values(v);
        return Array.isArray(arr) ? arr.join(", ") : "";
      } catch {
        return "";
      }
    }
    return "";
  };

  // scope 컬럼 유무에 따라 자동 fallback
  const trySelect = useCallback(async () => {
    // 1차: scope 포함해서 시도
    let q = supabase
      .from("experiences")
      .select("id, activity_on, title, description, strengths, star_s, star_t, star_a, star_r, scope")
      .order("activity_on", { ascending: false })
      .order("id", { ascending: false });

    let { data, error } = await q;
    if (error) {
      // scope가 없는 테이블이면 400이 날 수 있음 → scope 제거 후 재시도
      console.warn("[Result] select with scope failed, retrying without scope:", error.message);
      const retry = await supabase
        .from("experiences")
        .select("id, activity_on, title, description, strengths, star_s, star_t, star_a, star_r")
        .order("activity_on", { ascending: false })
        .order("id", { ascending: false });
      return retry;
    }
    return { data, error: null };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await trySelect();
    if (error) {
      console.error("[Result] load error:", error.message);
      setRows([]);
      setLoading(false);
      return;
    }
    setRows(data ?? []);
    setLoading(false);
  }, [trySelect]);

  useEffect(() => {
    load();

    // 실시간 INSERT 반영
    const ch = supabase
      .channel("experiences-list")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "experiences" },
        (payload) => setRows((prev) => [payload.new, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

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
              // scope 없으면 제목 키워드로 간단 추정 (교내/교외), 없으면 '—'
              const scope =
                r.scope ??
                (typeof r.title === "string" && /교내/.test(r.title)
                  ? "교내"
                  : typeof r.title === "string" && /교외/.test(r.title)
                  ? "교외"
                  : "—");

              return (
                <tr key={r.id}>
                  <td>{fmt(r.activity_on)}</td>
                  <td>{scope}</td>
                  <td>
                    <div className="cell-title">{r.title}</div>
                    {r.description && (
                      <div className="cell-desc">{r.description}</div>
                    )}
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
                  <td>{strengthsToText(r.strengths)}</td>
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
