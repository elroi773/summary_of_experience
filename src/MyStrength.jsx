import React from 'react';
import './MyStrength.css';

export default function MyStrength() {
  // 👉 네가 나중에 바꾸면 되는 부분
  const top5 = ['#도전정신', '#창의력', '#성실함', '#공감능력', '#리더십'];
  const another10 = [
    '#끈기', '#책임감', '#팀워크', '#적응력', '#소통',
    '#유머감각', '#정직함', '#배려심', '#분석력', '#감성적 사고'
  ];

  return (
    <div className="strength-container">
      <h1 className="strength-title">내 강점</h1>

      <div className="section">
        <h2 className="subtitle">Top 5</h2>
        <div className="tags">
          {top5.map((tag, i) => (
            <span key={i} className="tag-bright">{tag}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="subtitle">Another 10</h2>
        <div className="tags">
          {another10.map((tag, i) => (
            <span key={i} className="tag-dim">{tag}</span>
          ))}
        </div>
      </div>

      <button className="next-btn">NEXT</button>
    </div>
  );
};