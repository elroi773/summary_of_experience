// src/pages/MyExperience.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient"; // 경로만 프로젝트에 맞게

import "./MyExperience.css";

export default function MyExperience() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 날짜 포맷터 (YYYY.MM.DD)
  const fmt = useMemo(
    () => (isoOrDate) => {
      if (!isoOrDate) return "-";
      const d = new Date(isoOrDate);
      if (Number.isNaN(d.getTime())) return "-";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}.${m}.${day}`;
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErr("");

        // 현재 로그인 사용자
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        const userId = userData?.user?.id;

        // 필요한 칼럼만 가져오기 (프로젝트 스키마에 맞춰 조정해도 됨)
        // 예시 스키마:
        // experiences: id, user_id, activity_on (date), scope (text), title, description, strengths (string[] or text[])
        let query = supabase
          .from("experiences")
          .select("id, activity_on, scope, title, description, strengths, created_at")
          .order("activity_on", { ascending: false })
          .order("created_at", { ascending: false });

        if (userId) query = query.eq("user_id", userId);

        const { data, error } = await query;
        if (error) throw error;

        // 화면에 맞는 필드 매핑
        const mapped = (data || []).map((r) => ({
          id: r.id,
          date: r.activity_on || r.created_at,
          kind: r.scope || "교내/교외 미정",
          // 활동 내역: title 있으면 [title] + description 한 줄
          content:
            r.title && r.description
              ? `[${r.title}] ${r.description}`
              : r.title || r.description || "-",
          strengths: Array.isArray(r.strengths)
            ? r.strengths.join(", ")
            : (r.strengths || "-"),
        }));

        setRows(mapped);
      } catch (e) {
        console.error(e);
        setErr(e?.message ?? "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="exp-wrap">
      <header className="exp-header">
        <h1 className="exp-title">내 경험</h1>
        <button
          className="exp-add"
          onClick={() => navigate("/add-experience")}
          aria-label="경험 추가"
        >
          ADD
        </button>
      </header>

      <div className="exp-table-wrap">
        <table className="exp-table">
          <colgroup>
            <col style={{ width: "160px" }} />
            <col style={{ width: "200px" }} />
            <col />
            <col style={{ width: "220px" }} />
          </colgroup>
          <thead>
            <tr>
              <th>날짜</th>
              <th>교외 / 교내</th>
              <th>활동 내역</th>
              <th>내 강점</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="exp-empty">
                  불러오는 중…
                </td>
              </tr>
            )}

            {!loading && err && (
              <tr>
                <td colSpan={4} className="exp-error">
                  {err}
                </td>
              </tr>
            )}

            {!loading && !err && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="exp-empty">
                  아직 등록된 경험이 없습니다. 우측 상단 <b>ADD</b>로 추가해보세요.
                </td>
              </tr>
            )}

            {!loading &&
              !err &&
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{fmt(r.date)}</td>
                  <td>{r.kind}</td>
                  <td className="exp-content">{r.content}</td>
                  <td>{r.strengths}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
